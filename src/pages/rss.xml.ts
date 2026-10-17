import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { site } from '../site';
import { byDateDesc, sortableDate } from '../lib/dates';

export async function GET(context: APIContext) {
  const publications = (await getCollection('publications')).map((e) => ({ ...e.data, slug: e.id })).sort(byDateDesc);
  return rss({
    title: `${site.name}: writing`,
    description: 'Publications and public scholarship by Jacob Polay.',
    site: context.site ?? site.url,
    items: publications.map((p) => ({
      title: p.title,
      link: p.url ?? `/writing#${p.slug}`,
      pubDate: new Date(`${sortableDate(p.date)}T12:00:00Z`),
      description: p.summary ?? `${p.venue}, ${p.date.slice(0, 4)}.`,
    })),
  });
}
