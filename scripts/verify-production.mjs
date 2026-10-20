import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// Run after `pnpm build`. Starts real Next production servers for this check only.
const root = process.cwd();
const checks = [];
const servers = [];
const apps = [
  { name: "web", port: 3200 },
  { name: "docs", port: 3201 },
];
async function inspect(app, path, status = 200, pattern) {
  const response = await fetch(`http://127.0.0.1:${app.port}${path}`);
  const html = await response.text();
  assert.equal(response.status, status, `${app.name} ${path}`);
  if (pattern) assert.match(html, pattern);
  if (status === 200) assert.doesNotMatch(html, /NEXT_HTTP_ERROR_FALLBACK;500/);
  checks.push({ app: app.name, method: "GET", path, status });
  return html;
}
try {
  for (const app of apps) {
    const child = spawn(
      process.execPath,
      [
        resolve(root, `apps/${app.name}/node_modules/next/dist/bin/next`),
        "start",
        "--hostname",
        "127.0.0.1",
        "--port",
        String(app.port),
      ],
      {
        cwd: resolve(root, `apps/${app.name}`),
        stdio: ["ignore", "ignore", "inherit"],
      },
    );
    servers.push(child);
    let ready = false;
    for (let retry = 0; retry < 100; retry++) {
      if (child.exitCode !== null)
        throw new Error(`${app.name} server exited ${child.exitCode}`);
      try {
        const response = await fetch(`http://127.0.0.1:${app.port}`);
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {
        /* Starting. */
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    assert.ok(ready, `${app.name} production server ready`);
  }
  const [web, docs] = apps;
  await inspect(web, "/", 200, /从数据走到页面/);
  await inspect(web, "/projects", 200, /项目工作台/);
  await inspect(web, "/standards", 200, /清晰边界/);
  const atlas = await inspect(web, "/projects/atlas", 200, /试算团队容量/);
  const orbit = await inspect(
    web,
    "/projects/orbit",
    200,
    /一个可以带走的格式/,
  );
  const field = await inspect(web, "/projects/field", 200, /首周激活漏斗/);
  for (const html of [atlas, orbit, field]) assert.match(html, /<h1/);
  assert.match(atlas, /capacity-input/);
  assert.match(orbit, /<blockquote>/);
  assert.match(field, /<table/);
  for (const html of [orbit, field])
    assert.doesNotMatch(html, /capacity-input/);
  await inspect(web, "/projects/missing", 404);
  await inspect(docs, "/", 200, /内容驱动渲染/);
  for (const slug of [
    "content",
    "primitives",
    "card",
    "button",
    "metric",
    "slot",
    "table",
    "form",
    "workflow",
  ]) {
    const html = await inspect(docs, `/components/${slug}`);
    assert.doesNotMatch(html, /"digest":"[0-9]+"/);
  }
  await inspect(docs, "/components/missing", 404);
  const project = JSON.parse(
    await readFile(
      resolve(root, "packages/data/src/projects/atlas.json"),
      "utf8",
    ),
  );
  for (const app of apps) {
    for (const [method, path, body, status] of [
      ["POST", "/api/projects", { project }, 201],
      ["PATCH", "/api/projects/atlas", { project }, 200],
      [
        "POST",
        "/api/projects",
        {
          project: {
            ...project,
            content: { id: "bad", type: "unknown", props: {} },
          },
        },
        422,
      ],
      ["POST", "/api/projects", { project, simulateError: true }, 503],
      ["PATCH", "/api/projects/other", { project }, 409],
    ]) {
      const response = await fetch(`http://127.0.0.1:${app.port}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      assert.equal(response.status, status);
      const json = await response.json();
      if (status < 300) {
        assert.equal(json.meta.serverStored, false);
        assert.deepEqual(json.data.content, project.content);
      }
      checks.push({ app: app.name, method, path, status });
    }
  }
  const data = JSON.parse(await inspect(web, "/api/projects"));
  assert.equal((data.data ?? data).length, 3);
  const report = { verifiedAt: new Date().toISOString(), checks };
  await writeFile(
    resolve(root, "docs/validation/http-declarative.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    `${checks.length} production HTTP checks passed. SSR declared tree differences and API content preservation verified.`,
  );
} finally {
  for (const child of servers) child.kill("SIGTERM");
}
