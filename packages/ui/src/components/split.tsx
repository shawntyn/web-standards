import React from "react";
import type { ReactNode } from "react";

export function Split({ children }: { children?: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-8 min-[851px]:grid-cols-[1.05fr_1fr]">
      {children}
    </div>
  );
}
