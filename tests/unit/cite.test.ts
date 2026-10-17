import { describe, it, expect } from 'vitest';
import { chicago, bibtex, bibtexKey } from '../../src/lib/cite';
import type { PublicationData } from '../../src/content/schemas';

const garbler: PublicationData = {
  slug: 'circumventing-the-garbler', type: 'article', authors: [{ given: 'Jacob', family: 'Polay' }],
  title: 'Circumventing the Garbler', venue: 'Intersections', date: '2025', volume: '8', issue: '1', pages: '28', related: [],
};
const benchmark: PublicationData = {
  slug: 'reading-the-archive-by-machine', type: 'working-paper',
  authors: [
    { given: 'Jim', family: 'Clifford' }, { given: 'Jacob', family: 'Polay' }, { given: 'Jessica', family: 'Jack' },
    { given: 'Mark', family: 'Humphries' }, { given: 'Lianne C.', family: 'Leddy' },
  ],
  title: 'Reading the Archive by Machine: An OCR Benchmark for Historians, 1612–1921', venue: 'Working Papers in Critical Search',
  number: '4', date: '2026', url: 'https://working-papers-in-critical-search.github.io/paper-004-ocr-benchmark/', related: [],
};
const toy: PublicationData = {
  slug: 'archive-is-not-a-toy', type: 'blog-post',
  authors: [{ given: 'Jacob', family: 'Polay' }, { given: 'Chloë', family: 'Farr' }, { given: 'Jessica', family: 'Jack' }],
  title: 'The Archive is Not a Toy: The Hidden Problems of a "Vintage" AI', venue: 'Active History', date: '2026-07-13',
  url: 'https://activehistory.ca/blog/2026/07/13/the-archive-is-not-a-toy-the-hidden-problems-of-a-vintage-ai/', related: [],
};

describe('chicago', () => {
  it('formats a journal article with curly quotes', () =>
    expect(chicago(garbler)).toBe('Polay, Jacob. “Circumventing the Garbler.” Intersections 8, no. 1 (2025): 28.'));
  it('formats a working paper with five authors', () =>
    expect(chicago(benchmark)).toBe(
      'Clifford, Jim, Jacob Polay, Jessica Jack, Mark Humphries, and Lianne C. Leddy. “Reading the Archive by Machine: An OCR Benchmark for Historians, 1612–1921.” Working Papers in Critical Search, no. 4 (2026). https://working-papers-in-critical-search.github.io/paper-004-ocr-benchmark/.',
    ));
  it('formats a blog post as (blog) with curly nested quotes', () =>
    expect(chicago(toy)).toBe(
      'Polay, Jacob, Chloë Farr, and Jessica Jack. “The Archive is Not a Toy: The Hidden Problems of a ‘Vintage’ AI.” Active History (blog), July 13, 2026. https://activehistory.ca/blog/2026/07/13/the-archive-is-not-a-toy-the-hidden-problems-of-a-vintage-ai/.',
    ));
  it('italicizes the venue, including a working-paper series, in html mode', () => {
    expect(chicago(garbler, { html: true })).toBe('Polay, Jacob. “Circumventing the Garbler.” <i>Intersections</i> 8, no. 1 (2025): 28.');
    expect(chicago(benchmark, { html: true })).toContain('<i>Working Papers in Critical Search</i>, no. 4');
    expect(chicago(toy, { html: true })).toContain('<i>Active History</i> (blog), July 13, 2026.');
  });
  it('links the URL in html mode', () =>
    expect(chicago(toy, { html: true })).toMatch(
      / <a href="https:\/\/activehistory\.ca\/blog\/2026\/07\/13\/the-archive-is-not-a-toy-the-hidden-problems-of-a-vintage-ai\/">https:\/\/activehistory\.ca\/blog\/2026\/07\/13\/the-archive-is-not-a-toy-the-hidden-problems-of-a-vintage-ai\/<\/a>\.$/,
    ));
  it('escapes html in html mode', () =>
    expect(chicago({ ...garbler, title: 'Tools & <Tricks>' }, { html: true })).toContain('“Tools &amp; &lt;Tricks&gt;.”'));
  it('adds no period after a title ending in ?', () =>
    expect(chicago({ ...garbler, title: 'Who Reads the Archive?' })).toContain('“Who Reads the Archive?” Intersections'));
  it('formats two authors with "and"', () =>
    expect(chicago({ ...garbler, authors: [{ given: 'Jacob', family: 'Polay' }, { given: 'Jim', family: 'Clifford' }] })).toMatch(
      /^Polay, Jacob, and Jim Clifford\. /,
    ));
  it('prefers a DOI link over the url', () =>
    expect(chicago({ ...benchmark, doi: '10.1234/abc' })).toMatch(/ https:\/\/doi\.org\/10\.1234\/abc\.$/));
});

describe('bibtexKey', () => {
  it.each([
    [garbler, 'polay2025circumventing'],
    [benchmark, 'clifford2026reading'],
    [toy, 'polay2026archive'],
  ])('%#', (p, key) => expect(bibtexKey(p)).toBe(key));
});

describe('bibtex', () => {
  const balanced = (s: string) => [...s].reduce((d, c) => (d < 0 ? d : d + (c === '{' ? 1 : c === '}' ? -1 : 0)), 0) === 0;
  it('uses @article, @techreport and @online', () => {
    expect(bibtex(garbler)).toMatch(/^@article\{polay2025circumventing,/);
    expect(bibtex(benchmark)).toMatch(/^@techreport\{clifford2026reading,/);
    expect(bibtex(toy)).toMatch(/^@online\{polay2026archive,/);
  });
  it('keeps UTF-8 and balances braces', () => {
    const t = bibtex(toy);
    const b = bibtex(benchmark);
    expect(t).toContain('Chloë');
    expect(b).toContain('1612–1921');
    for (const s of [bibtex(garbler), t, b]) expect(balanced(s)).toBe(true);
  });
  it('joins authors with "and" in family, given form', () =>
    expect(bibtex(toy)).toContain('author = {Polay, Jacob and Farr, Chloë and Jack, Jessica}'));
  it('protects title capitals with double braces', () =>
    expect(bibtex(benchmark)).toContain('title = {{Reading the Archive by Machine: An OCR Benchmark for Historians, 1612–1921}}'));
  it('escapes LaTeX special characters', () => {
    const b = bibtex({ ...garbler, title: 'Profit & Loss: 100% of #1', venue: 'Notes & Queries' });
    expect(b).toContain(String.raw`title = {{Profit \& Loss: 100\% of \#1}}`);
    expect(b).toContain(String.raw`journal = {Notes \& Queries}`);
  });
  it('includes doi only when set', () => {
    expect(bibtex(garbler)).not.toContain('doi');
    expect(bibtex({ ...garbler, doi: '10.1/x' })).toContain('doi = {10.1/x}');
  });
});
