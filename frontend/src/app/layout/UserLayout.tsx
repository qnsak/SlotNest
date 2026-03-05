import { Link, Outlet } from "react-router-dom";

export function UserLayout() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <header
        style={{
          borderBottom: "1px solid #e5e7eb",
          background: "#111827",
          color: "white",
          padding: "12px 20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong>SlotNest Booking</strong>
          <nav style={{ display: "flex", gap: 12 }}>
            <Link style={{ color: "#e5e7eb" }} to="/">
              Home
            </Link>
            <Link style={{ color: "#e5e7eb" }} to="/booking">
              Booking Lookup
            </Link>
          </nav>
        </div>
      </header>
      <main style={{ maxWidth: 920, margin: "0 auto", padding: 20, display: "grid", gap: 12 }}>
        <Outlet />
      </main>
    </div>
  );
}
