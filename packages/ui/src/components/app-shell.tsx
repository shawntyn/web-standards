import React, { type ReactNode } from "react";
import Link from "next/link";

export function AppShell({
  children,
  brand,
  links,
}: {
  children?: ReactNode;
  brand: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="mx-auto max-w-4xl px-5 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-5 border-b border-line py-6">
        <Link className="text-lg font-bold" href="/">
          {brand}
        </Link>
        <nav className="flex flex-wrap gap-5 text-sm" aria-label="主导航">
          {links.map((link) => (
            <Link
              className="underline-offset-4 hover:underline"
              key={link.href}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="py-10 sm:py-14">{children}</main>
      <footer className="border-t border-line py-5 text-xs text-muted">
        Next.js · Tailwind CSS · json-render
      </footer>
    </div>
  );
}
