const DAY_MS = 24 * 60 * 60 * 1000;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatDateInput(value: Date): string {
  return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
}

export function parseDateInput(value: string): Date {
  const [year, month, day] = value.split("-").map((part) => Number(part));
  return new Date(year, month - 1, day);
}

export function addDays(value: Date, days: number): Date {
  const next = new Date(value.getTime() + days * DAY_MS);
  return new Date(next.getFullYear(), next.getMonth(), next.getDate());
}

export function addMonths(value: Date, months: number): Date {
  const next = new Date(value.getFullYear(), value.getMonth() + months, value.getDate());
  return new Date(next.getFullYear(), next.getMonth(), next.getDate());
}

export function minDate(left: Date, right: Date): Date {
  return left.getTime() <= right.getTime() ? left : right;
}

export function maxDate(left: Date, right: Date): Date {
  return left.getTime() >= right.getTime() ? left : right;
}

export function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function todayDateString(): string {
  return formatDateInput(startOfDay(new Date()));
}
