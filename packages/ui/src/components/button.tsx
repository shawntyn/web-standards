import React from "react";
import Link from "next/link";

// 当前 Button 用于导航；href 交给 Next Link，保留原生链接语义。
export function Button({ label, href }: { label: string; href: string }) {
  return (
    <Link
      className="inline-flex w-fit rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-surface hover:opacity-80"
      href={href}
    >
      {label}
    </Link>
  );
}
