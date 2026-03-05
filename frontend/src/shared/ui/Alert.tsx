import type { PropsWithChildren } from "react";

type AlertKind = "error" | "info" | "success";

type Props = PropsWithChildren<{
  kind?: AlertKind;
}>;

const palette: Record<AlertKind, { bg: string; color: string; border: string }> = {
  error: { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
  info: { bg: "#dbeafe", color: "#1e3a8a", border: "#bfdbfe" },
  success: { bg: "#dcfce7", color: "#166534", border: "#bbf7d0" },
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
        borderRadius: 8,
        padding: "10px 12px",
      }}
    >
      {children}
    </div>
  );
}
