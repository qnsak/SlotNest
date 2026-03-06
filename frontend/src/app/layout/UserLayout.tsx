import { Link, Outlet } from "react-router-dom";
import { useI18n } from "../../shared/i18n/provider";
import { LanguageSwitcher } from "../../shared/i18n/LanguageSwitcher";

export function UserLayout() {
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
          <strong style={{ fontWeight: 600 }}>{t("user_layout_title")}</strong>
          <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link style={{ color: "var(--sn-text-sub)" }} to="/">
              {t("common_home")}
            </Link>
            <Link style={{ color: "var(--sn-text-sub)" }} to="/booking">
              {t("common_booking_lookup")}
            </Link>
            <LanguageSwitcher />
          </nav>
        </div>
      </header>
      <main className="sn-main">
        <Outlet />
      </main>
    </div>
  );
}
