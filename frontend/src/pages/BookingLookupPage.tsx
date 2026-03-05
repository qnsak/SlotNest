import { useState } from "react";

import { useBookingLookup } from "../features/booking/hooks";
import { BookingCard } from "../features/booking/ui/BookingCard";
import { Alert } from "../shared/ui/Alert";
import { Button } from "../shared/ui/Button";
import { Card } from "../shared/ui/Card";
import { Input } from "../shared/ui/Input";

export function BookingLookupPage() {
  const [reference, setReference] = useState("");
  const { booking, loading, error, lookup, cancel } = useBookingLookup();

  return (
    <>
      <Card>
        <h2>Booking Lookup</h2>
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <label>
            Booking reference
            <Input
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="Paste booking reference"
            />
          </label>
          <Button type="button" onClick={() => void lookup(reference)} disabled={loading}>
            {loading ? "Looking up..." : "Lookup"}
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
