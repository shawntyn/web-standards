import React, { type SelectHTMLAttributes } from "react";
export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-[#507f0b] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-600 aria-invalid:focus:outline-red-600 ${className}`}
      {...props}
    />
  );
}
