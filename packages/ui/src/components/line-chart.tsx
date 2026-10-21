import React from "react";
import { chartMaximum, type ChartProps } from "./chart-data";

export interface LineChartProps extends ChartProps {
  points: ChartProps["points"];
}

export function LineChart({
  title,
  description,
  unit,
  emptyText,
  points,
}: LineChartProps) {
  const maximum = chartMaximum(points);
  const coordinates = points.map((point, index) => ({
    x: points.length === 1 ? 300 : 24 + (index / (points.length - 1)) * 552,
    y: 156 - (maximum === 0 ? 0 : point.value / maximum) * 132,
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
            viewBox="0 0 600 180"
            role="img"
            aria-label={title}
            className="mt-4 h-auto w-full text-emerald-700"
          >
            <title>{`${title} (${unit})`}</title>
            <path
              d="M24 24V156H576"
              fill="none"
              stroke="currentColor"
              className="text-line"
            />
            <polyline
              points={coordinates.map(({ x, y }) => `${x},${y}`).join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            {coordinates.map(({ x, y }, index) => (
              <circle key={index} cx={x} cy={y} r="4" fill="currentColor" />
            ))}
          </svg>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="pb-2 text-left text-xs text-muted">
                {title} · {unit}
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="border-b border-line py-2">
                    Label
                  </th>
                  <th
                    scope="col"
                    className="border-b border-line py-2 text-right"
                  >
                    Value ({unit})
                  </th>
                </tr>
              </thead>
              <tbody>
                {points.map((point, index) => (
                  <tr key={index}>
                    <th
                      scope="row"
                      className="border-b border-line py-2 font-normal"
                    >
                      {point.label}
                    </th>
                    <td className="border-b border-line py-2 text-right tabular-nums">
                      {point.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </figure>
  );
}
