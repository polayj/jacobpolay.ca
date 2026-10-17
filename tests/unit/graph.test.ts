import { describe, it, expect } from 'vitest';
import { buildGraph, layoutGraph, wrapLabel, type GraphInput } from '../../src/lib/graph';

const input = (): GraphInput => ({
  projects: [
    { slug: 'ocr-benchmark', title: 'OCR benchmark', collaborators: ['Jim Clifford', 'Jessica Jack'], methods: ['OCR'], related: ['talk:solving-ocr'] },
    { slug: 'earlymodernner', title: 'EarlyModernNER', collaborators: ['Jim Clifford'], methods: ['OCR', 'GraphRAG'], related: ['talk:csdh'] },
  ],
  publications: [{ slug: 'paper', title: 'Paper', authors: ['Jim Clifford', 'Jacob Polay'], related: ['project:ocr-benchmark'] }],
  talks: [
    { slug: 'solving-ocr', title: 'Solving OCR', presenters: ['Jim Clifford', 'Jacob Polay'], related: ['project:ocr-benchmark'] },
    { slug: 'csdh', title: 'CSDH', presenters: ['Jacob Polay'], related: [] },
  ],
});

const edgeSet = (g: ReturnType<typeof buildGraph>) => new Set(g.edges.map((e) => [e.source, e.target].sort().join(' — ')));

describe('buildGraph', () => {
  it('dedupes people', () => {
    const g = buildGraph(input());
    const jims = g.nodes.filter((n) => n.id === 'person:jim-clifford');
    expect(jims).toHaveLength(1);
    const jimEdges = g.edges.filter((e) => e.source === 'person:jim-clifford' || e.target === 'person:jim-clifford');
    expect(jimEdges).toHaveLength(2); // the two projects; the paper and talk relate to a project that already lists him
  });

  it('excludes self', () => {
    expect(buildGraph(input()).nodes.some((n) => n.label === 'Jacob Polay')).toBe(false);
  });

  it('includes a method only when two or more items use it', () => {
    const ids = buildGraph(input()).nodes.map((n) => n.id);
    expect(ids).toContain('method:ocr');
    expect(ids).not.toContain('method:graphrag');
  });

  it('throws on an unknown related id', () => {
    const bad = input();
    bad.projects[0].related = ['talk:nope'];
    expect(() => buildGraph(bad)).toThrow('Unknown related id "talk:nope" in project:ocr-benchmark');
  });

  it('dedupes undirected edges', () => {
    const g = buildGraph(input());
    const keys = g.edges.map((e) => [e.source, e.target].sort().join(' — '));
    expect(keys.filter((k) => k === 'project:ocr-benchmark — talk:solving-ocr')).toHaveLength(1);
    expect(edgeSet(g).size).toBe(g.edges.length);
  });

  it('gives items hrefs and kinds', () => {
    const g = buildGraph(input());
    const byId = Object.fromEntries(g.nodes.map((n) => [n.id, n]));
    expect(byId['project:ocr-benchmark']).toMatchObject({ kind: 'project', href: '/projects/ocr-benchmark' });
    expect(byId['talk:csdh']).toMatchObject({ kind: 'talk', href: '/writing#csdh' });
    expect(byId['publication:paper']).toMatchObject({ kind: 'publication', href: '/writing#paper' });
    expect(byId['person:jim-clifford'].href).toBeUndefined();
  });
});

describe('layoutGraph', () => {
  it('is deterministic', () => {
    const g = buildGraph(input());
    expect(layoutGraph(g, { width: 720, height: 480 })).toEqual(layoutGraph(g, { width: 720, height: 480 }));
  });

  it('an unconnected node does not squash the rest of the graph', () => {
    const g = buildGraph({
      ...input(),
      projects: [...input().projects, { slug: 'film', title: 'Film', collaborators: [], methods: [], related: [] }],
    });
    const laid = layoutGraph(g, { width: 720, height: 480 }).filter((n) => n.id !== 'project:film');
    const xs = laid.map((n) => n.x);
    const ys = laid.map((n) => n.y);
    const spread = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    expect(spread).toBeGreaterThan(300);
  });

  it('keeps every node in bounds', () => {
    for (const n of layoutGraph(buildGraph(input()), { width: 720, height: 480 })) {
      expect(n.x).toBeGreaterThanOrEqual(40);
      expect(n.x).toBeLessThanOrEqual(680);
      expect(n.y).toBeGreaterThanOrEqual(30);
      expect(n.y).toBeLessThanOrEqual(450);
    }
  });
});

describe('wrapLabel', () => {
  it('keeps a short label on one line', () => expect(wrapLabel('Solving OCR')).toEqual(['Solving OCR']));
  it('drops a subtitle after the colon', () => expect(wrapLabel('Reading the Unreadable: Optical Character Recognition')).toEqual(['Reading the Unreadable']));
  it('wraps a long label onto two lines at a word boundary', () =>
    expect(wrapLabel("The Digital Historian's Toolbox")).toEqual(['The Digital', "Historian's Toolbox"]));
  it('never adds an ellipsis and keeps whole words', () => {
    const lines = wrapLabel('AI and Collaboration (Active History) and a very long tail of extra words');
    expect(lines.length).toBeLessThanOrEqual(2);
    expect(lines.join(' ')).not.toContain('…');
    expect('AI and Collaboration (Active History) and a very long tail of extra words'.startsWith(lines.join(' '))).toBe(true);
  });
});

describe('buildGraph merges a publication into the project of the same name', () => {
  const g = buildGraph({
    projects: [{ slug: 'ocr-benchmark', title: 'Reading the Archive by Machine', collaborators: ['Jim Clifford'], methods: [], related: [] }],
    publications: [{ slug: 'reading', title: 'Reading the Archive by Machine', authors: ['Jim Clifford', 'Mark Humphries'], related: ['project:ocr-benchmark'] }],
    talks: [{ slug: 't', title: 'Talk', presenters: [], related: ['publication:reading'] }],
  });
  it('keeps one node for the shared name', () =>
    expect(g.nodes.filter((n) => n.label === 'Reading the Archive by Machine').map((n) => n.id)).toEqual(['project:ocr-benchmark']));
  it('moves the publication edges onto the project', () => {
    const keys = g.edges.map((e) => [e.source, e.target].sort().join(' '));
    expect(keys).toContain('person:mark-humphries project:ocr-benchmark');
    expect(keys).toContain('project:ocr-benchmark talk:t');
    expect(keys.some((k) => k.includes('publication:reading'))).toBe(false);
  });
});

describe('buildGraph skips person edges a related project already carries', () => {
  const g = buildGraph({
    projects: [{ slug: 'series', title: 'Series', collaborators: ['Chloë Farr', 'Jessica Jack'], methods: [], related: [] }],
    publications: [
      { slug: 'post', title: 'Post', authors: ['Chloë Farr', 'Jessica Jack', 'Sara Wilmshurst'], related: ['project:series'] },
    ],
    talks: [],
  });
  const keys = g.edges.map((e) => [e.source, e.target].sort().join(' '));
  it('links the post to its project', () => expect(keys).toContain('project:series publication:post'));
  it('does not link the post to people the project already lists', () => {
    expect(keys).not.toContain('person:chloe-farr publication:post');
    expect(keys).not.toContain('person:jessica-jack publication:post');
  });
  it('still links people the project does not list', () => expect(keys).toContain('person:sara-wilmshurst publication:post'));
});

describe('layoutGraph in a tall, narrow box', () => {
  const laid = layoutGraph(buildGraph(input()), { width: 380, height: 900, margin: { x: 70, y: 40 } });
  it('respects custom margins', () => {
    for (const n of laid) {
      expect(n.x).toBeGreaterThanOrEqual(70);
      expect(n.x).toBeLessThanOrEqual(310);
      expect(n.y).toBeGreaterThanOrEqual(40);
      expect(n.y).toBeLessThanOrEqual(860);
    }
  });
  it('uses the height of the box', () => {
    const ys = laid.map((n) => n.y);
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(450);
  });
});
