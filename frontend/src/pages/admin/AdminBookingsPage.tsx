import { useEffect, useState } from "react";

import { useAdminBookings } from "../../features/booking/hooks";
import { BookingCard } from "../../features/booking/ui/BookingCard";
import { Alert } from "../../shared/ui/Alert";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { Input } from "../../shared/ui/Input";
import { todayDateString } from "../../shared/lib/date";

export function AdminBookingsPage() {
  const [date, setDate] = useState(todayDateString());
  const { bookings, loading, error, fetchByDate, cancelByAdmin } = useAdminBookings();

  useEffect(() => {
    void fetchByDate(date);
  }, [date, fetchByDate]);

  return (
    <>
      <Card>
        <h2>Admin Bookings</h2>
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <Button type="button" onClick={() => void fetchByDate(date)}>
            Refresh
          </Button>
        </div>
      </Card>

      {loading ? <Alert kind="info">Loading bookings...</Alert> : null}
      {error ? <Alert kind="error">{error}</Alert> : null}

      {bookings.map((booking) => (
        <BookingCard
          key={booking.booking_reference}
          booking={booking}
          onCancel={(reference) => {
            void (async () => {
              const ok = await cancelByAdmin(reference);
              if (ok) {
                await fetchByDate(date);
              }
            })();
          }}
        />
      ))}
    </>
  );
}
