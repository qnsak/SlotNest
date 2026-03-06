import { useEffect, useMemo, useState } from "react";

import { useCreateBooking } from "../features/booking/hooks";
import { BookingCard } from "../features/booking/ui/BookingCard";
import { getIntervals } from "../features/intervals/api";
import { useIntervals } from "../features/intervals/hooks";
import { toUserMessage } from "../shared/api/errors";
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
  const [quickItemsData, setQuickItemsData] = useState<Interval[]>([]);
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);
  const [quickPage, setQuickPage] = useState(1);
  const [confirmInterval, setConfirmInterval] = useState<Interval | null>(null);
  const [messagePopup, setMessagePopup] = useState<{ title: string; message: string } | null>(null);

  const weekOptions = useMemo(() => buildWeekOptions(startOfDay(new Date())), []);
  const selectedWeek = weekOptions[weekIndex] ?? null;
  const grouped = useMemo(() => groupByDate(items), [items]);
  const availableDates = useMemo(() => Object.keys(grouped).sort(), [grouped]);
  const quickPageSize = 10;
  const quickItems = useMemo(
    () =>
      [...quickItemsData].sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) {
          return dateCompare;
        }
        return a.start_time.localeCompare(b.start_time);
      }),
    [quickItemsData]
  );
  const quickTotalPages = Math.max(1, Math.ceil(quickItems.length / quickPageSize));
  const quickCurrentPage = Math.min(quickPage, quickTotalPages);
  const quickPageItems = useMemo(() => {
    const start = (quickCurrentPage - 1) * quickPageSize;
    return quickItems.slice(start, start + quickPageSize);
  }, [quickCurrentPage, quickItems]);

  useEffect(() => {
    if (viewMode !== "week" || !selectedWeek) {
      return;
    }
    void fetchUserIntervals(selectedWeek.from, selectedWeek.to);
  }, [fetchUserIntervals, selectedWeek, viewMode]);

  const fetchQuickIntervals = async () => {
    setQuickLoading(true);
    setQuickError(null);
    try {
      const data = await getIntervals();
      setQuickItemsData(data);
    } catch (errorValue) {
      setQuickError(toUserMessage(errorValue));
      setQuickItemsData([]);
    } finally {
      setQuickLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode !== "quick") {
      return;
    }
    void fetchQuickIntervals();
  }, [viewMode]);

  useEffect(() => {
    if (quickCurrentPage > quickTotalPages) {
      setQuickPage(quickTotalPages);
    }
  }, [quickCurrentPage, quickTotalPages]);

  const intervalById = useMemo(() => {
    const map = new Map<number, Interval>();
    for (const interval of items) {
      map.set(interval.id, interval);
    }
    for (const interval of quickItemsData) {
      map.set(interval.id, interval);
    }
    return map;
  }, [items, quickItemsData]);

  useEffect(() => {
    if (!selectedWeek) {
      return;
    }
    setQuickPage(1);
  }, [selectedWeek, viewMode]);

  const handleBook = async (intervalId: number) => {
    if (bookingLoading) {
      return;
    }
    const interval = intervalById.get(intervalId);
    if (!interval) {
      return;
    }
    setConfirmInterval(interval);
  };

  const canGoPrev = weekIndex > 0;
  const canGoNext = weekIndex < weekOptions.length - 1;

  useEffect(() => {
    if (error && viewMode === "week") {
      setMessagePopup({ title: "系統提示", message: error });
    }
  }, [error, viewMode]);

  useEffect(() => {
    if (quickError && viewMode === "quick") {
      setMessagePopup({ title: "系統提示", message: quickError });
    }
  }, [quickError, viewMode]);

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
      if (viewMode === "week") {
        await fetchUserIntervals(selectedWeek.from, selectedWeek.to);
      } else {
        await fetchQuickIntervals();
      }
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

        <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
          <div
            style={{
              border: "1px solid var(--sn-border)",
              borderRadius: 8,
              padding: 12,
              background: "var(--sn-surface)",
            }}
          >
            <p className="text-sub" style={{ marginBottom: 8 }}>
              模式切換
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              <Button
                type="button"
                onClick={() => setViewMode("week")}
                style={{
                  background: viewMode === "week" ? "var(--sn-primary)" : "var(--sn-surface-soft)",
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
                  background: viewMode === "quick" ? "var(--sn-primary)" : "var(--sn-surface-soft)",
                  color: viewMode === "quick" ? "#fff" : "var(--sn-text-sub)",
                  borderColor: "var(--sn-border)",
                }}
              >
                快速查詢
              </Button>
            </div>
          </div>

          {viewMode === "week" ? (
            <div
              style={{
                border: "1px solid var(--sn-border)",
                borderRadius: 8,
                padding: 12,
                background: "var(--sn-surface)",
              }}
            >
              <>
                <p className="text-sub" style={{ marginBottom: 8 }}>
                  一般模式專屬
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
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
                </div>
              </>
            </div>
          ) : null}
        </div>
      </Card>

      {viewMode === "week" && !loading && !error && items.length === 0 ? (
        <Alert kind="info">此週目前無可預約時段。</Alert>
      ) : null}
      {viewMode === "quick" && !quickLoading && !quickError && quickItems.length === 0 ? (
        <Alert kind="info">目前沒有可預約時段。</Alert>
      ) : null}
      {viewMode === "quick" && quickLoading ? <Alert kind="info">載入可預約時段中...</Alert> : null}

      {viewMode === "week" && !loading && !error && items.length > 0 ? (
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
      {viewMode === "quick" && !quickLoading && !quickError && quickItems.length > 0 ? (
        <Card>
          <h3 className="section-title" style={{ marginTop: 0, marginBottom: 8 }}>
            可預約時段
          </h3>
          <p className="text-sub">
            共 {quickItems.length} 筆，頁面 {quickCurrentPage} / {quickTotalPages}
          </p>
          {renderIntervals(quickPageItems)}
          <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button
              type="button"
              variant="ghost"
              disabled={quickCurrentPage <= 1}
              onClick={() => setQuickPage((prev) => Math.max(1, prev - 1))}
            >
              上一頁
            </Button>
            <span className="text-sub">
              第 {quickCurrentPage} 頁 / 共 {quickTotalPages} 頁
            </span>
            <Button
              type="button"
              variant="ghost"
              disabled={quickCurrentPage >= quickTotalPages}
              onClick={() => setQuickPage((prev) => Math.min(quickTotalPages, prev + 1))}
            >
              下一頁
            </Button>
          </div>
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
