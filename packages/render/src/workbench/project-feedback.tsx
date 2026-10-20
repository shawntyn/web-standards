import React from "react";
export function ProjectFeedback({
  message,
  error,
}: {
  message: string;
  error: boolean;
}) {
  return (
    <p
      role={error ? "alert" : "status"}
      aria-live={error ? "assertive" : "polite"}
      className={
        error
          ? "rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          : "rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
      }
    >
      {message}
    </p>
  );
}
