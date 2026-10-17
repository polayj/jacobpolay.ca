import type { PublicationData } from '../content/schemas';
import { formatDate } from './dates';

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const year = (p: PublicationData) => p.date.slice(0, 4);

/** "2026-07-13" → "July 13, 2026" (Chicago's month-day-year order). */
function chicagoDate(date: string): string {
  const [day, month, y] = formatDate(date).split(' ');
  return month ? `${month} ${day}, ${y}` : date;
}

function authorList(p: PublicationData): string {
  const names = p.authors.map((a, i) => (i === 0 ? `${a.family}, ${a.given}` : `${a.given} ${a.family}`));
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

const endSentence = (s: string) => (/[.?!]$/.test(s) ? s : `${s}.`);

function link(p: PublicationData): string | undefined {
  return p.doi ? `https://doi.org/${p.doi}` : p.url;
}

/** A Chicago (notes-bibliography) bibliography entry. Plain text unless html is set, which italicizes the venue and links the URL. */
export function chicago(p: PublicationData, opts: { html?: boolean } = {}): string {
  const esc = opts.html ? escapeHtml : (s: string) => s;
  const venue = opts.html ? `<i>${esc(p.venue)}</i>` : p.venue;
  const title = endSentence(p.title.replace(/"/g, "'"));
  let where: string;
  switch (p.type) {
    case 'article':
      where = `${venue}${p.volume ? ` ${p.volume}` : ''}${p.issue ? `, no. ${p.issue}` : ''} (${year(p)})${p.pages ? `: ${p.pages}` : ''}.`;
      break;
    case 'working-paper':
      where = `${venue}${p.number ? `, no. ${p.number}` : ''} (${year(p)}).`;
      break;
    case 'blog-post':
      where = `${venue}, ${chicagoDate(p.date)}.`;
      break;
  }
  const url = link(p);
  const shownUrl = url && (opts.html ? `<a href="${esc(url)}">${esc(url)}</a>` : url);
  return `${esc(endSentence(authorList(p)))} "${esc(title)}" ${where}${shownUrl ? ` ${shownUrl}.` : ''}`;
}

const ascii = (s: string) => s.normalize('NFD').replace(/[^a-zA-Z]/g, '').toLowerCase();

/** First author's family name + year + first significant title word, e.g. "polay2026archive". */
export function bibtexKey(p: PublicationData): string {
  const word = p.title.split(/\s+/).map(ascii).find((w) => w && !['a', 'an', 'the'].includes(w)) ?? '';
  return `${ascii(p.authors[0].family)}${year(p)}${word}`;
}

/** A BibTeX/BibLaTeX entry: @article, @techreport (working paper) or @online (blog post). */
export function bibtex(p: PublicationData): string {
  const entryType = { article: 'article', 'working-paper': 'techreport', 'blog-post': 'online' }[p.type];
  const fields: [string, string | undefined][] = [
    ['author', p.authors.map((a) => `${a.family}, ${a.given}`).join(' and ')],
    ['title', p.title],
    [p.type === 'article' ? 'journal' : p.type === 'working-paper' ? 'institution' : 'organization', p.venue],
    ['year', year(p)],
    ['date', p.date.length > 4 ? p.date : undefined],
    ['volume', p.volume],
    ['number', p.type === 'article' ? p.issue : p.number],
    ['pages', p.pages],
    ['doi', p.doi],
    ['url', p.url],
  ];
  const body = fields
    .filter(([, v]) => v)
    .map(([k, v]) => `  ${k} = {${v}}`)
    .join(',\n');
  return `@${entryType}{${bibtexKey(p)},\n${body}\n}\n`;
}
