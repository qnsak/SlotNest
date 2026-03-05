import { Outlet } from "react-router-dom";

import { useEnsureLiffSession } from "../../features/liff-auth/hooks";
import { LiffBootstrap } from "../../features/liff-auth/ui/LiffBootstrap";
import { env } from "../../shared/config/env";

export function UserGuard() {
  const { ready, loading, error, retry } = useEnsureLiffSession(env.enableLiff);

  if (!ready) {
    return <LiffBootstrap loading={loading} error={error} onRetry={retry} />;
  }

  return <Outlet />;
}
