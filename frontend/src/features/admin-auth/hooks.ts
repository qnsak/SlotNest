import { useCallback, useState } from "react";

import { ApiError, toUserMessage } from "../../shared/api/errors";
import { adminLogin, adminLogout, checkAdminSession } from "./api";

export function useAdminAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await adminLogin({ username, password });
      return true;
    } catch (errorValue) {
      setError(toUserMessage(errorValue));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await adminLogout();
      return true;
    } catch (errorValue) {
      setError(toUserMessage(errorValue));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, login, logout };
}

export function useAdminSessionCheck() {
  const [checking, setChecking] = useState(false);

  const ensureSession = useCallback(async () => {
    setChecking(true);
    try {
      await checkAdminSession();
      return { ok: true as const };
    } catch (errorValue) {
      if (errorValue instanceof ApiError && errorValue.status === 401) {
        return { ok: false as const, unauthorized: true as const };
      }
      return { ok: false as const, unauthorized: false as const, message: toUserMessage(errorValue) };
    } finally {
      setChecking(false);
    }
  }, []);

  return { checking, ensureSession };
}
