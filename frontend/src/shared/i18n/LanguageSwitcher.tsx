import { useI18n } from "./provider";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <select
      aria-label={t("lang_label")}
      className="sn-lang-select"
      value={locale}
      onChange={(event) => setLocale(event.target.value as "zh-TW" | "en")}
    >
      <option value="zh-TW">繁中</option>
      <option value="en">EN</option>
    </select>
  );
}
