import React from "react";
import type { ReactNode } from "react";
const columnClasses: Record<number, string> = {
  1: "min-[851px]:grid-cols-1",
  2: "min-[851px]:grid-cols-2",
  3: "min-[851px]:grid-cols-3",
  4: "min-[851px]:grid-cols-4",
};
export function Grid({
  children,
  columns = 3,
}: {
  children?: ReactNode;
  columns?: number;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-[18px] ${columnClasses[columns] ?? columnClasses[3]}`}
    >
      {children}
    </div>
  );
}
