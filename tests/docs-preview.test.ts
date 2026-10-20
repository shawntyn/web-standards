import { test } from "node:test";
import assert from "node:assert/strict";
import { preparePreviewSpec } from "../apps/docs/src/lib/preview-spec";
test("MDX preview adapter supplies required leaf children before strict validation", () => {
  const spec = preparePreviewSpec({
    root: "card",
    elements: {
      card: {
        type: "Card",
        props: { title: "Demo" },
        slots: { footer: ["link"] },
      },
      link: { type: "LinkButton", props: { label: "Read", href: "/" } },
    },
  });
  assert.deepEqual(spec.elements.card?.children, []);
  assert.deepEqual(spec.elements.link?.children, []);
  assert.deepEqual(spec.elements.card?.slots?.footer, ["link"]);
  assert.throws(() =>
    preparePreviewSpec({
      root: "bad",
      elements: { bad: { type: "Unknown", props: {} } },
    }),
  );
  assert.throws(() =>
    preparePreviewSpec({
      root: "bad",
      elements: {
        bad: { type: "Card", props: {}, slots: { footer: ["missing"] } },
      },
    }),
  );
});
