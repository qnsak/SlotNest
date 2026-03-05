import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "ghost";
  }
>;

export function Button({ children, style, disabled, variant = "primary", className, ...props }: Props) {
  const classes = `sn-button ${variant === "ghost" ? "sn-button-ghost" : "sn-button-primary"}${
    className ? ` ${className}` : ""
  }`;
  return (
    <button
      disabled={disabled}
      className={classes}
      {...props}
      style={{
        ...style,
      }}
    >
      {children}
    </button>
  );
}
