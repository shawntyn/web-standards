"use client";
import React, { useId, useState, type CSSProperties } from "react";
export function CapacityPlanner({ initial }: { initial: number }) {
  const inputId = `capacity-input-${useId()}`;
  const [capacity, setCapacity] = useState(initial);
  return (
    <div className="rounded-[10px] border border-dashed border-[#9aaf7b] bg-linear-[130deg,#e2edcf,#f6f9ed] p-6">
      <label className="flex justify-between text-xs" htmlFor={inputId}>
        <span>团队容量 / 特殊组件插槽</span>
        <strong>{capacity} 人</strong>
      </label>
      <input
        className="mt-[18px] mb-2 w-full accent-[#567c2e]"
        id={inputId}
        type="range"
        min="1"
        max="100"
        value={capacity}
        onChange={(e) => setCapacity(Number(e.target.value))}
      />
      <div className="h-[7px] overflow-hidden rounded-md bg-[#d4dfc5]">
        <span
          className="block h-full w-[var(--capacity)] bg-[#5e852e] transition-[width] duration-200 motion-reduce:transition-none"
          style={{ "--capacity": `${capacity}%` } as CSSProperties}
        />
      </div>
      <p className="text-xs text-[#5e6e50]" aria-live="polite">
        预计每月处理 {(capacity * 120).toLocaleString("zh-CN")}{" "}
        条任务。仅此组件持有本地交互状态。
      </p>
    </div>
  );
}
