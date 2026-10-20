import React from "react";
export function Quote({
  text,
  attribution,
}: {
  text: string;
  attribution?: string;
}) {
  return (
    <figure className="border-l-2 border-line pl-5 text-muted">
      <blockquote>
        <p>{text}</p>
      </blockquote>
      {attribution && (
        <figcaption className="mt-2 text-sm">{attribution}</figcaption>
      )}
    </figure>
  );
}
