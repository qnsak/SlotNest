import { Link, Outlet } from "react-router-dom";

export function UserLayout() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <header className="sn-header"
        style={{
          borderBottom: "1px solid var(--sn-border)",
          background: "var(--sn-surface)",
          color: "var(--sn-text)",
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
      <main className="sn-main">
        <Outlet />
      </main>
    </div>
  );
}
