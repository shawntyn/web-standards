import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

// 先 pnpm build；仅在检查期间启动本地生产服务。
const root = process.cwd();
const origin = "http://127.0.0.1:3200";
const checks = [];
const directory = resolve(root, "packages/data/src/projects");
const files = (await readdir(directory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
  .map((entry) => entry.name)
  .sort();
const projects = await Promise.all(
  files.map(async (file) =>
    JSON.parse(await readFile(resolve(directory, file), "utf8")),
  ),
);
const temporaryFile = resolve(directory, `verify-${randomUUID()}.json`);
let temporaryFileCreated = false;
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

function navigationFrom(html, path) {
  const navigation = html.match(/<nav\b[^>]*>[\s\S]*?<\/nav>/g) ?? [];
  assert.equal(navigation.length, 1, `${path} 只有一份导航`);
  assert.equal(
    (html.match(/<main\b/g) ?? []).length,
    1,
    `${path} 只有一个 main`,
  );
  assert.match(navigation[0], /aria-label="主导航"/);
  return navigation[0];
}

function rscDataFrom(html) {
  return [
    ...html.matchAll(
      /<script\b[^>]*>self\.__next_f\.push\(([\s\S]*?)\)<\/script>/g,
    ),
  ]
    .map((match) => JSON.parse(match[1]))
    .filter(([type]) => type === 1)
    .map(([, data]) => data)
    .join("");
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
    ["/page", "/projects/[slug]/page"],
  );

  // 部署追踪必须包含项目 JSON，不能只在开发目录里恰好可读。
  for (const route of ["page", "projects/[slug]/page", "_not-found/page"]) {
    const tracePath = resolve(
      root,
      `apps/web/.next/server/app/${route}.js.nft.json`,
    );
    const trace = JSON.parse(await readFile(tracePath, "utf8"));
    const tracedFiles = trace.files.map((file) =>
      resolve(dirname(tracePath), file),
    );
    for (const file of files)
      assert.ok(
        tracedFiles.includes(resolve(directory, file)),
        `${route} 追踪 ${file}`,
      );
  }

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
  assert.doesNotMatch(pages.get("/projects/atlas"), /了解数据结构/);
  assert.doesNotMatch(pages.get("/projects/orbit"), /整理首页内容/);
  for (const project of projects) {
    const path = `/projects/${project.slug}`;
    if (!pages.has(path)) pages.set(path, await inspect(path));
  }

  // 主导航必须与项目集合一致；正文中的链接由各 JSON 自行声明。
  for (const [path, html] of pages) {
    const navigation = navigationFrom(html, path);
    const links = [...navigation.matchAll(/<a\b[^>]*href="(\/[^"#]*)"/g)].map(
      (match) => match[1],
    );
    assert.deepEqual(links.sort(), [...pages.keys()].sort(), path);
    assert.doesNotMatch(html, /<form|<input|<textarea/);
    assert.doesNotMatch(navigation, /href="\/analytics(?:\/|")/);
  }
  for (const path of pages.keys()) await inspect(path);
  await inspect("/projects/%61tlas", 200, /Atlas 项目/);
  for (const slug of [
    "missing",
    "constructor",
    "__proto__",
    "ATLAS",
    "atlas/extra",
    "field",
  ]) {
    if (!projects.some((project) => project.slug === slug))
      await inspect(`/projects/${slug}`, 404, /404 · 没有找到内容/);
  }
  for (const path of [
    "/projects",
    "/standards",
    "/components/card",
    "/analytics",
    "/analytics/commerce",
    "/analytics/empty",
    "/analytics/zero",
    "/analytics/missing",
    "/analytics/%63ommerce",
    "/api/projects",
    "/api/projects/atlas",
  ])
    await inspect(path, 404);
  await inspect("/api/projects", 404, undefined, "POST");
  await inspect("/api/projects/atlas", 404, undefined, "PATCH");

  // 在同一生产进程运行期间加文件、改内容、删文件，无需构建或改代码。
  const added = {
    slug: `verify-${randomUUID()}`,
    name: "自动发现项目",
    description: "只添加 JSON 的生产验证",
    content: { id: "shell", type: "h1", props: { text: "动态新增正文" } },
  };
  await writeFile(temporaryFile, JSON.stringify(added), { flag: "wx" });
  temporaryFileCreated = true;
  const addedPath = `/projects/${added.slug}`;
  const addedHome = await inspect("/");
  const addedNavigation = navigationFrom(addedHome, "/");
  assert.ok(addedHome.includes(`href="${addedPath}"`));
  assert.match(addedHome, /打开 自动发现项目/);
  assert.match(addedNavigation, /自动发现项目/);
  const addedDetail = await inspect(
    addedPath,
    200,
    /<h1[^>]*>动态新增正文<\/h1>/,
  );
  assert.match(addedDetail, /<title>自动发现项目 \| Web Standard<\/title>/);
  assert.equal(navigationFrom(addedDetail, addedPath), addedNavigation);
  const missing = await inspect(
    "/projects/verify_missing",
    404,
    /404 · 没有找到内容/,
  );
  // 动态 notFound() 可能只在 RSC 中传输外壳，以下检查不代表首屏导航 HTML。
  // 浏览器恢复后的 nav/main 和导航行为另做真实浏览器验证。
  const missingData = rscDataFrom(missing);
  assert.match(missingData, /"aria-label":"主导航"/);
  assert.ok(
    missingData.includes(`"href":${JSON.stringify(addedPath)}`),
    "动态路由 404 的 RSC 包含新项目链接",
  );
  assert.ok(
    missingData.includes(`"children":${JSON.stringify(added.name)}`),
    "动态路由 404 的 RSC 包含新项目导航文字",
  );
  const unmatched = await inspect("/verify-missing", 404, /404 · 没有找到内容/);
  assert.equal(
    navigationFrom(unmatched, "/verify-missing"),
    addedNavigation,
    "全局 404 使用同一份 layout 导航",
  );

  added.name = "自动发现已更新";
  await writeFile(temporaryFile, JSON.stringify(added));
  const updatedHome = await inspect("/");
  assert.match(updatedHome, /打开 自动发现已更新/);
  assert.match(navigationFrom(updatedHome, "/"), /自动发现已更新/);
  await unlink(temporaryFile);
  temporaryFileCreated = false;
  const removedHome = await inspect("/");
  assert.ok(!removedHome.includes(`href="${addedPath}"`));
  navigationFrom(removedHome, "/");
  const removedDetail = await inspect(addedPath, 404, /404 · 没有找到内容/);
  const removedData = rscDataFrom(removedDetail);
  assert.match(removedData, /"aria-label":"主导航"/);
  assert.ok(
    !removedData.includes(`"href":${JSON.stringify(addedPath)}`),
    "删除项目后的 404 RSC 不再包含该项目链接",
  );

  await writeFile(
    resolve(root, "docs/validation/http-simplified.json"),
    JSON.stringify({ verifiedAt: new Date().toISOString(), checks }, null, 2) +
      "\n",
  );
  console.log(
    `${checks.length} 项生产 HTTP 检查通过：项目 SSR、导航、真实 404，以及运行中新增、更新和删除 JSON。`,
  );
} finally {
  try {
    if (temporaryFileCreated) await unlink(temporaryFile);
  } finally {
    if (server.exitCode === null) {
      server.kill("SIGTERM");
      await once(server, "exit");
    }
  }
}
