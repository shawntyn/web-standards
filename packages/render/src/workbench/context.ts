import { createContext, useContext } from "react";
import type { ProjectDraft } from "@repo/domain";
export type WorkbenchActions = {
  startNew(): void;
  edit(slug: string): void;
  inspect(slug: string): void;
  cancel(): void;
  reset(): void;
  change(name: keyof ProjectDraft, value: string): void;
  search(value: string): void;
  filter(value: string): void;
  simulate(value: boolean): void;
  submit(): Promise<void>;
};
export const WorkbenchContext = createContext<WorkbenchActions | null>(null);
export function useWorkbench() {
  const context = useContext(WorkbenchContext);
  if (!context)
    throw new Error("Workbench components must have a WorkbenchContext");
  return context;
}
