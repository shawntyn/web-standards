import React from "react";

export function Text({
  text,
  tone = "default",
}: {
  text: string;
  tone?: "default" | "muted";
}) {
  return <p className={tone === "muted" ? "text-muted" : "text-ink"}>{text}</p>;
}
