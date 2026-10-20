import React from "react";

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
    <div className="flex flex-col gap-[5px] border-l-2 border-[#a7d662] px-[22px] py-1.5">
      <span className="text-xs text-muted">{label}</span>
      <strong className="text-[38px] leading-[1.3] tracking-[-.05em]">
        {value}
      </strong>
      {detail && <small className="text-[11px] text-muted">{detail}</small>}
    </div>
  );
}
