import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={`sn-input${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}
