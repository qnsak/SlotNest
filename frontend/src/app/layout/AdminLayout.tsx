import { Link, Outlet, useNavigate } from "react-router-dom";

import { useAdminAuth } from "../../features/admin-auth/hooks";
import { LanguageSwitcher } from "../../shared/i18n/LanguageSwitcher";
import { useI18n } from "../../shared/i18n/provider";
import { Button } from "../../shared/ui/Button";

export function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const { t } = useI18n();

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
          <strong style={{ fontWeight: 600 }}>{t("admin_layout_title")}</strong>
          <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link style={{ color: "var(--sn-text-sub)" }} to="/admin/intervals">
              {t("admin_intervals_title")}
            </Link>
            <Link style={{ color: "var(--sn-text-sub)" }} to="/admin/bookings">
              {t("admin_bookings_title")}
            </Link>
            <LanguageSwitcher />
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                void (async () => {
                  await logout();
                  navigate("/admin/login", { replace: true, state: { message: t("common_logout") } });
                })();
              }}
            >
              {t("common_logout")}
            </Button>
          </nav>
        </div>
      </header>
      <main className="sn-main">
        <Outlet />
      </main>
    </div>
  );
}
