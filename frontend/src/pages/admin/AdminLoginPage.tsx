import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { AdminLoginForm } from "../../features/admin-auth/ui/AdminLoginForm";
import { useAdminAuth } from "../../features/admin-auth/hooks";
import { Alert } from "../../shared/ui/Alert";
import { Card } from "../../shared/ui/Card";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState<string | null>(
    (location.state as { message?: string } | null)?.message ?? null
  );

  const { loading, error, login } = useAdminAuth();

  const handleSubmit = async (username: string, password: string) => {
    const ok = await login(username, password);
    if (!ok) {
      return;
    }

    navigate("/admin/intervals", { replace: true });
  };

  return (
    <Card>
      <h2>Admin Login</h2>
      <p style={{ margin: "8px 0" }}>Cookie-based session login.</p>
      {message ? <Alert kind="info">{message}</Alert> : null}
      {error ? <Alert kind="error">{error}</Alert> : null}
      <div style={{ marginTop: 12 }}>
        <AdminLoginForm loading={loading} onSubmit={handleSubmit} />
      </div>
      {message ? (
        <div style={{ marginTop: 12 }}>
          <button type="button" onClick={() => setMessage(null)}>
            Dismiss message
          </button>
        </div>
      ) : null}
    </Card>
  );
}
