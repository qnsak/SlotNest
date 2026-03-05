import { useEffect, useState } from "react";

import { useAdminIntervals } from "../../features/intervals/hooks";
import { IntervalList } from "../../features/intervals/ui/IntervalList";
import { Alert } from "../../shared/ui/Alert";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { Input } from "../../shared/ui/Input";
import { addDays, formatDateInput, todayDateString } from "../../shared/lib/date";

export function AdminIntervalsPage() {
  const [from, setFrom] = useState(todayDateString());
  const [to, setTo] = useState(formatDateInput(addDays(new Date(), 14)));
  const [date, setDate] = useState(todayDateString());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const { items, loading, error, fetchAdminIntervals, createInterval, removeInterval } = useAdminIntervals();

  useEffect(() => {
    void fetchAdminIntervals(from, to);
  }, [fetchAdminIntervals, from, to]);

  const handleCreate = async () => {
    const ok = await createInterval({ date, start_time: startTime, end_time: endTime });
    if (ok) {
      await fetchAdminIntervals(from, to);
    }
  };

  const handleDelete = async (intervalId: number) => {
    const ok = await removeInterval(intervalId);
    if (ok) {
      await fetchAdminIntervals(from, to);
    }
  };

  return (
    <>
      <Card>
        <h2>Admin Intervals</h2>
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          <label>
            From
            <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </label>
          <label>
            To
            <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </label>
          <Button type="button" onClick={() => void fetchAdminIntervals(from, to)}>
            Refresh
          </Button>
        </div>
      </Card>

      <Card>
        <h3>Create Interval</h3>
        <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <Input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
          <Input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
          <Button type="button" onClick={() => void handleCreate()}>
            Create
          </Button>
        </div>
      </Card>

      {loading ? <Alert kind="info">Loading...</Alert> : null}
      {error ? <Alert kind="error">{error}</Alert> : null}
      <IntervalList intervals={items} onDelete={(intervalId) => void handleDelete(intervalId)} />
    </>
  );
}
