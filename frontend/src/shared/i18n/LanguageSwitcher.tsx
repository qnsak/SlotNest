import { useI18n } from "./provider";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--sn-text-sub)" }}>
      <span style={{ fontSize: 12 }}>{t("lang_label")}</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as "zh-TW" | "en")}
        style={{
          border: "1px solid var(--sn-border)",
          borderRadius: 4,
          padding: "4px 8px",
          background: "var(--sn-surface)",
          color: "var(--sn-text)",
        }}
      >
        <option value="zh-TW">{t("lang_zh_tw")}</option>
        <option value="en">{t("lang_en")}</option>
      </select>
    </label>
  );
}
