export function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function daysBetween(from: Date, to: Date): number {
  const a = startOfDay(from).getTime();
  const b = startOfDay(to).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

/** Days remaining until due date (negative if overdue). Null if no due date. */
export function daysRemaining(dueDate?: string | null, today: Date = new Date()): number | null {
  if (!dueDate) return null;
  return daysBetween(today, new Date(dueDate));
}

export function dueLabel(remaining: number | null): string {
  if (remaining === null) return 'No Due Date';
  if (remaining < 0) return `Overdue by ${Math.abs(remaining)} Days`;
  if (remaining === 0) return 'Due Today';
  if (remaining === 1) return 'Due Tomorrow';
  return `${remaining} Days Remaining`;
}

/** Color coding per spec: Green 15+, Yellow 7-15, Orange 3-6, Red 0-2, Dark Red overdue */
export function dueColor(remaining: number | null): string {
  if (remaining === null) return '#64748b';
  if (remaining < 0) return '#7f1d1d'; // dark red
  if (remaining <= 2) return '#ef4444'; // red
  if (remaining <= 6) return '#f97316'; // orange
  if (remaining <= 15) return '#eab308'; // yellow
  return '#16a34a'; // green
}

export function delayDays(dueDate?: string | null, actualDelivery?: string | null, today: Date = new Date()): number {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const end = actualDelivery ? new Date(actualDelivery) : today;
  const diff = daysBetween(due, end);
  return diff > 0 ? diff : 0;
}
