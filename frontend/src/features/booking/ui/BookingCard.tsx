import type { Booking } from "../types";
import { Alert } from "../../../shared/ui/Alert";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";

type Props = {
  booking: Booking;
  onCancel?: (reference: string) => void;
};

export function BookingCard({ booking, onCancel }: Props) {
  return (
    <Card>
      <div style={{ display: "grid", gap: 8 }}>
        <div>
          <strong>Reference:</strong> {booking.booking_reference}
        </div>
        <div>
          <strong>Interval:</strong> #{booking.interval_id}
        </div>
        <div>
          <strong>Status:</strong> {booking.status}
        </div>
        {booking.status === "CANCELED" ? <Alert kind="info">This booking is canceled.</Alert> : null}
        {onCancel && booking.status === "ACTIVE" ? (
          <Button type="button" onClick={() => onCancel(booking.booking_reference)}>
            Cancel Booking
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
