import React, { type ReactNode } from "react";

/** Reading layout, not a page template: children retain their authored order. */
export function Document({ children }: { children?: ReactNode }) {
  return (
    <article className="mx-auto max-w-[72ch] space-y-6 text-base leading-8 text-ink [&_h1]:text-3xl [&_h1]:leading-tight [&_h1]:tracking-tight [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:leading-snug [&_h3]:mt-8 [&_h3]:text-xl [&_p]:leading-8">
      {children}
    </article>
  );
}
