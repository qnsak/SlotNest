import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function Input(props: Props) {
  return (
    <input
      {...props}
      style={{
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid #d1d5db",
        width: "100%",
      }}
    />
  );
}
