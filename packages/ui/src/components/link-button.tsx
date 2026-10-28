import React from "react";
import Link from "next/link";
export function LinkButton({ label, href }: { label: string; href: string }) {
  return (
    <Link
      className="inline-flex w-fit rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-surface hover:opacity-80"
      href={href}
    >
      {label}
    </Link>
  );
}
