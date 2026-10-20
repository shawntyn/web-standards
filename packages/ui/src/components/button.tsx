import React, { type ButtonHTMLAttributes } from "react";
const variants = {
  primary: "bg-[#22332a] text-[#f2f8e9]",
  secondary: "border border-[#d5ddc8] bg-[#e9eddf] text-ink",
  danger: "bg-red-700 text-white",
};
export function Button({
  variant = "primary",
  type = "button",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <button
      type={type}
      className={`inline-flex w-fit items-center justify-center gap-2 rounded-lg px-[18px] py-3 text-[13px] font-semibold transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
