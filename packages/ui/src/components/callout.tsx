import React from "react";

export function Callout({ title, text }: { title: string; text: string }) {
  return (
    <aside className="flex gap-[18px] rounded-xl border border-[#d7e3c7] bg-[#eaf0df] px-[26px] py-[22px]">
      <span className="text-[27px] text-[#638a33]" aria-hidden="true">
        ◎
      </span>
      <div>
        <strong>{title}</strong>
        <p className="mt-1 text-[13px] text-[#52604c]">{text}</p>
      </div>
    </aside>
  );
}
