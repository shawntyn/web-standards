import React from "react";
import Link from "next/link";
import type { ReactNode } from "react";

export function Stack({
  children,
  gap = "md",
}: {
  children?: ReactNode;
  gap?: "sm" | "md" | "lg";
}) {
  return <div className={`stack stack-${gap}`}>{children}</div>;
}
export function Grid({
  children,
  columns = 3,
}: {
  children?: ReactNode;
  columns?: number;
}) {
  return (
    <div
      className="grid-cards"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}
    >
      {children}
    </div>
  );
}
export function Heading({
  text,
  level = 2,
  eyebrow,
}: {
  text: string;
  level?: 1 | 2 | 3;
  eyebrow?: string;
}) {
  const H = `h${level}` as "h1" | "h2" | "h3";
  return (
    <div>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <H>{text}</H>
    </div>
  );
}
export function Text({
  text,
  tone = "default",
}: {
  text: string;
  tone?: "default" | "muted";
}) {
  return <p className={tone === "muted" ? "muted" : ""}>{text}</p>;
}
export function Badge({
  text,
  tone = "neutral",
}: {
  text: string;
  tone?: "neutral" | "success" | "accent";
}) {
  return <span className={`badge badge-${tone}`}>{text}</span>;
}
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
    <section className="card">
      {header && <div className="card-slot">{header}</div>}
      {title && <h3>{title}</h3>}
      {description && <p className="muted">{description}</p>}
      {children}
      {footer && <footer className="card-footer">{footer}</footer>}
    </section>
  );
}
export function LinkButton({
  label,
  href,
  variant = "primary",
}: {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link className={`button button-${variant}`} href={href}>
      {label}
      <span aria-hidden="true">↗</span>
    </Link>
  );
}
export function Code({
  code,
  label = "SOURCE",
}: {
  code: string;
  label?: string;
}) {
  return (
    <div className="code-panel">
      <div className="code-label">{label}</div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
export function Metric({
  value,
  label,
  detail,
}: {
  value: string;
  label: string;
  detail?: string;
}) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}
export function Callout({ title, text }: { title: string; text: string }) {
  return (
    <aside className="callout">
      <span aria-hidden="true">◎</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </aside>
  );
}
export function Steps({
  items,
}: {
  items: { title: string; description: string }[];
}) {
  return (
    <ol className="steps">
      {items.map((item, i) => (
        <li key={item.title}>
          <span className="step-number">0{i + 1}</span>
          <div>
            <h3>{item.title}</h3>
            <p className="muted">{item.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
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
    <div className="frame">
      <header className="site-header">
        <Link className="brand" href="/">
          <span className="brand-mark">W/</span>
          <span>
            {brand}
            <small>{subtitle}</small>
          </span>
        </Link>
        <nav aria-label="主导航">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <span className="live-dot">REFERENCE / 01</span>
      </header>
      <div className="page-body">{children}</div>
      <footer className="site-footer">
        <span>WEB STANDARD · 工程即文档</span>
        <span>Next.js / Tailwind CSS / pnpm / json-render</span>
      </footer>
    </div>
  );
}
export function Split({ children }: { children?: ReactNode }) {
  return <div className="split">{children}</div>;
}
