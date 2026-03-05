import { Link, Outlet } from "react-router-dom";

export function UserLayout() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <header
        style={{
          borderBottom: "1px solid #EFC6AE",
          background: "linear-gradient(120deg, #D9512C 0%, #E8783A 100%)",
          color: "#FFF8F3",
          padding: "14px 20px",
          boxShadow: "0 10px 24px rgba(217, 81, 44, 0.2)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong style={{ fontWeight: 900 }}>SlotNest Booking</strong>
          <nav style={{ display: "flex", gap: 12 }}>
            <Link style={{ color: "#FFF3EA" }} to="/">
              Home
            </Link>
            <Link style={{ color: "#FFF3EA" }} to="/booking">
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
