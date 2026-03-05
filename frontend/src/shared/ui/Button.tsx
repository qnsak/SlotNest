import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function Button({ children, style, disabled, ...props }: Props) {
  return (
    <button
      disabled={disabled}
      {...props}
      style={{
        padding: "8px 12px",
        borderRadius: 8,
        border: "1px solid #d1d5db",
        background: disabled ? "#9ca3af" : "#111827",
        color: "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
