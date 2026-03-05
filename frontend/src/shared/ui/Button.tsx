import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function Button({ children, ...props }: Props) {
  return (
    <button
      {...props}
      style={{
        padding: "8px 12px",
        borderRadius: 8,
        border: "1px solid #d1d5db",
        background: "#111827",
        color: "#fff",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
