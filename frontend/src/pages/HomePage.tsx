import { useEffect, useState } from "react";

import { useCreateBooking } from "../features/booking/hooks";
import { BookingCard } from "../features/booking/ui/BookingCard";
import { useIntervals } from "../features/intervals/hooks";
import { IntervalList } from "../features/intervals/ui/IntervalList";
import { Alert } from "../shared/ui/Alert";
import { Button } from "../shared/ui/Button";
import { Card } from "../shared/ui/Card";
import { Input } from "../shared/ui/Input";
import { addDays, formatDateInput, todayDateString } from "../shared/lib/date";

export function HomePage() {
  const [from, setFrom] = useState(todayDateString());
  const [to, setTo] = useState(formatDateInput(addDays(new Date(), 7)));

  const { items, loading, error, fetchUserIntervals } = useIntervals();
  const { booking, error: bookingError, submit } = useCreateBooking();

  useEffect(() => {
    void fetchUserIntervals(from, to);
  }, [fetchUserIntervals, from, to]);

  return (
    <>
      <Card>
        <h2>User Booking (LIFF)</h2>
        <p style={{ marginTop: 8 }}>Select range and book an interval.</p>
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <label>
            From
            <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </label>
          <label>
            To
            <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </label>
          <Button type="button" onClick={() => void fetchUserIntervals(from, to)}>
            Refresh Intervals
          </Button>
        </div>
      </Card>

      {loading ? <Alert kind="info">Loading intervals...</Alert> : null}
      {error ? <Alert kind="error">{error}</Alert> : null}
      <IntervalList intervals={items} onBook={(intervalId) => void submit(intervalId)} />

      {bookingError ? <Alert kind="error">{bookingError}</Alert> : null}
      {booking ? (
        <Card>
          <BookingCard booking={booking} />
          <div style={{ marginTop: 10 }}>
            <Button
              type="button"
              onClick={() => void navigator.clipboard.writeText(booking.booking_reference)}
            >
              Copy booking reference
            </Button>
          </div>
        </Card>
      ) : null}
    </>
  );
}
