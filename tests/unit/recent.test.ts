import { describe, it, expect } from 'vitest';
import { recentItems } from '../../src/lib/recent';

const talks = [
  { slug: 'solving-ocr', title: 'Solving OCR', presenters: ['Jim Clifford'], event: 'EDH Seminar', place: 'Online', date: '2026-03-11', related: [] },
  { slug: 'fitting-machine-to-page', title: 'Fitting Machine to Page', presenters: ['Jacob Polay'], event: 'AI and History Conference', place: 'Baltimore', date: '2026-10-16', related: [] },
  { slug: 'reading-the-unreadable', title: 'Reading the Unreadable', presenters: ['Jacob Polay'], event: 'CSDH', place: 'Montreal', date: '2026-06-04', related: [], url: 'https://example.org/csdh' },
];
const pubs = [
  { slug: 'circumventing-the-garbler', type: 'article' as const, authors: [{ given: 'Jacob', family: 'Polay' }], title: 'Circumventing the Garbler', venue: 'Intersections', date: '2025', related: [] },
  { slug: 'archive-is-not-a-toy', type: 'blog-post' as const, authors: [{ given: 'Jacob', family: 'Polay' }], title: 'The Archive is Not a Toy', venue: 'Active History', date: '2026-07-13', related: [], url: 'https://activehistory.ca/x' },
  { slug: 'reading-the-archive-by-machine', type: 'working-paper' as const, authors: [{ given: 'Jim', family: 'Clifford' }], title: 'Reading the Archive by Machine', venue: 'WPCS', date: '2026', related: [] },
];

describe('recentItems', () => {
  it('returns n items newest first', () => {
    const items = recentItems(talks, pubs, 4);
    expect(items.map((i) => i.title)).toEqual([
      'Fitting Machine to Page',
      'The Archive is Not a Toy',
      'Reading the Unreadable',
      'Solving OCR',
    ]);
  });
  it('sorts a year-only date as January 1st', () => {
    const items = recentItems(talks, pubs, 6);
    expect(items.map((i) => i.title).slice(-2)).toEqual(['Reading the Archive by Machine', 'Circumventing the Garbler']);
  });
  it('uses the url when present, otherwise the writing anchor', () => {
    const items = recentItems(talks, pubs, 6);
    const by = Object.fromEntries(items.map((i) => [i.title, i.href]));
    expect(by['Reading the Unreadable']).toBe('https://example.org/csdh');
    expect(by['The Archive is Not a Toy']).toBe('https://activehistory.ca/x');
    expect(by['Fitting Machine to Page']).toBe('/writing#fitting-machine-to-page');
  });
  it('builds meta from event and place for talks, venue for publications', () => {
    const items = recentItems(talks, pubs, 2);
    expect(items[0].meta).toBe('AI and History Conference, Baltimore');
    expect(items[1].meta).toBe('Active History');
  });
});
