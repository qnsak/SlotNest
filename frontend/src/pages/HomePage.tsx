import { useEffect, useMemo, useState } from "react";

import { useCreateBooking } from "../features/booking/hooks";
import { BookingCard } from "../features/booking/ui/BookingCard";
import { getIntervals } from "../features/intervals/api";
import { useIntervals } from "../features/intervals/hooks";
import { toUserMessage } from "../shared/api/errors";
import { useI18n } from "../shared/i18n/provider";
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

function weekdayLabel(value: string, locale: "zh-TW" | "en"): string {
  const formatLocale = locale === "zh-TW" ? "zh-TW" : "en-US";
  const weekday = parseDateInput(value).toLocaleDateString(formatLocale, { weekday: "short" });
  return locale === "zh-TW" ? weekday.replace("週", "") : weekday;
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

function weekSummaryLabel(week: WeekOption | null, locale: "zh-TW" | "en"): string {
  if (!week) {
    return "-";
  }
  const start = parseDateInput(week.from);
  const end = parseDateInput(week.to);
  const formatLocale = locale === "zh-TW" ? "zh-TW" : "en-US";
  const startLabel = start.toLocaleDateString(formatLocale, { year: "numeric", month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString(formatLocale, { month: "short", day: "numeric" });
  return `${startLabel} — ${endLabel}`;
}

export function HomePage() {
  const { t, locale } = useI18n();
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
      setMessagePopup({ title: t("home_system_message_title"), message: error });
    }
  }, [error, t, viewMode]);

  useEffect(() => {
    if (quickError && viewMode === "quick") {
      setMessagePopup({ title: t("home_system_message_title"), message: quickError });
    }
  }, [quickError, t, viewMode]);

  useEffect(() => {
    if (bookingError) {
      setMessagePopup({ title: t("home_booking_failed_title"), message: bookingError });
    }
  }, [bookingError, t]);

  useEffect(() => {
    if (booking) {
      setMessagePopup({
        title: t("home_booking_success_title"),
        message: t("home_booking_success_message"),
      });
    }
  }, [booking, t]);

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
    <div className="slot-grid" style={{ marginTop: 14 }}>
      {intervals.map((interval) => (
        <div
          key={interval.id}
          className="slot-card slot-row"
          style={{
            padding: 16,
            animation: "sn-fade-in 0.24s ease",
          }}
        >
          <div style={{ display: "grid", gap: 2 }}>
            <span className="text-main">{interval.start_time} - {interval.end_time}</span>
            <span className="text-sub">{t("home_interval_available")}</span>
          </div>
          <Button
            type="button"
            disabled={bookingLoading}
            onClick={() => void handleBook(interval.id)}
          >
            {bookingLoading ? t("home_booking_in_progress") : t("common_book")}
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
        <h2 className="page-title">{t("home_title")}</h2>
        <p className="text-sub" style={{ marginTop: 10, lineHeight: 1.7 }}>
          {t("home_subtitle")}
        </p>

        <div className="mode-sections" style={{ marginTop: 18 }}>
          <div
            className="mode-section-card"
            style={{
              border: "1px solid var(--sn-border)",
              borderRadius: 8,
              padding: 12,
              background: "var(--sn-surface)",
            }}
          >
            <p className="text-sub" style={{ marginBottom: 8 }}>
              {t("home_mode_switch")}
            </p>
            <div className="mode-switch-row">
              <Button
                type="button"
                onClick={() => setViewMode("week")}
                style={{
                  background: viewMode === "week" ? "var(--sn-primary)" : "var(--sn-surface-soft)",
                  color: viewMode === "week" ? "#fff" : "var(--sn-text-sub)",
                  borderColor: "var(--sn-border)",
                }}
              >
                {t("home_mode_week")}
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
                {t("home_mode_quick")}
              </Button>
            </div>
          </div>

          {viewMode === "week" ? (
            <div
              className="mode-section-card"
              style={{
                border: "1px solid var(--sn-border)",
                borderRadius: 8,
                padding: 16,
                background: "var(--sn-surface)",
                boxShadow: "var(--sn-shadow-soft)",
              }}
            >
              <>
                <p className="text-sub" style={{ marginBottom: 12 }}>
                  {t("home_week_only")}
                </p>
                <div className="week-nav-row">
                  <Button
                    type="button"
                    disabled={!canGoPrev}
                    onClick={() => setWeekIndex((prev) => Math.max(0, prev - 1))}
                    style={{ minWidth: 44, padding: "8px 10px" }}
                  >
                    {t("home_week_prev")}
                  </Button>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div className="week-range-title" style={{ fontWeight: 600, lineHeight: 1.25, color: "var(--sn-text)" }}>
                      {weekSummaryLabel(selectedWeek, locale)}
                    </div>
                  </div>
                  <Button
                    type="button"
                    disabled={!canGoNext}
                    onClick={() => setWeekIndex((prev) => Math.min(weekOptions.length - 1, prev + 1))}
                    style={{ minWidth: 44, padding: "8px 10px" }}
                  >
                    {t("home_week_next")}
                  </Button>
                </div>
              </>
            </div>
          ) : null}
        </div>
      </Card>

      {viewMode === "week" && !loading && !error && items.length === 0 ? (
        <Alert kind="info">{t("home_week_empty")}</Alert>
      ) : null}
      {viewMode === "quick" && !quickLoading && !quickError && quickItems.length === 0 ? (
        <Alert kind="info">{t("home_quick_empty")}</Alert>
      ) : null}
      {viewMode === "quick" && quickLoading ? <Alert kind="info">{t("home_quick_loading")}</Alert> : null}

      {viewMode === "week" && !loading && !error && items.length > 0 ? (
        <div style={{ display: "grid", gap: 14 }}>
          {availableDates.map((date) => (
            <Card key={date}>
              <h3 className="section-title" style={{ margin: 0 }}>
                {date} ({weekdayLabel(date, locale)})
              </h3>
              {renderIntervals(grouped[date] ?? [])}
            </Card>
          ))}
        </div>
      ) : null}
      {viewMode === "quick" && !quickLoading && !quickError && quickItems.length > 0 ? (
        <Card>
          <h3 className="section-title" style={{ marginTop: 0, marginBottom: 8 }}>
            {t("home_quick_slots")}
          </h3>
          <p className="text-sub">
            {t("home_quick_summary", {
              total: quickItems.length,
              page: quickCurrentPage,
              pages: quickTotalPages,
            })}
          </p>
          {renderIntervals(quickPageItems)}
          <div className="quick-pagination" style={{ marginTop: 16 }}>
            <Button
              type="button"
              variant="ghost"
              disabled={quickCurrentPage <= 1}
              onClick={() => setQuickPage((prev) => Math.max(1, prev - 1))}
            >
              {t("common_prev_page")}
            </Button>
            <span className="text-sub">
              {t("home_quick_pagination", { page: quickCurrentPage, pages: quickTotalPages })}
            </span>
            <Button
              type="button"
              variant="ghost"
              disabled={quickCurrentPage >= quickTotalPages}
              onClick={() => setQuickPage((prev) => Math.min(quickTotalPages, prev + 1))}
            >
              {t("common_next_page")}
            </Button>
          </div>
        </Card>
      ) : null}

      {booking ? (
        <Card>
          <BookingCard booking={booking} />
          <div style={{ marginTop: 10 }}>
            <Button type="button" onClick={() => void handleCopyReference()}>
              {t("home_copy_reference")}
            </Button>
          </div>
        </Card>
      ) : null}

      <Modal
        open={confirmInterval !== null}
        title={t("home_confirm_booking_title")}
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
                {t("common_cancel")}
              </Button>
            <Button
              type="button"
              disabled={bookingLoading}
              onClick={() => void handleConfirmBooking()}
            >
              {bookingLoading ? t("home_booking_in_progress") : t("home_confirm_booking_action")}
            </Button>
          </>
        }
      >
        {confirmInterval ? (
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ color: "var(--sn-text)" }}>{t("home_confirm_booking_desc")}</p>
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
            {t("common_confirm")}
          </Button>
        }
      >
        {messagePopup ? <p style={{ lineHeight: 1.7 }}>{messagePopup.message}</p> : null}
      </Modal>
    </>
  );
}
