import React from "react";
import type { ReactNode } from "react";

export function Card({
  title,
  titleLevel = 3,
  description,
  children,
  header,
  footer,
}: {
  title?: string;
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  description?: string;
  children?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}) {
  const Title = `h${titleLevel}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return (
    <section className="flex min-w-0 flex-col gap-[17px] rounded-2xl border border-line bg-surface p-[22px] hover:border-[#b8c6ab] min-[851px]:p-[27px]">
      {header && <div className="flex items-center gap-2">{header}</div>}
      {title && <Title className="text-lg leading-[1.4]">{title}</Title>}
      {description && <p className="text-muted">{description}</p>}
      {children}
      {footer && (
        <footer className="mt-auto border-t border-line pt-[18px]">
          {footer}
        </footer>
      )}
    </section>
  );
}
