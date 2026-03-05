import { apiRequest } from "../../shared/api/client";
import type { Booking } from "./types";

export function createBooking(intervalId: number): Promise<Booking> {
  return apiRequest<Booking>("/bookings", {
    method: "POST",
    body: { interval_id: intervalId },
  });
}

export function getBooking(reference: string): Promise<Booking> {
  return apiRequest<Booking>(`/bookings/${encodeURIComponent(reference)}`);
}

export function cancelBooking(reference: string): Promise<Booking> {
  return apiRequest<Booking>(`/bookings/${encodeURIComponent(reference)}/cancel`, {
    method: "POST",
  });
}

export function adminListBookings(date: string): Promise<Booking[]> {
  return apiRequest<Booking[]>(`/admin/bookings?date=${encodeURIComponent(date)}`, {
    credentials: "include",
  });
}

export function adminCancelBooking(reference: string): Promise<Booking> {
  return apiRequest<Booking>(`/admin/bookings/${encodeURIComponent(reference)}/cancel`, {
    method: "POST",
    credentials: "include",
  });
}
