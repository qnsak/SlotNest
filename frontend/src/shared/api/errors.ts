import type { ApiErrorEnvelope } from "./types";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, payload: ApiErrorEnvelope) {
    super(payload.message);
    this.name = "ApiError";
    this.status = status;
    this.code = payload.code;
    this.details = payload.details;
  }
}

const FRIENDLY_MESSAGES: Record<string, string> = {
  INTERVAL_ALREADY_BOOKED: "This time slot has already been booked.",
  INTERVAL_OVERLAP: "This interval overlaps with an existing interval.",
  INTERVAL_HAS_BOOKINGS: "This interval has active bookings and cannot be deleted.",
  INTERVAL_NOT_FOUND: "Interval not found.",
  BOOKING_NOT_FOUND: "Booking not found.",
  BOOKING_ALREADY_CANCELED: "This booking is already canceled.",
  OUT_OF_RANGE: "Selected date is outside the allowed booking range.",
  UNAUTHORIZED: "Session expired. Please sign in again.",
  VALIDATION_ERROR: "Invalid input. Please review your request.",
  HTTP_ERROR: "Request failed. Please try again.",
  LIFF_INIT_FAILED: "Unable to initialize LIFF. Please retry.",
  LIFF_TOKEN_MISSING: "Unable to retrieve LIFF token.",
};

export function mapErrorCodeToMessage(code: string): string {
  return FRIENDLY_MESSAGES[code] ?? "Unexpected error occurred.";
}

export function toUserMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return mapErrorCodeToMessage(error.code);
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unexpected error occurred.";
}
