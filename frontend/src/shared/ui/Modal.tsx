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
        background: "rgba(46, 26, 14, 0.5)",
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
          background: "#FFFCFA",
          borderRadius: 20,
          border: "1px solid #F5D9CA",
          boxShadow: "0 18px 42px rgba(217, 81, 44, 0.22)",
          overflow: "hidden",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ padding: "16px 18px", borderBottom: "1px solid #F8E2D6" }}>
          <h3 style={{ margin: 0, color: "#2E1A0E", fontWeight: 900 }}>{title}</h3>
        </div>
        <div style={{ padding: 18, color: "#2E1A0E" }}>{children}</div>
        <div
          style={{
            padding: "14px 18px",
            borderTop: "1px solid #F8E2D6",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            background: "#FFF6F0",
          }}
        >
          {footer}
        </div>
      </div>
    </div>
  );
}
