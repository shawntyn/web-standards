import React from "react";
export function Table({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-line">
      <table className="w-full border-collapse text-left text-sm">
        {caption && (
          <caption className="border-b border-line bg-surface px-4 py-3 text-left font-semibold">
            {caption}
          </caption>
        )}
        <thead>
          <tr>
            {columns.map((column, i) => (
              <th
                scope="col"
                key={i}
                className="border-b border-line px-4 py-3 font-semibold"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-muted">
                暂无数据
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
