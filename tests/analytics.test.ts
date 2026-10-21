import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import {
  analyticsDisplay,
  analyticsToSpec,
  queryAnalytics,
} from "../packages/data/src/index";
import { SpecView } from "../packages/render/src/index";
import type { ContentBlock } from "../packages/domain/src/index";
function find(root: ContentBlock, id: string): ContentBlock | undefined {
  return root.id === id
    ? root
    : [...(root.children ?? []), ...Object.values(root.slots ?? {}).flat()]
        .map((n) => find(n, id))
        .find(Boolean);
}
test("query rows map explicitly to chart points, goals and table; preserve zero/order", async () => {
  const rows = (await queryAnalytics("commerce"))!;
  const before = structuredClone(rows);
  const spec = analyticsToSpec(rows);
  assert.deepEqual(
    spec.elements["daily-chart"].props.points,
    rows.daily.map((r) => ({ label: r.day, value: r.order_count })),
  );
  assert.deepEqual(
    spec.elements["query-table"].props.rows,
    rows.channels.map((r) => [r.channel_name, String(r.order_count)]),
  );
  assert.deepEqual(
    spec.elements["team-progress"].props.items,
    rows.goals.map((r) => ({
      label: r.team_name,
      value: r.completed_count,
      max: r.target_count,
    })),
  );
  assert.deepEqual(rows, before);
  assert.equal(spec.elements["daily-chart"].type, "LineChart");
});
test("presentation titles, order, removal and slots remain authored", async () => {
  const config = structuredClone(analyticsDisplay);
  const root = config.content;
  find(root, "daily-chart")!.props.title = "自定义查询标题";
  root.children = root
    .children!.filter((n) => n.id !== "analytics-title")
    .reverse();
  root.children.push({
    id: "extra",
    type: "Card",
    props: { title: "显式扩展" },
    slots: {
      footer: [{ id: "footer", type: "p", props: { text: "来自配置" } }],
    },
  });
  const spec = analyticsToSpec(await queryAnalytics("commerce"), config);
  assert.equal(spec.elements["daily-chart"].props.title, "自定义查询标题");
  assert.equal(spec.elements["analytics-title"], undefined);
  assert.deepEqual(
    spec.elements[spec.root].children,
    root.children.map((n) => n.id),
  );
  assert.deepEqual(spec.elements.extra.slots?.footer, ["footer"]);
  assert.match(
    String(spec.elements["config-inspector"].props.code),
    /自定义查询标题/,
  );
});
test("SSR renders data and accessible zero/empty states via actual registry", async () => {
  for (const slug of ["commerce", "empty", "zero"]) {
    const spec = analyticsToSpec(await queryAnalytics(slug));
    const html = renderToString(createElement(SpecView, { spec }));
    assert.match(html, /<h1/);
    assert.doesNotMatch(html, /(?:NaN|Infinity)/);
    if (slug === "empty") assert.match(html, /此查询没有返回记录/);
    else {
      assert.match(html, /<svg/);
      assert.match(html, /<table/);
      assert.match(html, /role="img"/);
      assert.match(html, /<progress/);
      assert.match(html, /自然搜索/);
    }
    if (slug === "zero") assert.match(html.replaceAll("<!-- -->", ""), /0\.0%/);
  }
});
test("unknown query scenario is absent; invalid rows/bindings rejected", async () => {
  assert.equal(await queryAnalytics("missing"), undefined);
  const rows = (await queryAnalytics("commerce"))!;
  rows.daily[0].order_count = -1;
  assert.throws(() => analyticsToSpec(rows));
  rows.daily[0].order_count = Number.NaN;
  assert.throws(() => analyticsToSpec(rows));
  const config = structuredClone(analyticsDisplay);
  config.bindings[0].nodeId = "missing";
  assert.throws(() =>
    analyticsToSpec(
      { daily: [], channels: [], statuses: [], goals: [] },
      config,
    ),
  );
  config.bindings[0].nodeId = "daily-chart";
  config.bindings[0].query = "channels";
  assert.throws(() =>
    analyticsToSpec(
      { daily: [], channels: [], statuses: [], goals: [] },
      config,
    ),
  );
});

test("query contract rejects extra columns, null, duplicate inspector ids, invalid goals", async () => {
  const rows = (await queryAnalytics("commerce"))!;
  assert.throws(() => analyticsToSpec({ ...rows, extra: true }));
  assert.throws(() =>
    analyticsToSpec({
      ...rows,
      daily: [{ day: "2026-10-20", order_count: 1, secret: "unused" }],
    }),
  );
  assert.throws(() =>
    analyticsToSpec({
      ...rows,
      daily: [{ day: "2026-10-20", order_count: null }],
    }),
  );
  assert.throws(() =>
    analyticsToSpec({
      ...rows,
      goals: [{ team_name: "bad", completed_count: 2, target_count: 1 }],
    }),
  );
  const config = structuredClone(analyticsDisplay);
  config.inspectors.spec = config.inspectors.query;
  assert.throws(() => analyticsToSpec(rows, config));
});
