import React from "react";
import type { ReactNode } from "react";

export function Card({
  title,
  description,
  children,
  header,
  footer,
}: {
  title?: string;
  description?: string;
  children?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-[17px] rounded-2xl border border-line bg-surface p-[22px] hover:border-[#b8c6ab] min-[851px]:p-[27px]">
      {header && <div className="flex items-center gap-2">{header}</div>}
      {title && <h3 className="text-lg leading-[1.4]">{title}</h3>}
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
