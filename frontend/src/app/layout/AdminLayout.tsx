import { Link, Outlet, useNavigate } from "react-router-dom";

import { useAdminAuth } from "../../features/admin-auth/hooks";
import { Button } from "../../shared/ui/Button";

export function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  return (
    <div style={{ minHeight: "100vh" }}>
      <header
        style={{
          borderBottom: "1px solid #EFC6AE",
          background: "linear-gradient(120deg, #2E1A0E 0%, #6A3B23 100%)",
          color: "#FFF7EF",
          padding: "14px 20px",
          boxShadow: "0 10px 26px rgba(46, 26, 14, 0.26)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong style={{ fontWeight: 900 }}>SlotNest Admin</strong>
          <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link style={{ color: "#FFF0E4" }} to="/admin/intervals">
              Intervals
            </Link>
            <Link style={{ color: "#FFF0E4" }} to="/admin/bookings">
              Bookings
            </Link>
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                void (async () => {
                  await logout();
                  navigate("/admin/login", { replace: true, state: { message: "Signed out" } });
                })();
              }}
            >
              Logout
            </Button>
          </nav>
        </div>
      </header>
      <main style={{ maxWidth: 920, margin: "0 auto", padding: 20, display: "grid", gap: 12 }}>
        <Outlet />
      </main>
    </div>
  );
}
