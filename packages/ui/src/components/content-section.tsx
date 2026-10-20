import React, { type ReactNode } from "react";
/** A deliberately small named extension point, not arbitrary JSX from JSON. */
export function ContentSection({
  title,
  description,
  interactive,
}: {
  title: string;
  description: string;
  interactive?: ReactNode;
}) {
  return (
    <section className="space-y-4 border-y border-line py-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-muted">{description}</p>
      {interactive && <div>{interactive}</div>}
    </section>
  );
}
