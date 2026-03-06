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
          borderBottom: "1px solid var(--sn-border)",
          background: "var(--sn-surface)",
          color: "var(--sn-text)",
          height: 64,
          padding: "0 24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%" }}>
          <strong style={{ fontWeight: 600 }}>SlotNest Admin</strong>
          <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link style={{ color: "var(--sn-text-sub)" }} to="/admin/intervals">
              Intervals
            </Link>
            <Link style={{ color: "var(--sn-text-sub)" }} to="/admin/bookings">
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
      <main style={{ maxWidth: 980, margin: "0 auto", padding: 32, display: "grid", gap: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}
