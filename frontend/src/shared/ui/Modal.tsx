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
        background: "rgba(17, 24, 39, 0.55)",
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
          background: "#ffffff",
          borderRadius: 16,
          border: "1px solid #e5e7eb",
          boxShadow: "0 22px 40px rgba(17, 24, 39, 0.25)",
          overflow: "hidden",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ padding: "16px 18px", borderBottom: "1px solid #f3f4f6" }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
        </div>
        <div style={{ padding: 18 }}>{children}</div>
        <div
          style={{
            padding: "14px 18px",
            borderTop: "1px solid #f3f4f6",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            background: "#f9fafb",
          }}
        >
          {footer}
        </div>
      </div>
    </div>
  );
}
