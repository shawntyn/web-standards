import React from "react";
import type { ReactNode } from "react";
import Link from "next/link";

export function Frame({
  children,
  brand,
  subtitle,
  links,
}: {
  children?: ReactNode;
  brand: string;
  subtitle: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="mx-auto max-w-[1440px] px-[22px] min-[851px]:px-14">
      <header className="flex min-h-[90px] flex-wrap items-center gap-5 border-b border-line py-5 min-[851px]:h-[106px] min-[851px]:flex-nowrap min-[851px]:gap-10 min-[851px]:py-0">
        <Link
          className="flex items-center gap-[13px] font-bold leading-[1.2]"
          href="/"
        >
          <span className="grid size-11 place-items-center rounded-xl bg-ink font-mono text-[19px] text-signal">
            W/
          </span>
          <span>
            {brand}
            <small className="mt-1.5 block text-[10px] font-normal tracking-[.14em]">
              {subtitle}
            </small>
          </span>
        </Link>
        <nav
          className="ml-auto flex gap-[15px] text-[13px] min-[851px]:gap-7"
          aria-label="主导航"
        >
          {links.map((l) => (
            <Link className="hover:text-[#527b19]" key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <span className="hidden rounded-full border border-line px-2.5 py-1.5 text-[10px] tracking-[.08em] before:mr-1.5 before:inline-block before:size-1.5 before:rounded-full before:bg-[#729c34] min-[851px]:inline-block">
          REFERENCE / 01
        </span>
      </header>
      <div className="pt-9 pb-[70px] min-[851px]:pt-[58px]">{children}</div>
      <footer className="flex flex-col justify-between gap-5 border-t border-line py-[25px] font-mono text-[10px] leading-[1.5] text-[#7b8578] min-[851px]:flex-row">
        <span>WEB STANDARD · 工程即文档</span>
        <span>Next.js / Tailwind CSS / pnpm / json-render</span>
      </footer>
    </div>
  );
}
