import React from "react";
const headingClasses = {
  1: "max-w-[830px] whitespace-pre-line text-[42px] font-[650] leading-[1.14] tracking-[-.05em] min-[851px]:text-[clamp(38px,5vw,66px)]",
  2: "text-[30px] leading-[1.3] tracking-[-.035em]",
  3: "text-lg leading-[1.4]",
};
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
      {eyebrow && (
        <p className="mb-[18px] text-[11px] font-bold tracking-[.18em] text-[#677d56] uppercase">
          {eyebrow}
        </p>
      )}
      <H className={headingClasses[level]}>{text}</H>
    </div>
  );
}
