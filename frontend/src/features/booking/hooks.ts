import { useCallback, useState } from "react";

import { ApiError, toUserMessage } from "../../shared/api/errors";
import {
  adminCancelBooking,
  adminListBookings,
  cancelBooking,
  createBooking,
  getBooking,
} from "./api";
import type { Booking } from "./types";

export function useCreateBooking() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const submit = useCallback(async (intervalId: number) => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    try {
      const data = await createBooking(intervalId);
      setBooking(data);
      return { booking: data, errorCode: null as string | null };
    } catch (errorValue) {
      setError(toUserMessage(errorValue));
      const code = errorValue instanceof ApiError ? errorValue.code : null;
      setErrorCode(code);
      return { booking: null, errorCode: code };
    } finally {
      setLoading(false);
    }
  }, []);

  return { booking, loading, error, errorCode, submit };
}

export function useBookingLookup() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async (reference: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBooking(reference);
      setBooking(data);
      return data;
    } catch (errorValue) {
      setError(toUserMessage(errorValue));
      setBooking(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancel = useCallback(async (reference: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await cancelBooking(reference);
      setBooking(data);
      return data;
    } catch (errorValue) {
      setError(toUserMessage(errorValue));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { booking, loading, error, lookup, cancel };
}

export function useAdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByDate = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminListBookings(date);
      setBookings(data);
    } catch (errorValue) {
      setError(toUserMessage(errorValue));
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelByAdmin = useCallback(async (reference: string) => {
    setError(null);
    try {
      await adminCancelBooking(reference);
      return true;
    } catch (errorValue) {
      setError(toUserMessage(errorValue));
      return false;
    }
  }, []);

  return { bookings, loading, error, fetchByDate, cancelByAdmin };
}
