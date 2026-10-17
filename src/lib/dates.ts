const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "2026-10-16" → "16 October 2026"; a year-only date is returned as is. */
export function formatDate(date: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return date;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

/** A sortable key: a year-only date sorts as 1 January of that year. */
export const sortableDate = (date: string) => (date.length === 4 ? `${date}-01-01` : date);

/** Newest first. */
export const byDateDesc = <T extends { date: string }>(a: T, b: T) => sortableDate(b.date).localeCompare(sortableDate(a.date));
