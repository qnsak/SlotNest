import { useCallback, useEffect, useMemo, useState } from "react";

import { ApiError, mapErrorCodeToMessage } from "../../shared/api/errors";
import { env } from "../../shared/config/env";
import { createLiffSession } from "./api";
import type { LiffBootstrapState } from "./model";

type LiffApi = {
  init: (input: { liffId: string }) => Promise<void>;
  isInClient: () => boolean;
  isLoggedIn: () => boolean;
  login: (input: { redirectUri: string }) => void;
  getIDToken?: () => string | null;
  getAccessToken?: () => string | null;
};

function getLiff(): LiffApi | null {
  const candidate = (globalThis as { liff?: unknown }).liff;
  if (!candidate || typeof candidate !== "object") {
    return null;
  }
  return candidate as LiffApi;
}

export function useLiffInit() {
  const [state, setState] = useState<LiffBootstrapState>({ status: "idle" });

  const run = useCallback(async () => {
    if (!env.liffId) {
      setState({ status: "ready" });
      return;
    }

    setState({ status: "loading" });

    try {
      const liff = getLiff();
      if (!liff) {
        throw new Error("LIFF SDK is not loaded.");
      }

      await liff.init({ liffId: env.liffId });

      if (!liff.isInClient() && !liff.isLoggedIn()) {
        setState({ status: "redirecting" });
        liff.login({ redirectUri: window.location.href });
        return;
      }

      setState({ status: "ready" });
    } catch {
      setState({ status: "error", message: mapErrorCodeToMessage("LIFF_INIT_FAILED") });
    }
  }, []);

  return { state, run };
}

export function useEnsureLiffSession(enabled = true) {
  const { state, run } = useLiffInit();
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setSessionReady(true);
      setSessionError(null);
      return;
    }

    setSessionError(null);
    void run();
  }, [enabled, run]);

  useEffect(() => {
    const setupSession = async () => {
      if (!enabled || state.status !== "ready") {
        return;
      }

      if (!env.liffId) {
        setSessionReady(true);
        setSessionError(null);
        return;
      }

      try {
        const liff = getLiff();
        if (!liff) {
          throw new ApiError(500, {
            code: "LIFF_INIT_FAILED",
            message: "LIFF SDK is not loaded.",
          });
        }

        const idToken = liff.getIDToken?.() ?? null;
        const accessToken = liff.getAccessToken?.() ?? null;

        if (!idToken && !accessToken) {
          throw new ApiError(400, {
            code: "LIFF_TOKEN_MISSING",
            message: "Unable to obtain LIFF token.",
          });
        }

        await createLiffSession({
          id_token: idToken,
          access_token: accessToken,
        });

        setSessionReady(true);
        setSessionError(null);
      } catch (errorValue) {
        setSessionReady(false);
        if (errorValue instanceof ApiError) {
          setSessionError(mapErrorCodeToMessage(errorValue.code));
          return;
        }
        setSessionError(mapErrorCodeToMessage("LIFF_INIT_FAILED"));
      }
    };

    void setupSession();
  }, [enabled, state.status]);

  const viewState = useMemo(() => {
    if (!enabled) {
      return { status: "ready" as const, message: "" };
    }

    if (state.status === "error") {
      return { status: "error" as const, message: state.message };
    }

    if (sessionError) {
      return { status: "error" as const, message: sessionError };
    }

    if (!sessionReady) {
      return {
        status: "loading" as const,
        message: state.status === "redirecting" ? "Redirecting to LINE login..." : "Initializing LIFF...",
      };
    }

    return { status: "ready" as const, message: "" };
  }, [enabled, sessionError, sessionReady, state]);

  return {
    ready: viewState.status === "ready",
    loading: viewState.status === "loading",
    error: viewState.status === "error" ? viewState.message : null,
    retry: run,
  };
}
