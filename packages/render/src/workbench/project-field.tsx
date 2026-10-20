import React from "react";
import { useId } from "react";
import { FormField, Input, Select, Textarea } from "@repo/ui";
import type { ProjectDraft } from "@repo/domain";
import { useWorkbench } from "./context";
export type ProjectFieldProps = {
  name: string;
  label: string;
  value: string;
  type: "text" | "number" | "textarea" | "select";
  error?: string;
  disabled: boolean;
  required: boolean;
  description?: string;
};
export function ProjectField({
  name,
  label,
  value,
  type,
  error,
  disabled,
  required,
  description,
}: ProjectFieldProps) {
  const actions = useWorkbench();
  const instanceId = useId();
  const id = `${instanceId}-project-field-${name}`;
  const props = {
    id,
    name,
    value,
    disabled,
    required,
    "aria-invalid": Boolean(error),
    "aria-describedby":
      [description ? `${id}-description` : "", error ? `${id}-error` : ""]
        .filter(Boolean)
        .join(" ") || undefined,
    onChange: (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => actions.change(name as keyof ProjectDraft, event.target.value),
  };
  return (
    <FormField
      htmlFor={id}
      label={label}
      error={error}
      description={description}
      required={required}
    >
      {type === "textarea" ? (
        <Textarea {...props} rows={name === "features" ? 3 : 4} />
      ) : type === "select" ? (
        <Select {...props}>
          {["运行中", "构建中", "已归档"].map((status) => (
            <option key={status}>{status}</option>
          ))}
        </Select>
      ) : (
        <Input
          {...props}
          type={type}
          min={type === "number" ? (name === "members" ? 1 : 0) : undefined}
          max={name === "progress" ? 100 : undefined}
        />
      )}
    </FormField>
  );
}
