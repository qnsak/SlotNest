import { env } from "../config/env";
import { ApiError } from "./errors";
import type { ApiErrorEnvelope, RequestOptions } from "./types";

function buildUrl(path: string): string {
  if (!env.apiBaseUrl) {
    return path;
  }
  return `${env.apiBaseUrl}${path}`;
}

async function parseJsonBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const text = await response.text();
    return text ? { message: text } : null;
  }

  return response.json();
}

function normalizeError(status: number, body: unknown): ApiError {
  const payload = body as Partial<ApiErrorEnvelope> | null;

  if (payload && typeof payload.code === "string" && typeof payload.message === "string") {
    return new ApiError(status, {
      code: payload.code,
      message: payload.message,
      details: payload.details,
    });
  }

  return new ApiError(status, {
    code: "HTTP_ERROR",
    message: `HTTP ${status}`,
    details: body,
  });
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers ?? {});

  headers.set("Accept", "application/json");
  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    credentials: options.credentials ?? "include",
    signal: options.signal,
  });

  const body = await parseJsonBody(response);

  if (!response.ok) {
    throw normalizeError(response.status, body);
  }

  return body as T;
}
