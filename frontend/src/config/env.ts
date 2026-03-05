export type FrontendEnv = {
  apiBaseUrl: string;
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
    return url.origin + url.pathname.replace(/\/$/, "");
  } catch {
    throw new Error("Invalid VITE_API_BASE_URL. Expected absolute URL.");
  }
}

export const env: FrontendEnv = {
  apiBaseUrl: normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
};
