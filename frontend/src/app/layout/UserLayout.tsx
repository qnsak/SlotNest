import { NavLink, Outlet } from "react-router-dom";
import { useI18n } from "../../shared/i18n/provider";
import { LanguageSwitcher } from "../../shared/i18n/LanguageSwitcher";

export function UserLayout() {
  const { t } = useI18n();

  return (
    <div style={{ minHeight: "100vh" }}>
      <header className="sn-header">
        <div className="sn-header-inner">
          <NavLink className="sn-brand" to="/" aria-label={t("user_layout_title")}>
            <span className="sn-brand-main">{t("brand_name")}</span>
            <span className="sn-brand-sub">{t("brand_booking")}</span>
          </NavLink>
          <div className="sn-header-right">
            <nav className="sn-primary-nav" aria-label="Primary">
              <NavLink className={({ isActive }) => `sn-nav-link${isActive ? " is-active" : ""}`} to="/" end>
                {t("common_home")}
              </NavLink>
              <NavLink className={({ isActive }) => `sn-nav-link${isActive ? " is-active" : ""}`} to="/booking">
                {t("common_booking_lookup")}
              </NavLink>
            </nav>
            <div className="sn-header-utils">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>
      <main className="sn-main">
        <Outlet />
      </main>
    </div>
  );
}
