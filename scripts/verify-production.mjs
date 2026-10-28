import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// 先 pnpm build；仅在检查期间启动本地生产服务。
const root = process.cwd();
const origin = "http://127.0.0.1:3200";
const checks = [];
const server = spawn(
  process.execPath,
  [
    resolve(root, "apps/web/node_modules/next/dist/bin/next"),
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3200",
  ],
  { cwd: resolve(root, "apps/web"), stdio: ["ignore", "ignore", "inherit"] },
);

async function inspect(path, status = 200, pattern, method = "GET") {
  const response = await fetch(`${origin}${path}`, { method });
  const html = await response.text();
  assert.equal(response.status, status, `${method} ${path}`);
  if (pattern) assert.match(html, pattern, path);
  assert.doesNotMatch(html, /NEXT_HTTP_ERROR_FALLBACK;500/);
  checks.push({ method, path, status });
  return html;
}

try {
  let ready = false;
  for (let retry = 0; retry < 100; retry++) {
    if (server.exitCode !== null)
      throw new Error(`生产服务退出：${server.exitCode}`);
    try {
      if ((await fetch(origin)).ok) {
        ready = true;
        break;
      }
    } catch {
      /* 服务启动中。 */
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  assert.ok(ready, "生产服务启动");

  const manifest = JSON.parse(
    await readFile(
      resolve(root, "apps/web/.next/server/app-paths-manifest.json"),
      "utf8",
    ),
  );
  assert.deepEqual(
    Object.keys(manifest)
      .filter((path) => !path.startsWith("/_"))
      .sort(),
    ["/analytics/[slug]/page", "/page", "/projects/[slug]/page"],
  );

  const pages = new Map();
  pages.set("/", await inspect("/", 200, /<h1[^>]*>从数据到页面<\/h1>/));
  pages.set(
    "/projects/atlas",
    await inspect("/projects/atlas", 200, /<li>整理首页内容<\/li>/),
  );
  pages.set(
    "/projects/orbit",
    await inspect("/projects/orbit", 200, /<caption[^>]*>阅读计划<\/caption>/),
  );
  pages.set(
    "/analytics/commerce",
    await inspect("/analytics/commerce", 200, /<td[^>]*>0<\/td>/),
  );
  pages.set(
    "/analytics/empty",
    await inspect("/analytics/empty", 200, /暂无数据/),
  );
  assert.doesNotMatch(pages.get("/projects/atlas"), /了解数据结构/);
  assert.doesNotMatch(pages.get("/projects/orbit"), /整理首页内容/);
  assert.doesNotMatch(pages.get("/analytics/commerce"), /暂无数据/);
  assert.doesNotMatch(pages.get("/analytics/empty"), /自然搜索/);

  // 检查每个页面实际生成的全部站内导航目标。
  const links = new Set();
  for (const html of pages.values()) {
    assert.match(html, /<main/);
    assert.match(html, /<nav[^>]*aria-label="主导航"/);
    for (const match of html.matchAll(/<a\b[^>]*href="(\/[^"#]*)"/g))
      links.add(match[1]);
    assert.doesNotMatch(html, /<form|<input|<textarea|sessionStorage/);
  }
  assert.deepEqual([...links].sort(), [...pages.keys()].sort());
  for (const path of links) await inspect(path);
  await inspect("/projects/%61tlas", 200, /Atlas 项目/);
  await inspect("/analytics/%63ommerce", 200, /自然搜索/);

  for (const prefix of ["/projects", "/analytics"]) {
    for (const slug of [
      "missing",
      "constructor",
      "__proto__",
      "INVALID",
      "atlas/extra",
    ]) {
      await inspect(`${prefix}/${slug}`, 404, /404 · 没有找到内容/);
    }
    await inspect(prefix, 404);
  }
  for (const path of [
    "/standards",
    "/components/card",
    "/projects/field",
    "/analytics/zero",
    "/api/projects",
    "/api/projects/atlas",
  ])
    await inspect(path, 404);
  await inspect("/api/projects", 404, undefined, "POST");
  await inspect("/api/projects/atlas", 404, undefined, "PATCH");

  await writeFile(
    resolve(root, "docs/validation/http-simplified.json"),
    JSON.stringify({ verifiedAt: new Date().toISOString(), checks }, null, 2) +
      "\n",
  );
  console.log(
    `${checks.length} 项生产 HTTP 检查通过：三个路由、SSR、全部导航目标、零值/空态、无效参数及旧入口。`,
  );
} finally {
  if (server.exitCode === null) {
    server.kill("SIGTERM");
    await once(server, "exit");
  }
}
