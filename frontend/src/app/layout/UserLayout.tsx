import { Link, Outlet } from "react-router-dom";

export function UserLayout() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <header
        style={{
          borderBottom: "1px solid var(--sn-border)",
          background: "var(--sn-surface)",
          color: "var(--sn-text)",
          height: 64,
          padding: "0 24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%" }}>
          <strong style={{ fontWeight: 600 }}>SlotNest Booking</strong>
          <nav style={{ display: "flex", gap: 12 }}>
            <Link style={{ color: "var(--sn-text-sub)" }} to="/">
              Home
            </Link>
            <Link style={{ color: "var(--sn-text-sub)" }} to="/booking">
              Booking Lookup
            </Link>
          </nav>
        </div>
      </header>
      <main style={{ maxWidth: 980, margin: "0 auto", padding: 32, display: "grid", gap: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}
