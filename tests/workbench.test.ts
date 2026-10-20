import { test, before, after, afterEach } from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import {
  handleMockMutation,
  parseDraft,
  toDraft,
  saveProject,
  STORAGE_KEY,
} from "../packages/domain/src/index";
import { projects, workbenchSpec } from "../packages/data/src/index";
import { SpecView } from "../packages/render/src/index";
import { ProjectWorkbench } from "../packages/render/src/workbench/project-workbench";
import { workbenchToSpec } from "../packages/render/src/workbench/mapping";
import { workbenchCatalog } from "../packages/render/src/workbench/catalog";
let testing: typeof import("@testing-library/react");
let userEvent: typeof import("@testing-library/user-event").default;
const dom = new Window({ url: "http://localhost:3000/projects" });
const originalFetch = globalThis.fetch;
before(async () => {
  Object.defineProperty(globalThis, "navigator", {
    value: dom.navigator,
    configurable: true,
  });
  Object.assign(globalThis, {
    window: dom,
    document: dom.document,

    HTMLElement: dom.HTMLElement,
    HTMLInputElement: dom.HTMLInputElement,
    sessionStorage: dom.sessionStorage,
    requestAnimationFrame: (callback: FrameRequestCallback) =>
      setTimeout(() => callback(0), 0),
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  testing = await import("@testing-library/react");
  userEvent = (await import("@testing-library/user-event")).default;
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input), "http://localhost:3000");
    const request = new Request(url, init);
    return handleMockMutation(
      request,
      init?.method === "PATCH" ? url.pathname.split("/").at(-1) : undefined,
    );
  };
});
afterEach(() => {
  testing.cleanup();
  dom.sessionStorage.clear();
});
after(() => {
  globalThis.fetch = originalFetch;
  dom.happyDOM.abort();
});
test("workbench SSR renders table rows and valid catalog spec", () => {
  const spec = workbenchSpec();
  const html = renderToString(createElement(SpecView, { spec }));
  assert.match(html, /<table/);
  assert.match(html, /Atlas 工作空间/);
  assert.match(html, /新建项目/);
  assert.equal(
    parseDraft({ ...toDraft(projects[0]), members: "" }).success,
    false,
  );
});
test("domain maps records and field definitions into catalog nodes", () => {
  const spec = workbenchToSpec({
    records: projects,
    query: "",
    status: "",
    busy: false,
    ready: true,
    draft: toDraft(projects[0]),
    originalSlug: "atlas",
    errors: {},
    message: "",
    failure: false,
    simulateError: false,
    selectedSlug: "atlas",
  });
  assert.equal(workbenchCatalog.validate(spec).success, true);
  assert.equal(spec.elements["row-atlas"].type, "ProjectRow");
  assert.equal(spec.elements["field-name"].type, "ProjectField");
});
test("API verifies malformed input, shared validation, immutable slug and simulated errors", async () => {
  const post = (body: unknown, slug?: string) =>
    handleMockMutation(
      new Request("https://example.test/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      slug,
    );
  assert.equal(
    (await post({ project: { ...projects[0], members: 0 } })).status,
    422,
  );
  assert.equal((await post({ project: projects[0] }, "other")).status, 409);
  assert.equal(
    (await post({ project: projects[0], simulateError: true })).status,
    503,
  );
  const response = await post({ project: projects[0] });
  assert.equal(response.status, 201);
  assert.equal((await response.json()).meta.serverStored, false);
  assert.throws(() => saveProject(projects, projects[0], null), /已存在/);
  assert.equal(
    (
      await handleMockMutation(
        new Request("https://example.test", { method: "POST", body: "{" }),
      )
    ).status,
    400,
  );
});
test("actual editor validates, creates, edits, cancels, filters, persists and recovers from server failure", async () => {
  const user = userEvent.setup({
    document: dom.document as unknown as Document,
  });
  const result = testing.render(
    createElement(ProjectWorkbench, { initialProjects: projects }),
  );
  const byLabel = (text: string) =>
    result.getByLabelText(text, { exact: false });
  await testing.waitFor(() =>
    assert.equal(
      (result.getByRole("button", { name: "新建项目" }) as HTMLButtonElement)
        .disabled,
      false,
    ),
  );
  await user.click(result.getByRole("button", { name: "新建项目" }));
  await user.click(result.getByRole("button", { name: "保存项目" }));
  assert.ok(result.getByText("请修正标记的字段后再保存。"));
  await user.type(byLabel("项目名称"), "Test 新建项目");
  await user.type(byLabel("项目标识"), "test-project");
  await user.type(byLabel("项目描述"), "这是完整交互测试创建的项目描述。");
  await user.click(result.getByRole("button", { name: "保存项目" }));
  await testing.waitFor(() =>
    assert.ok(result.getByText(/已创建「Test 新建项目」/)),
  );
  assert.ok(result.getByRole("button", { name: "编辑 Test 新建项目" }));
  assert.ok(dom.sessionStorage.getItem(STORAGE_KEY)?.includes("test-project"));
  await user.click(result.getByRole("button", { name: "编辑 Test 新建项目" }));
  await user.clear(byLabel("项目名称"));
  await user.type(byLabel("项目名称"), "Test 修改名称");
  await user.click(result.getByRole("checkbox"));
  await user.click(result.getByRole("button", { name: "保存项目" }));
  await testing.waitFor(() =>
    assert.ok(result.getByText(/模拟服务端错误：数据未保存/)),
  );
  assert.ok(result.getByRole("button", { name: "编辑 Test 新建项目" }));
  await user.click(result.getByRole("checkbox"));
  await user.click(result.getByRole("button", { name: "保存项目" }));
  await testing.waitFor(() =>
    assert.ok(result.getByText(/已更新「Test 修改名称」/)),
  );
  assert.ok(result.getByText("Test 修改名称 · 会话详情"));
  await user.click(result.getByRole("button", { name: "编辑 Test 修改名称" }));
  await user.clear(byLabel("项目名称"));
  await user.type(byLabel("项目名称"), "不应保存的名字");
  await user.click(result.getByRole("button", { name: "取消" }));
  assert.ok(result.getByRole("button", { name: "编辑 Test 修改名称" }));
  assert.equal(result.queryByText("不应保存的名字"), null);
  await user.type(byLabel("搜索项目"), "does-not-exist");
  assert.ok(result.getByText(/没有匹配的项目/));
  result.unmount();
  const remount = testing.render(
    createElement(ProjectWorkbench, { initialProjects: projects }),
  );
  await testing.waitFor(() =>
    assert.ok(remount.getByRole("button", { name: "编辑 Test 修改名称" })),
  );
});
