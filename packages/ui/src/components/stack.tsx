import React from "react";
import type { ReactNode } from "react";
const gapClasses = { sm: "gap-3.5", md: "gap-6", lg: "gap-[42px]" };
export function Stack({
  children,
  gap = "md",
}: {
  children?: ReactNode;
  gap?: "sm" | "md" | "lg";
}) {
  return <div className={`flex flex-col ${gapClasses[gap]}`}>{children}</div>;
}
