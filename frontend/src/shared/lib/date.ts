const DAY_MS = 24 * 60 * 60 * 1000;

export function formatDateInput(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function addDays(value: Date, days: number): Date {
  return new Date(value.getTime() + days * DAY_MS);
}

export function todayDateString(): string {
  return formatDateInput(new Date());
}
