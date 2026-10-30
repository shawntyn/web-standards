import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import type { Project } from "../packages/domain/src/index";
import {
  getProject,
  getProjects,
  homeSpec,
  validateSpec,
} from "../packages/data/src/index";
import { contentToSpec } from "../packages/render/src/content-to-spec";
import { SpecView } from "../packages/render/src/index";

function project(slug: string, name = slug): Project {
  return {
    slug,
    name,
    description: `${name} 的简介`,
    content: {
      id: `${slug}-title`,
      type: "h1",
      props: { text: `${name} 的正文` },
    },
  };
}

async function withDirectory(run: (directory: string) => Promise<void>) {
  const directory = await mkdtemp(join(tmpdir(), "web-standards-projects-"));
  try {
    await run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("目录增删 JSON 后重新读取即可更新首页和详情", async () => {
  await withDirectory(async (directory) => {
    assert.deepEqual(await getProjects(directory), []);
    await writeFile(
      join(directory, "z.json"),
      JSON.stringify(project("first")),
    );
    await writeFile(
      join(directory, "a.json"),
      JSON.stringify(project("second")),
    );
    let projects = await getProjects(directory);
    // 顺序由文件名决定，查询和 URL 则由 JSON 的 slug 决定。
    assert.deepEqual(
      projects.map((item) => item.slug),
      ["second", "first"],
    );
    assert.equal(getProject("a", projects), undefined);
    assert.equal(getProject("second", projects)?.slug, "second");

    await writeFile(
      join(directory, "m.json"),
      JSON.stringify(project("nebula", "新来的星云")),
    );
    projects = await getProjects(directory);
    assert.deepEqual(
      projects.map((item) => item.slug),
      ["second", "nebula", "first"],
    );
    const home = renderToString(
      createElement(SpecView, { spec: validateSpec(homeSpec(projects)) }),
    );
    assert.match(home, /href="\/projects\/nebula"[^>]*>打开 新来的星云<\/a>/);
    const added = getProject("nebula", projects);
    assert.ok(added);
    const detail = renderToString(
      createElement(SpecView, {
        spec: validateSpec(contentToSpec(added.content)),
      }),
    );
    assert.match(detail, /<h1[^>]*>新来的星云 的正文<\/h1>/);

    await rm(join(directory, "m.json"));
    projects = await getProjects(directory);
    assert.equal(getProject("nebula", projects), undefined);
    const afterRemoval = renderToString(
      createElement(SpecView, { spec: validateSpec(homeSpec(projects)) }),
    );
    assert.doesNotMatch(afterRemoval, /\/projects\/nebula|新来的星云/);
  });
});

test("只读取直接子级普通 JSON 文件，忽略其他文件、目录和符号链接", async () => {
  await withDirectory(async (directory) => {
    const projectsDirectory = join(directory, "projects");
    await mkdir(projectsDirectory);
    await writeFile(
      join(projectsDirectory, "valid.json"),
      JSON.stringify(project("valid")),
    );
    await writeFile(join(projectsDirectory, "notes.txt"), "不是 JSON");
    await mkdir(join(projectsDirectory, "nested.json"));
    await writeFile(join(projectsDirectory, "nested.json", "broken.json"), "{");
    const outside = join(directory, "outside.json");
    await writeFile(outside, JSON.stringify(project("outside")));
    await symlink(outside, join(projectsDirectory, "linked.json"));

    const projects = await getProjects(projectsDirectory);
    assert.deepEqual(
      projects.map((item) => item.slug),
      ["valid"],
    );
    assert.equal(getProject("../outside", projects), undefined);
    assert.equal(getProject("outside", projects), undefined);
  });
});

test("foo 和 foo-link 两个合法项目各自生成独立卡片与详情链接", async () => {
  await withDirectory(async (directory) => {
    await writeFile(
      join(directory, "a.json"),
      JSON.stringify(project("foo", "Foo 项目")),
    );
    await writeFile(
      join(directory, "b.json"),
      JSON.stringify(project("foo-link", "Foo Link 项目")),
    );
    const projects = await getProjects(directory);
    const html = renderToString(
      createElement(SpecView, { spec: validateSpec(homeSpec(projects)) }),
    );
    assert.equal((html.match(/<section\b/g) ?? []).length, 2);
    assert.match(html, /<h3[^>]*>Foo 项目<\/h3>/);
    assert.match(html, /<h3[^>]*>Foo Link 项目<\/h3>/);
    const cardLinks = [
      ...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>打开 ([^<]+)<\/a>/g),
    ].map((match) => ({ href: match[1], label: match[2] }));
    assert.deepEqual(cardLinks, [
      { href: "/projects/foo", label: "Foo 项目" },
      { href: "/projects/foo-link", label: "Foo Link 项目" },
    ]);
  });
});

test("损坏 JSON 和不符合项目 schema 的文件明确报错", async () => {
  await withDirectory(async (directory) => {
    const path = join(directory, "broken.json");
    for (const raw of [
      "{",
      JSON.stringify({ slug: "missing-fields" }),
      JSON.stringify({
        ...project("invalid"),
        content: { id: "title", type: "p", props: { text: 123 } },
      }),
      JSON.stringify({
        ...project("invalid"),
        content: {
          id: "title",
          type: "h1",
          props: { text: "标题", level: 2 },
        },
      }),
    ]) {
      await writeFile(path, raw);
      await assert.rejects(getProjects(directory));
    }
    await assert.rejects(getProjects(join(directory, "missing-directory")));
  });
});

test("不同文件的重复 slug 明确报错", async () => {
  await withDirectory(async (directory) => {
    await writeFile(join(directory, "a.json"), JSON.stringify(project("same")));
    await writeFile(join(directory, "b.json"), JSON.stringify(project("same")));
    await assert.rejects(getProjects(directory), /项目 slug 必须唯一/);
  });
});
