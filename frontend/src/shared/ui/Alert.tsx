import type { PropsWithChildren } from "react";

type AlertKind = "error" | "info" | "success";

type Props = PropsWithChildren<{
  kind?: AlertKind;
}>;

const palette: Record<AlertKind, { bg: string; color: string; border: string }> = {
  error: { bg: "var(--sn-error-bg)", color: "var(--sn-error-text)", border: "var(--sn-error-border)" },
  info: { bg: "var(--sn-info-bg)", color: "var(--sn-info-text)", border: "var(--sn-info-border)" },
  success: {
    bg: "var(--sn-success-bg)",
    color: "var(--sn-success-text)",
    border: "var(--sn-success-border)",
  },
};

export function Alert({ kind = "info", children }: Props) {
  const colors = palette[kind];

  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      style={{
        border: `1px solid ${colors.border}`,
        background: colors.bg,
        color: colors.color,
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 4px 12px rgba(50, 48, 46, 0.08)",
      }}
    >
      {children}
    </div>
  );
}
