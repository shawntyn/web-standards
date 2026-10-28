import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { analyticsToSpec, getAnalytics } from "../packages/data/src/index";
import { contentToSpec } from "../packages/render/src/content-to-spec";
import { SpecView } from "../packages/render/src/index";
import display from "../packages/data/src/analytics/display.json";

test("一次显式 map 将查询字段变为单元格，保留顺序和零值且不改源数据", () => {
  const data = getAnalytics("commerce")!;
  const before = structuredClone(data);
  const spec = analyticsToSpec(data);
  assert.deepEqual(spec.elements["channels-table"].props.rows, [
    ["自然搜索", "8"],
    ["直接访问", "5"],
    ["邮件", "0"],
  ]);
  assert.deepEqual(data, before);
  assert.deepEqual(
    spec.elements[spec.root].children,
    contentToSpec(display).elements[spec.root].children,
  );
  assert.deepEqual(
    contentToSpec(display).elements["channels-table"].props.rows,
    [],
  );
  const changed = analyticsToSpec({
    channels: [{ channel_name: "新渠道", order_count: 2 }],
  });
  assert.deepEqual(changed.elements["channels-table"].props.rows, [
    ["新渠道", "2"],
  ]);
});

test("实际 Renderer 输出表格与明确空状态，不把 0 误判为空", () => {
  for (const slug of ["commerce", "empty"]) {
    const html = renderToString(
      createElement(SpecView, { spec: analyticsToSpec(getAnalytics(slug)) }),
    );
    assert.match(html, /<caption[^>]*>渠道订单明细<\/caption>/);
    assert.match(html, /scope="col"/);
    if (slug === "empty")
      assert.match(html, /colSpan="2"[^>]*>暂无数据<\/td>/i);
    else {
      assert.match(html, /<td[^>]*>0<\/td>/);
      assert.doesNotMatch(html, /暂无数据/);
    }
  }
});

test("白名单拒绝未知参数，查询契约拒绝多余字段和非法计数", () => {
  for (const slug of [
    "missing",
    "COMMERCE",
    "constructor",
    "__proto__",
    "../commerce",
    "",
  ])
    assert.equal(getAnalytics(slug), undefined);
  for (const count of [-1, NaN, Infinity, null, "2", 1.5])
    assert.throws(() =>
      analyticsToSpec({
        channels: [{ channel_name: "渠道", order_count: count }],
      }),
    );
  assert.throws(() => analyticsToSpec({ channels: [], unused: true }));
  assert.throws(() =>
    analyticsToSpec({
      channels: [{ channel_name: "渠道", order_count: 1, secret: "unused" }],
    }),
  );
});
