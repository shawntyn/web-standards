import React, { type InputHTMLAttributes } from "react";
export function Input({
  className = "",
  type = "text",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const appearance =
    type === "checkbox" || type === "radio"
      ? "size-4 shrink-0 accent-[#507f0b]"
      : "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-[#507f0b]";
  return (
    <input
      type={type}
      className={`${appearance} disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-600 aria-invalid:focus:outline-red-600 ${className}`}
      {...props}
    />
  );
}
