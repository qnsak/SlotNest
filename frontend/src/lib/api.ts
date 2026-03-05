import { getAdminAuthorizationHeader } from "./auth";
import { ApiClientError } from "./errors";
import type {
  AdminCreateIntervalPayload,
  AdminDeleteIntervalResponse,
  ApiErrorEnvelope,
  Booking,
  CreateBookingPayload,
  Interval,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type RequestOptions = {
  adminAuth?: boolean;
};

function buildUrl(path: string): string {
  const base = API_BASE_URL?.trim();
  if (!base) {
    return path;
  }
  return `${base.replace(/\/$/, "")}${path}`;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

function toApiError(status: number, body: unknown): ApiClientError {
  const envelope = body as Partial<ApiErrorEnvelope> | null;

  if (envelope && typeof envelope.code === "string" && typeof envelope.message === "string") {
    return new ApiClientError({
      code: envelope.code,
      message: envelope.message,
      details: envelope.details,
      status,
    });
  }

  return new ApiClientError({
    code: "HTTP_ERROR",
    message: `HTTP ${status}`,
    details: body,
    status,
  });
}

async function requestJson<T>(
  path: string,
  init: RequestInit = {},
  options: RequestOptions = {}
): Promise<T> {
  const headers = new Headers(init.headers ?? {});

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.adminAuth) {
    const authHeader = getAdminAuthorizationHeader();
    if (!authHeader) {
      throw new ApiClientError({
        code: "ADMIN_CREDENTIALS_MISSING",
        message: "Missing admin credentials in memory.",
      });
    }
    headers.set("Authorization", authHeader);
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
  });

  const body = await parseResponseBody(response);

  if (!response.ok) {
    throw toApiError(response.status, body);
  }

  return body as T;
}

export async function getIntervals(from: string, to: string): Promise<Interval[]> {
  const params = new URLSearchParams({ from, to });
  return requestJson<Interval[]>(`/intervals?${params.toString()}`);
}

export async function createBooking(intervalId: number): Promise<Booking> {
  const payload: CreateBookingPayload = { interval_id: intervalId };
  return requestJson<Booking>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getBooking(reference: string): Promise<Booking> {
  return requestJson<Booking>(`/bookings/${encodeURIComponent(reference)}`);
}

export async function cancelBooking(reference: string): Promise<Booking> {
  return requestJson<Booking>(`/bookings/${encodeURIComponent(reference)}/cancel`, {
    method: "POST",
  });
}

export async function adminCreateInterval(payload: AdminCreateIntervalPayload): Promise<Interval> {
  return requestJson<Interval>("/admin/intervals", {
    method: "POST",
    body: JSON.stringify(payload),
  }, { adminAuth: true });
}

export async function adminListIntervals(from: string, to: string): Promise<Interval[]> {
  const params = new URLSearchParams({ from, to });
  return requestJson<Interval[]>(`/admin/intervals?${params.toString()}`, {}, { adminAuth: true });
}

export async function adminDeleteInterval(intervalId: number): Promise<AdminDeleteIntervalResponse> {
  return requestJson<AdminDeleteIntervalResponse>(`/admin/intervals/${intervalId}`, {
    method: "DELETE",
  }, { adminAuth: true });
}

export async function adminListBookings(date: string): Promise<Booking[]> {
  const params = new URLSearchParams({ date });
  return requestJson<Booking[]>(`/admin/bookings?${params.toString()}`, {}, { adminAuth: true });
}

export async function adminCancelBooking(reference: string): Promise<Booking> {
  return requestJson<Booking>(`/admin/bookings/${encodeURIComponent(reference)}/cancel`, {
    method: "POST",
  }, { adminAuth: true });
}
