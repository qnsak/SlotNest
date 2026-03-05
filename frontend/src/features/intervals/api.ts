import { apiRequest } from "../../shared/api/client";
import type { AdminCreateIntervalPayload, Interval } from "./types";

export function getIntervals(from: string, to: string): Promise<Interval[]> {
  return apiRequest<Interval[]>(`/intervals?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
}

export function adminListIntervals(from: string, to: string): Promise<Interval[]> {
  return apiRequest<Interval[]>(
    `/admin/intervals?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    { credentials: "include" }
  );
}

export function adminCreateInterval(payload: AdminCreateIntervalPayload): Promise<Interval> {
  return apiRequest<Interval>("/admin/intervals", {
    method: "POST",
    body: payload,
    credentials: "include",
  });
}

export function adminDeleteInterval(intervalId: number): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(`/admin/intervals/${intervalId}`, {
    method: "DELETE",
    credentials: "include",
  });
}
