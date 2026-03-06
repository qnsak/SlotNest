import { useState } from "react";

import { useBookingLookup } from "../features/booking/hooks";
import { BookingCard } from "../features/booking/ui/BookingCard";
import { useI18n } from "../shared/i18n/provider";
import { Alert } from "../shared/ui/Alert";
import { Button } from "../shared/ui/Button";
import { Card } from "../shared/ui/Card";
import { Input } from "../shared/ui/Input";

export function BookingLookupPage() {
  const { t } = useI18n();
  const [reference, setReference] = useState("");
  const { booking, loading, error, lookup, cancel } = useBookingLookup();

  return (
    <>
      <Card>
        <h2>{t("booking_lookup_title")}</h2>
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <label>
            {t("booking_lookup_reference")}
            <Input
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder={t("booking_lookup_placeholder")}
            />
          </label>
          <Button type="button" onClick={() => void lookup(reference)} disabled={loading}>
            {loading ? t("booking_lookup_loading") : t("booking_lookup_action")}
          </Button>
        </div>
      </Card>

      {error ? <Alert kind="error">{error}</Alert> : null}

      {booking ? (
        <BookingCard booking={booking} onCancel={(value) => void cancel(value)} />
      ) : null}
    </>
  );
}
