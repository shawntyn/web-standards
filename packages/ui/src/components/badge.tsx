import React from "react";
const toneClasses = {
  neutral: "bg-[#edf0e8] text-[#5b6855]",
  success: "bg-[#e4efd7] text-[#466729]",
  accent: "bg-signal text-[#243a13]",
};
export function Badge({
  text,
  tone = "neutral",
}: {
  text: string;
  tone?: "neutral" | "success" | "accent";
}) {
  return (
    <span
      className={`inline-flex w-fit rounded-[5px] px-2.5 py-1 text-[11px] tracking-[.04em] ${toneClasses[tone]}`}
    >
      {text}
    </span>
  );
}
