import React from "react";
import { chartMaximum, type ChartProps } from "./chart-data";

export interface BarChartProps extends ChartProps {
  points: ChartProps["points"];
}

export function BarChart({
  title,
  description,
  unit,
  emptyText,
  points,
}: BarChartProps) {
  const maximum = chartMaximum(points);
  return (
    <figure className="min-w-0 rounded-xl border border-line bg-surface p-5">
      <figcaption className="text-base font-semibold">{title}</figcaption>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      {points.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{emptyText}</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {points.map((point, index) => (
            <li key={index}>
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <span>{point.label}</span>
                <span className="tabular-nums">
                  {point.value} {unit}
                </span>
              </div>
              <svg
                viewBox="0 0 100 4"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="mt-2 h-3 w-full overflow-hidden rounded-full text-emerald-700"
              >
                <rect
                  width="100"
                  height="4"
                  fill="currentColor"
                  className="text-line"
                />
                <rect
                  width={maximum === 0 ? 0 : (point.value / maximum) * 100}
                  height="4"
                  fill="currentColor"
                />
              </svg>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
