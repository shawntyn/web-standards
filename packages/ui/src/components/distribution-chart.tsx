import React from "react";
import { chartMaximum, type ChartProps } from "./chart-data";

export interface DistributionChartProps extends ChartProps {
  points: ChartProps["points"];
}

const colors = [
  "text-emerald-600",
  "text-sky-600",
  "text-amber-600",
  "text-violet-600",
  "text-rose-600",
  "text-cyan-700",
];

export function DistributionChart({
  title,
  description,
  unit,
  emptyText,
  points,
}: DistributionChartProps) {
  const maximum = chartMaximum(points);
  // Normalize before summing so even finite values near Number.MAX_VALUE stay safe.
  const scaledTotal =
    maximum === 0
      ? 0
      : points.reduce((total, point) => total + point.value / maximum, 0);
  const shares = points.map((point) =>
    scaledTotal === 0 ? 0 : (point.value / maximum / scaledTotal) * 100,
  );
  const segments = shares.map((share, index) => ({
    start: shares.slice(0, index).reduce((sum, value) => sum + value, 0),
    share,
  }));
  return (
    <figure className="min-w-0 rounded-xl border border-line bg-surface p-5">
      <figcaption className="text-base font-semibold">{title}</figcaption>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      {points.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{emptyText}</p>
      ) : (
        <>
          <svg
            viewBox="0 0 100 8"
            preserveAspectRatio="none"
            role="img"
            aria-label={title}
            className="mt-4 h-6 w-full overflow-hidden rounded-full"
          >
            <title>{`${title} (${unit})`}</title>
            <rect
              width="100"
              height="8"
              fill="currentColor"
              className="text-line"
            />
            {segments.map(({ start, share }, index) => (
              <rect
                key={index}
                x={start}
                width={share}
                height="8"
                fill="currentColor"
                className={colors[index % colors.length]}
              />
            ))}
          </svg>
          <ul className="mt-4 space-y-3">
            {points.map((point, index) => (
              <li
                key={index}
                className="flex flex-wrap items-center gap-2 text-sm"
              >
                <span
                  aria-hidden="true"
                  className={`h-3 w-3 shrink-0 rounded-sm bg-current ${colors[index % colors.length]}`}
                />
                <span className="min-w-0 flex-1">{point.label}</span>
                <span className="tabular-nums">
                  {point.value} {unit} · {shares[index].toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </figure>
  );
}
