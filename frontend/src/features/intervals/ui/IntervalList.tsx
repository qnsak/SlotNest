import type { Interval } from "../types";
import { useI18n } from "../../../shared/i18n/provider";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { formatIntervalLabel } from "../../../shared/lib/format";

type Props = {
  intervals: Interval[];
  onBook?: (intervalId: number) => void;
  onDelete?: (intervalId: number) => void;
};

export function IntervalList({ intervals, onBook, onDelete }: Props) {
  const { t } = useI18n();

  if (intervals.length === 0) {
    return <Card>{t("interval_list_empty")}</Card>;
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {intervals.map((interval) => (
        <Card key={interval.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span>{formatIntervalLabel(interval.date, interval.start_time, interval.end_time)}</span>
            <div style={{ display: "flex", gap: 8 }}>
              {onBook ? (
                <Button type="button" onClick={() => onBook(interval.id)}>
                  {t("interval_list_book")}
                </Button>
              ) : null}
              {onDelete ? (
                <Button type="button" onClick={() => onDelete(interval.id)}>
                  {t("interval_list_delete")}
                </Button>
              ) : null}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
