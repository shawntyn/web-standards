import React from "react";
import { Table } from "./table";
export function ContentTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <Table caption={caption}>
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
    </Table>
  );
}
