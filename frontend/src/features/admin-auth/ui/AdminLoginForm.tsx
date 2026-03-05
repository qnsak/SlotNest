import { useState } from "react";

import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";

type Props = {
  loading: boolean;
  onSubmit: (username: string, password: string) => void;
};

export function AdminLoginForm({ loading, onSubmit }: Props) {
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
        Username
        <Input value={username} onChange={(event) => setUsername(event.target.value)} />
      </label>
      <label>
        Password
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
