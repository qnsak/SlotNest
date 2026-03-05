import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAdminSessionCheck } from "../../features/admin-auth/hooks";
import { Spinner } from "../../shared/ui/Spinner";

type GuardState = "checking" | "ready" | "unauthorized" | "error";

export function AdminGuard() {
  const location = useLocation();
  const { ensureSession } = useAdminSessionCheck();
  const [state, setState] = useState<GuardState>("checking");

  useEffect(() => {
    let active = true;

    const run = async () => {
      const result = await ensureSession();

      if (!active) {
        return;
      }

      if (result.ok) {
        setState("ready");
        return;
      }

      if (result.unauthorized) {
        setState("unauthorized");
        return;
      }

      setState("error");
    };

    void run();

    return () => {
      active = false;
    };
  }, [ensureSession]);

  if (state === "checking") {
    return <Spinner />;
  }

  if (state === "unauthorized") {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ message: "Session expired", from: location.pathname }}
      />
    );
  }

  if (state === "error") {
    return <Navigate to="/admin/login" replace state={{ message: "Session check failed" }} />;
  }

  return <Outlet />;
}
