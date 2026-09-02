export function todayLocalISO(): string {
  const d = new Date();
  return toISODate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function endOfCurrentMonthISO(): string {
  const d = new Date();
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return toISODate(last.getFullYear(), last.getMonth() + 1, last.getDate());
}

function toISODate(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${m}-${dd}`;
}