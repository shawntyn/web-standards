import React from "react";
const headingClasses = {
  1: "text-3xl font-semibold leading-tight tracking-tight sm:text-4xl",
  2: "text-2xl font-semibold leading-snug",
  3: "text-lg font-semibold",
  4: "text-base font-semibold",
  5: "text-sm font-semibold",
  6: "text-xs font-semibold",
};
export function Heading({
  text,
  level = 2,
}: {
  text: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}) {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return <Tag className={headingClasses[level]}>{text}</Tag>;
}
