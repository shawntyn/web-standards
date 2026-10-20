import React from "react";

export function Code({
  code,
  label = "SOURCE",
}: {
  code: string;
  label?: string;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl bg-[#1b2a24] text-[#d9e8cf]">
      <div className="border-b border-[#33443a] px-[18px] py-[13px] font-mono text-[10px] leading-none tracking-[.12em] text-[#9bb589]">
        {label}
      </div>
      <pre className="overflow-auto p-5 font-mono text-xs leading-[1.8] [tab-size:2]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
