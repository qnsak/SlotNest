export function formatIntervalLabel(date: string, startTime: string, endTime: string): string {
  return `${date} ${startTime}-${endTime}`;
}

export function formatError(prefix: string, message: string): string {
  return `${prefix}: ${message}`;
}
