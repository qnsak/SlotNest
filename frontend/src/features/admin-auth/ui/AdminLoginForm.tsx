import { useState } from "react";

import { useI18n } from "../../../shared/i18n/provider";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";

type Props = {
  loading: boolean;
  onSubmit: (username: string, password: string) => void;
};

export function AdminLoginForm({ loading, onSubmit }: Props) {
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(username, password);
      }}
      style={{ display: "grid", gap: 8 }}
    >
      <label>
        {t("admin_login_username")}
        <Input value={username} onChange={(event) => setUsername(event.target.value)} />
      </label>
      <label>
        {t("admin_login_password")}
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? t("admin_login_loading") : t("admin_login_action")}
      </Button>
    </form>
  );
}
