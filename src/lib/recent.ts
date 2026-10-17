import type { PublicationData, TalkData } from '../content/schemas';

export interface RecentItem {
  title: string;
  date: string;
  meta: string;
  href: string;
}

const sortKey = (date: string) => (date.length === 4 ? `${date}-01-01` : date);

/** The n most recent talks and publications, newest first. */
export function recentItems(talks: TalkData[], publications: PublicationData[], n = 4): RecentItem[] {
  const items: RecentItem[] = [
    ...talks.map((t) => ({
      title: t.title,
      date: t.date,
      meta: `${t.event}, ${t.place}`,
      href: t.url ?? `/writing#${t.slug}`,
    })),
    ...publications.map((p) => ({
      title: p.title,
      date: p.date,
      meta: p.venue,
      href: p.url ?? `/writing#${p.slug}`,
    })),
  ];
  return items.sort((a, b) => sortKey(b.date).localeCompare(sortKey(a.date))).slice(0, n);
}
