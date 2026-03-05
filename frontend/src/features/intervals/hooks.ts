import { useCallback, useState } from "react";

import { toUserMessage } from "../../shared/api/errors";
import { getIntervals, adminCreateInterval, adminDeleteInterval, adminListIntervals } from "./api";
import type { AdminCreateIntervalPayload, Interval } from "./types";

export function useIntervals() {
  const [items, setItems] = useState<Interval[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserIntervals = useCallback(async (from?: string, to?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getIntervals(from, to);
      setItems(data);
    } catch (errorValue) {
      setError(toUserMessage(errorValue));
    } finally {
      setLoading(false);
    }
  }, []);

  return { items, loading, error, fetchUserIntervals };
}

export function useAdminIntervals() {
  const [items, setItems] = useState<Interval[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminIntervals = useCallback(async (from: string, to: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminListIntervals(from, to);
      setItems(data);
    } catch (errorValue) {
      setError(toUserMessage(errorValue));
    } finally {
      setLoading(false);
    }
  }, []);

  const createInterval = useCallback(async (payload: AdminCreateIntervalPayload) => {
    setError(null);
    try {
      await adminCreateInterval(payload);
      return true;
    } catch (errorValue) {
      setError(toUserMessage(errorValue));
      return false;
    }
  }, []);

  const removeInterval = useCallback(async (intervalId: number) => {
    setError(null);
    try {
      await adminDeleteInterval(intervalId);
      return true;
    } catch (errorValue) {
      setError(toUserMessage(errorValue));
      return false;
    }
  }, []);

  return {
    items,
    loading,
    error,
    fetchAdminIntervals,
    createInterval,
    removeInterval,
  };
}
