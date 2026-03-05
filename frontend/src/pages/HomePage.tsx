import { useEffect, useMemo, useState } from "react";

import { useCreateBooking } from "../features/booking/hooks";
import { BookingCard } from "../features/booking/ui/BookingCard";
import { useIntervals } from "../features/intervals/hooks";
import { Alert } from "../shared/ui/Alert";
import { Button } from "../shared/ui/Button";
import { Card } from "../shared/ui/Card";
import { Modal } from "../shared/ui/Modal";
import { addDays, addMonths, formatDateInput, minDate, parseDateInput, startOfDay } from "../shared/lib/date";
import type { Interval } from "../features/intervals/types";

type ViewMode = "week" | "quick";

type WeekOption = {
  from: string;
  to: string;
  label: string;
};

function weekdayLabel(value: string): string {
  const weekday = parseDateInput(value).toLocaleDateString("zh-TW", { weekday: "short" });
  return weekday.replace("週", "");
}

function buildWeekOptions(today: Date): WeekOption[] {
  const firstDate = addDays(today, 1);
  const maxDate = addMonths(today, 3);
  const options: WeekOption[] = [];
  let cursor = firstDate;

  while (cursor.getTime() <= maxDate.getTime()) {
    const weekEnd = minDate(addDays(cursor, 6), maxDate);
    options.push({
      from: formatDateInput(cursor),
      to: formatDateInput(weekEnd),
      label: `${formatDateInput(cursor)} ~ ${formatDateInput(weekEnd)}`,
    });
    cursor = addDays(cursor, 7);
  }

  return options;
}

function groupByDate(intervals: Interval[]): Record<string, Interval[]> {
  return intervals.reduce<Record<string, Interval[]>>((acc, interval) => {
    if (!acc[interval.date]) {
      acc[interval.date] = [];
    }
    acc[interval.date].push(interval);
    return acc;
  }, {});
}

export function HomePage() {
  const { items, loading, error, fetchUserIntervals } = useIntervals();
  const { booking, loading: bookingLoading, error: bookingError, submit } = useCreateBooking();
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [weekIndex, setWeekIndex] = useState(0);
  const [selectedQuickDate, setSelectedQuickDate] = useState<string | null>(null);
  const [confirmInterval, setConfirmInterval] = useState<Interval | null>(null);

  const weekOptions = useMemo(() => buildWeekOptions(startOfDay(new Date())), []);
  const selectedWeek = weekOptions[weekIndex] ?? null;
  const grouped = useMemo(() => groupByDate(items), [items]);
  const availableDates = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  useEffect(() => {
    if (!selectedWeek) {
      return;
    }
    void fetchUserIntervals(selectedWeek.from, selectedWeek.to);
  }, [fetchUserIntervals, selectedWeek]);

  useEffect(() => {
    if (availableDates.length === 0) {
      setSelectedQuickDate(null);
      return;
    }
    setSelectedQuickDate((prev) => (prev && availableDates.includes(prev) ? prev : availableDates[0]));
  }, [availableDates]);

  const handleBook = async (intervalId: number) => {
    if (bookingLoading) {
      return;
    }
    const interval = items.find((item) => item.id === intervalId);
    if (!interval) {
      return;
    }
    setConfirmInterval(interval);
  };

  const canGoPrev = weekIndex > 0;
  const canGoNext = weekIndex < weekOptions.length - 1;
  const quickIntervals = selectedQuickDate ? grouped[selectedQuickDate] ?? [] : [];

  const handleConfirmBooking = async () => {
    if (!selectedWeek || !confirmInterval || bookingLoading) {
      return;
    }
    const result = await submit(confirmInterval.id);
    setConfirmInterval(null);
    if (result.booking || result.errorCode === "INTERVAL_ALREADY_BOOKED") {
      await fetchUserIntervals(selectedWeek.from, selectedWeek.to);
    }
  };

  const renderIntervals = (intervals: Interval[]) => (
    <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
      {intervals.map((interval) => (
        <div
          key={interval.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            border: "1px solid #F0CCB8",
            borderRadius: 12,
            padding: 10,
            background: "#FFF8F3",
            boxShadow: "0 4px 16px rgba(217, 81, 44, 0.08)",
          }}
        >
          <span>{interval.start_time} - {interval.end_time}</span>
          <Button
            type="button"
            disabled={bookingLoading}
            onClick={() => void handleBook(interval.id)}
          >
            {bookingLoading ? "預約中..." : "預約"}
          </Button>
        </div>
      ))}
    </div>
  );

  const handleCopyReference = async () => {
    if (!booking) {
      return;
    }
    try {
      await navigator.clipboard.writeText(booking.booking_reference);
    } catch {
      // Ignore clipboard write failures.
    }
  };

  return (
    <>
      <Card>
        <h2>選擇預約時段</h2>
        <p style={{ marginTop: 8 }}>請選擇後台開放的可預約時段。</p>

        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <Button
            type="button"
            disabled={!canGoPrev}
            onClick={() => setWeekIndex((prev) => Math.max(0, prev - 1))}
          >
            上一週
          </Button>
          <select
            value={weekIndex}
            onChange={(event) => setWeekIndex(Number(event.target.value))}
            style={{
              padding: "9px 11px",
              borderRadius: 12,
              border: "1px solid #EFC6AE",
              minWidth: 220,
              background: "#FFF9F4",
              color: "#2E1A0E",
            }}
          >
            {weekOptions.map((week, index) => (
              <option key={week.label} value={index}>
                {week.label}
              </option>
            ))}
          </select>
          <Button
            type="button"
            disabled={!canGoNext}
            onClick={() => setWeekIndex((prev) => Math.min(weekOptions.length - 1, prev + 1))}
          >
            下一週
          </Button>
          <Button
            type="button"
            onClick={() => setViewMode("week")}
            style={{
              background: viewMode === "week" ? "linear-gradient(135deg, #D9512C 0%, #EB6A43 100%)" : "#F7E6DB",
              color: viewMode === "week" ? "#fff" : "#8E3C24",
              borderColor: "#EFC6AE",
            }}
          >
            一般模式
          </Button>
          <Button
            type="button"
            onClick={() => setViewMode("quick")}
            style={{
              background:
                viewMode === "quick" ? "linear-gradient(135deg, #D9512C 0%, #EB6A43 100%)" : "#F7E6DB",
              color: viewMode === "quick" ? "#fff" : "#8E3C24",
              borderColor: "#EFC6AE",
            }}
          >
            快速查詢
          </Button>
        </div>
      </Card>

      {loading ? <Alert kind="info">載入可預約時段中...</Alert> : null}
      {error ? <Alert kind="error">{error}</Alert> : null}
      {!loading && !error && items.length === 0 ? (
        <Alert kind="info">此週目前無可預約時段。</Alert>
      ) : null}

      {!loading && !error && items.length > 0 && viewMode === "week" ? (
        <div style={{ display: "grid", gap: 10 }}>
          {availableDates.map((date) => (
            <Card key={date}>
              <h3 style={{ margin: 0 }}>{date} (週{weekdayLabel(date)})</h3>
              {renderIntervals(grouped[date] ?? [])}
            </Card>
          ))}
        </div>
      ) : null}

      {!loading && !error && items.length > 0 && viewMode === "quick" ? (
        <Card>
          <h3 style={{ marginTop: 0 }}>可預約日期</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {availableDates.map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedQuickDate(date)}
                style={{
                  border: "1px solid #EFC6AE",
                  borderRadius: 999,
                  padding: "6px 10px",
                  background: selectedQuickDate === date ? "#D9512C" : "#FFF8F3",
                  color: selectedQuickDate === date ? "#fff" : "#2E1A0E",
                  cursor: "pointer",
                  boxShadow:
                    selectedQuickDate === date
                      ? "0 8px 18px rgba(217, 81, 44, 0.24)"
                      : "0 4px 14px rgba(217, 81, 44, 0.1)",
                }}
              >
                {date} (週{weekdayLabel(date)}) · {grouped[date]?.length ?? 0} slots
              </button>
            ))}
          </div>

          {selectedQuickDate ? (
            <div style={{ marginTop: 12 }}>
              <strong>{selectedQuickDate} (週{weekdayLabel(selectedQuickDate)})</strong>
              {renderIntervals(quickIntervals)}
            </div>
          ) : null}
        </Card>
      ) : null}

      {bookingError ? <Alert kind="error">{bookingError}</Alert> : null}
      {bookingLoading ? <Alert kind="info">建立預約中...</Alert> : null}
      {booking ? (
        <Card>
          <Alert kind="success">預約成功，請保存 booking reference。</Alert>
          <BookingCard booking={booking} />
          <div style={{ marginTop: 10 }}>
            <Button type="button" onClick={() => void handleCopyReference()}>
              複製 booking reference
            </Button>
          </div>
        </Card>
      ) : null}

      <Modal
        open={confirmInterval !== null}
        title="確認預約"
        onClose={() => {
          if (!bookingLoading) {
            setConfirmInterval(null);
          }
        }}
        footer={
          <>
              <Button
                type="button"
                disabled={bookingLoading}
                onClick={() => setConfirmInterval(null)}
                variant="ghost"
              >
                取消
              </Button>
            <Button
              type="button"
              disabled={bookingLoading}
              onClick={() => void handleConfirmBooking()}
            >
              {bookingLoading ? "預約中..." : "確認預約"}
            </Button>
          </>
        }
      >
        {confirmInterval ? (
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ color: "#6A3B23" }}>請再次確認以下時段：</p>
            <div
              style={{
                border: "1px solid #F0CCB8",
                borderRadius: 12,
                padding: "10px 12px",
                background: "#FFF6F0",
              }}
            >
              <strong>{confirmInterval.date}</strong>
              <div style={{ marginTop: 4 }}>
                {confirmInterval.start_time} - {confirmInterval.end_time}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
