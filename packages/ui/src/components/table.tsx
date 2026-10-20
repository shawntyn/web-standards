import React, { type TableHTMLAttributes } from "react";
export function Table({
  caption,
  className = "",
  children,
  ...props
}: TableHTMLAttributes<HTMLTableElement> & { caption?: string }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-line">
      <table
        className={`w-full border-collapse text-left text-sm ${className}`}
        {...props}
      >
        {caption && (
          <caption className="border-b border-line bg-surface px-4 py-3 text-left font-semibold">
            {caption}
          </caption>
        )}
        {children}
      </table>
    </div>
  );
}
