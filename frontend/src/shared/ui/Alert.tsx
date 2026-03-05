import type { PropsWithChildren } from "react";

type AlertKind = "error" | "info" | "success";

type Props = PropsWithChildren<{
  kind?: AlertKind;
}>;

const palette: Record<AlertKind, { bg: string; color: string; border: string }> = {
  error: { bg: "#FFF1EC", color: "#8E2D18", border: "#EBA18C" },
  info: { bg: "#FFF8EE", color: "#7A4A12", border: "#F2C379" },
  success: { bg: "#FDF3E8", color: "#6E451A", border: "#E7B987" },
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
        boxShadow: "0 8px 28px rgba(217, 81, 44, 0.08)",
      }}
    >
      {children}
    </div>
  );
}
