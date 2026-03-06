import type { Booking } from "../types";
import { useI18n } from "../../../shared/i18n/provider";
import { Alert } from "../../../shared/ui/Alert";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";

type Props = {
  booking: Booking;
  onCancel?: (reference: string) => void;
};

export function BookingCard({ booking, onCancel }: Props) {
  const { t } = useI18n();

  return (
    <Card>
      <div style={{ display: "grid", gap: 8 }}>
        <div>
          <strong>{t("booking_card_reference")}:</strong> {booking.booking_reference}
        </div>
        <div>
          <strong>{t("booking_card_interval")}:</strong> #{booking.interval_id}
        </div>
        <div>
          <strong>{t("booking_card_status")}:</strong> {booking.status}
        </div>
        {booking.status === "CANCELED" ? <Alert kind="info">{t("booking_card_canceled")}</Alert> : null}
        {onCancel && booking.status === "ACTIVE" ? (
          <Button type="button" onClick={() => onCancel(booking.booking_reference)}>
            {t("booking_card_cancel")}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
