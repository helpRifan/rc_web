// Event dates are calendar dates (Postgres `date`), not instants, so they're formatted in UTC:
// 2027-03-14 is day 14 for every visitor, whatever their time zone.

export type EventDate =
  | { kind: 'date'; iso: string; day: string; monthYear: string; full: string }
  | { kind: 'label'; label: string };

type DatedEvent = { starts_on: string | null; date_label: string | null; series: string | null };

export function formatEventDate(e: DatedEvent): EventDate | null {
  if (e.starts_on) {
    const [y, m, d] = e.starts_on.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...o }).format(date);
    return {
      kind: 'date',
      iso: e.starts_on,
      day: String(d),
      monthYear: f({ month: 'long', year: 'numeric' }),
      full: f({ day: 'numeric', month: 'long', year: 'numeric' }),
    };
  }
  if (e.date_label) return { kind: 'label', label: e.date_label };
  if (e.series) return { kind: 'label', label: e.series };
  return null;
}

/** A calendar date as `D Month YYYY` (for issue dates and the like). */
export function formatDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

export const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'] as const;

/** Today's date in India (the club's calendar), as YYYY-MM-DD. */
export function todayInIndia(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** A YYYY-MM-DD date moved by a whole number of days. */
export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** "A, B and C" (no Oxford comma), as the copy rules ask. */
export function joinList(items: readonly string[]): string {
  return new Intl.ListFormat('en-GB', { type: 'conjunction' }).format(items);
}
