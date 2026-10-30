import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { Grid } from "../packages/ui/src/index";
const ui = new URL("../packages/ui/src/", import.meta.url);

test("UI 入口只导出，每个独立组件一个文件", () => {
  const barrel = readFileSync(new URL("index.ts", ui), "utf8");
  assert.doesNotMatch(barrel, /function|<[A-Za-z]/);
  for (const file of readdirSync(new URL("components/", ui))) {
    const source = readFileSync(new URL(`components/${file}`, ui), "utf8");
    assert.equal((source.match(/export function /g) ?? []).length, 1, file);
  }
});

test("共享 CSS 仅 tokens 和 base；网格使用完整 Tailwind 类名", () => {
  const css = readFileSync(new URL("styles.css", ui), "utf8");
  assert.match(css, /@theme/);
  assert.match(css, /@layer base/);
  assert.doesNotMatch(css, /@apply|\.[a-zA-Z][\w-]*\s*[:{,>]/);
  for (const columns of [1, 2, 3, 4] as const) {
    const html = renderToString(createElement(Grid, { columns }, "内容"));
    assert.ok(html.includes(`min-[851px]:grid-cols-${columns}`));
    assert.doesNotMatch(html, /style=/);
  }
});
