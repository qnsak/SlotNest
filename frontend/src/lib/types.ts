export type ApiErrorCode =
  | "OUT_OF_RANGE"
  | "INTERVAL_OVERLAP"
  | "INTERVAL_HAS_BOOKINGS"
  | "INTERVAL_ALREADY_BOOKED"
  | "INTERVAL_NOT_FOUND"
  | "BOOKING_NOT_FOUND"
  | "BOOKING_ALREADY_CANCELED"
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "HTTP_ERROR"
  | "ADMIN_CREDENTIALS_MISSING"
  | string;

export type ApiErrorEnvelope = {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
};

export type Interval = {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
};

export type Booking = {
  booking_reference: string;
  interval_id: number;
  status: "ACTIVE" | "CANCELED" | string;
};

export type CreateBookingPayload = {
  interval_id: number;
};

export type AdminCreateIntervalPayload = {
  date: string;
  start_time: string;
  end_time: string;
};

export type AdminDeleteIntervalResponse = {
  status: "ok" | string;
};
