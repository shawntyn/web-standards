import React, { type ReactNode } from "react";
export function FormField({
  htmlFor,
  label,
  error,
  description,
  required,
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string;
  description?: string;
  required?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-red-700">
            *
          </span>
        )}
      </label>
      {description && (
        <p id={`${htmlFor}-description`} className="text-xs text-muted">
          {description}
        </p>
      )}
      {children}
      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="text-sm text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}
