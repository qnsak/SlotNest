import { Link, Outlet, useNavigate } from "react-router-dom";

import { useAdminAuth } from "../../features/admin-auth/hooks";
import { Button } from "../../shared/ui/Button";

export function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <header
        style={{
          borderBottom: "1px solid #e5e7eb",
          background: "#0f172a",
          color: "white",
          padding: "12px 20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong>SlotNest Admin</strong>
          <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link style={{ color: "#e5e7eb" }} to="/admin/intervals">
              Intervals
            </Link>
            <Link style={{ color: "#e5e7eb" }} to="/admin/bookings">
              Bookings
            </Link>
            <Button
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
