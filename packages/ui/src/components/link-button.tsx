import React from "react";
import Link from "next/link";
const variantClasses = {
  primary: "bg-[#22332a] text-[#f2f8e9]",
  secondary: "border border-[#d5ddc8] bg-[#e9eddf]",
};
export function LinkButton({
  label,
  href,
  variant = "primary",
}: {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      className={`inline-flex w-fit items-center justify-between gap-7 rounded-lg px-[18px] py-3 text-[13px] font-semibold transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none ${variantClasses[variant]}`}
      href={href}
    >
      {label}
      <span aria-hidden="true">↗</span>
    </Link>
  );
}
