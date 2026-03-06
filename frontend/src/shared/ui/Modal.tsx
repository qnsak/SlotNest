import type { PropsWithChildren, ReactNode } from "react";

type Props = PropsWithChildren<{
  open: boolean;
  title: string;
  onClose: () => void;
  footer?: ReactNode;
}>;

export function Modal({ open, title, onClose, footer, children }: Props) {
  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(50, 48, 46, 0.22)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          background: "var(--sn-surface)",
          borderRadius: 12,
          border: "1px solid var(--sn-border)",
          boxShadow: "0 12px 26px rgba(50, 48, 46, 0.14)",
          overflow: "hidden",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--sn-border)" }}>
          <h3 style={{ margin: 0, color: "var(--sn-text)", fontWeight: 600 }}>{title}</h3>
        </div>
        <div style={{ padding: 18, color: "var(--sn-text)" }}>{children}</div>
        <div
          style={{
            padding: "14px 18px",
            borderTop: "1px solid var(--sn-border)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            background: "var(--sn-bg)",
          }}
        >
          {footer}
        </div>
      </div>
    </div>
  );
}
