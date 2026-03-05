export type AppEnv = {
  apiBaseUrl: string;
  liffId: string;
  enableLiff: boolean;
};

function normalizeApiBaseUrl(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    if (import.meta.env.DEV) {
      return "";
    }
    throw new Error("Missing required env: VITE_API_BASE_URL");
  }

  try {
    const url = new URL(trimmed);
    return `${url.origin}${url.pathname.replace(/\/$/, "")}`;
  } catch {
    throw new Error("Invalid VITE_API_BASE_URL. Expected absolute URL.");
  }
}

function readLiffId(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    if (import.meta.env.DEV) {
      return "";
    }
    throw new Error("Missing required env: VITE_LIFF_ID");
  }

  return trimmed;
}

function readEnableLiff(value: string | undefined): boolean {
  const normalized = (value ?? "").trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

export const env: AppEnv = {
  apiBaseUrl: normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
  liffId: readLiffId(import.meta.env.VITE_LIFF_ID),
  enableLiff: readEnableLiff(import.meta.env.VITE_ENABLE_LIFF),
};
