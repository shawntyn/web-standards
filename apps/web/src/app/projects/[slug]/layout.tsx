import type { ReactNode } from "react";

/** Route chrome only: no project heading, content, or navigation is fabricated. */
export default function ProjectLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto max-w-[1440px] px-6 py-10 sm:px-10">
      {children}
    </main>
  );
}
