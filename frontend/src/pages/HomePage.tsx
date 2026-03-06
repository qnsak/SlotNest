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

const earthSelectStyle = {
  padding: "8px 12px",
  borderRadius: 12,
  border: "1px solid var(--sn-border)",
  minWidth: 220,
  background: "var(--sn-surface)",
  color: "var(--sn-text)",
};

export function HomePage() {
  const { items, loading, error, fetchUserIntervals } = useIntervals();
  const { booking, loading: bookingLoading, error: bookingError, submit } = useCreateBooking();
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [weekIndex, setWeekIndex] = useState(0);
  const [selectedQuickDate, setSelectedQuickDate] = useState<string | null>(null);
  const [confirmInterval, setConfirmInterval] = useState<Interval | null>(null);
  const [messagePopup, setMessagePopup] = useState<{ title: string; message: string } | null>(null);

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

  useEffect(() => {
    if (error) {
      setMessagePopup({ title: "系統提示", message: error });
    }
  }, [error]);

  useEffect(() => {
    if (bookingError) {
      setMessagePopup({ title: "預約失敗", message: bookingError });
    }
  }, [bookingError]);

  useEffect(() => {
    if (booking) {
      setMessagePopup({ title: "預約成功", message: "預約成功，請保存 booking reference。" });
    }
  }, [booking]);

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
    <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
      {intervals.map((interval) => (
        <div
          key={interval.id}
          className="slot-card"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: 16,
            animation: "sn-fade-in 0.24s ease",
          }}
        >
          <div style={{ display: "grid", gap: 2 }}>
            <span className="text-main">{interval.start_time} - {interval.end_time}</span>
            <span className="text-sub">Available</span>
          </div>
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
      <Card className="booking-toolbar">
        <h2 className="page-title">選擇預約時段</h2>
        <p className="text-sub" style={{ marginTop: 10, lineHeight: 1.7 }}>
          請選擇後台開放的可預約時段。
        </p>

        <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
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
            style={earthSelectStyle}
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
              background:
                viewMode === "week" ? "var(--sn-primary)" : "var(--sn-surface-soft)",
              color: viewMode === "week" ? "#fff" : "var(--sn-text-sub)",
              borderColor: "var(--sn-border)",
            }}
          >
            一般模式
          </Button>
          <Button
            type="button"
            onClick={() => setViewMode("quick")}
            style={{
              background:
                viewMode === "quick" ? "var(--sn-primary)" : "var(--sn-surface-soft)",
              color: viewMode === "quick" ? "#fff" : "var(--sn-text-sub)",
              borderColor: "var(--sn-border)",
            }}
          >
            快速查詢
          </Button>
        </div>
      </Card>

      {!loading && !error && items.length === 0 ? <Alert kind="info">此週目前無可預約時段。</Alert> : null}

      {!loading && !error && items.length > 0 && viewMode === "week" ? (
        <div style={{ display: "grid", gap: 14 }}>
          {availableDates.map((date) => (
            <Card key={date}>
              <h3 className="section-title" style={{ margin: 0 }}>
                {date} (週{weekdayLabel(date)})
              </h3>
              {renderIntervals(grouped[date] ?? [])}
            </Card>
          ))}
        </div>
      ) : null}

      {!loading && !error && items.length > 0 && viewMode === "quick" ? (
        <Card>
          <h3 className="section-title" style={{ marginTop: 0 }}>
            可預約日期
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {availableDates.map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedQuickDate(date)}
                style={{
                  border: "1px solid var(--sn-border)",
                  borderRadius: 4,
                  padding: "8px 12px",
                  background: selectedQuickDate === date ? "var(--sn-hover)" : "var(--sn-surface)",
                  color: selectedQuickDate === date ? "var(--sn-primary)" : "var(--sn-text-sub)",
                  cursor: "pointer",
                  boxShadow:
                    selectedQuickDate === date
                      ? "0 4px 10px rgba(47, 47, 47, 0.1)"
                      : "none",
                }}
              >
                {date} (週{weekdayLabel(date)}) · {grouped[date]?.length ?? 0} slots
              </button>
            ))}
          </div>

          {selectedQuickDate ? (
            <div style={{ marginTop: 16 }}>
              <strong>{selectedQuickDate} (週{weekdayLabel(selectedQuickDate)})</strong>
              {renderIntervals(quickIntervals)}
            </div>
          ) : null}
        </Card>
      ) : null}

      {booking ? (
        <Card>
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
            <p style={{ color: "var(--sn-text)" }}>請再次確認以下時段：</p>
            <div
              style={{
                border: "1px solid var(--sn-border)",
                borderRadius: 12,
                padding: "10px 12px",
                background: "var(--sn-surface-soft)",
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

      <Modal
        open={messagePopup !== null}
        title={messagePopup?.title ?? ""}
        onClose={() => setMessagePopup(null)}
        footer={
          <Button type="button" onClick={() => setMessagePopup(null)}>
            確定
          </Button>
        }
      >
        {messagePopup ? <p style={{ lineHeight: 1.7 }}>{messagePopup.message}</p> : null}
      </Modal>
    </>
  );
}
