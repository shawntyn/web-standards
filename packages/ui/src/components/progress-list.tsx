import React from "react";
import { assertNonnegativeFinite } from "./chart-data";

export interface ProgressListProps {
  title: string;
  emptyText: string;
  items: Array<{ label: string; value: number; max: number }>;
}

export function ProgressList({ title, emptyText, items }: ProgressListProps) {
  for (const item of items) {
    assertNonnegativeFinite(item.value);
    assertNonnegativeFinite(item.max);
    if (item.max === 0 || item.value > item.max)
      throw new RangeError("Progress requires 0 <= value <= positive max");
  }
  return (
    <section
      className="min-w-0 rounded-xl border border-line bg-surface p-5"
      aria-label={title}
    >
      <h3 className="text-base font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{emptyText}</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {items.map((item, index) => (
            <li key={index}>
              <label className="flex flex-col gap-2 text-sm">
                <span className="flex flex-wrap justify-between gap-2">
                  <span>{item.label}</span>
                  <span className="tabular-nums">
                    {item.value} / {item.max}
                  </span>
                </span>
                <progress
                  aria-label={item.label}
                  aria-valuetext={`${item.value} / ${item.max}`}
                  max={item.max > 0 ? item.max : 1}
                  value={item.max > 0 ? Math.min(item.value, item.max) : 0}
                  className="h-3 w-full accent-emerald-600"
                />
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
