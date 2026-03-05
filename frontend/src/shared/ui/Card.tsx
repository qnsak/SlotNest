import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{ className?: string }>;

export function Card({ children, className }: Props) {
  return (
    <section className={`sn-card${className ? ` ${className}` : ""}`}>
      {children}
    </section>
  );
}
