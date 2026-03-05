import type { ApiErrorCode, ApiErrorEnvelope } from "./types";

export class ApiClientError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;
  readonly details?: unknown;

  constructor(payload: ApiErrorEnvelope & { status?: number }) {
    super(payload.message);
    this.name = "ApiClientError";
    this.code = payload.code;
    this.status = payload.status;
    this.details = payload.details;
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  INTERVAL_ALREADY_BOOKED: "This time slot has already been booked.",
  INTERVAL_OVERLAP: "This interval overlaps with an existing interval.",
  INTERVAL_HAS_BOOKINGS: "This interval has active bookings and cannot be deleted.",
  BOOKING_NOT_FOUND: "Booking not found.",
  BOOKING_ALREADY_CANCELED: "This booking is already canceled.",
  OUT_OF_RANGE: "The selected date is outside the allowed range.",
  INTERVAL_NOT_FOUND: "Interval not found.",
  UNAUTHORIZED: "You are not authorized. Please check admin credentials.",
  VALIDATION_ERROR: "Invalid request data.",
  ADMIN_CREDENTIALS_MISSING: "Admin credentials are missing. Please sign in again.",
  HTTP_ERROR: "Request failed. Please try again.",
};

export function getErrorMessageByCode(code: ApiErrorCode): string {
  return ERROR_MESSAGES[code] ?? "Unexpected error occurred.";
}

export function toUserMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return getErrorMessageByCode(error.code);
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unexpected error occurred.";
}
