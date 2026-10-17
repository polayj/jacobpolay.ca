import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, type SimulationNodeDatum } from 'd3-force';

export type NodeKind = 'project' | 'publication' | 'talk' | 'person' | 'method';
export interface GraphNode { id: string; label: string; kind: NodeKind; href?: string }
export interface GraphEdge { source: string; target: string }
export interface Graph { nodes: GraphNode[]; edges: GraphEdge[] }
export interface GraphInput {
  projects: { slug: string; title: string; collaborators: string[]; methods: string[]; related: string[] }[];
  publications: { slug: string; title: string; authors: string[]; related: string[] }[];
  talks: { slug: string; title: string; presenters: string[]; related: string[] }[];
}

const kebab = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Turns the site's content into a graph of items (projects, publications, talks),
 * the people they share and the methods used by two or more projects. A publication with
 * the same title as a project (a project that *is* a paper) is merged into the project's node, and
 * an item related to a project doesn't get its own edge to people that project already lists.
 * Throws when a `related` id names an item that doesn't exist.
 */
export function buildGraph(input: GraphInput, self = 'Jacob Polay'): Graph {
  const items: (GraphNode & { people: string[]; methods: string[]; related: string[] })[] = [
    ...input.projects.map((p) => ({
      id: `project:${p.slug}`, label: p.title, kind: 'project' as const, href: `/projects/${p.slug}`,
      people: p.collaborators, methods: p.methods, related: p.related,
    })),
    ...input.publications.map((p) => ({
      id: `publication:${p.slug}`, label: p.title, kind: 'publication' as const, href: `/writing#${p.slug}`,
      people: p.authors, methods: [], related: p.related,
    })),
    ...input.talks.map((t) => ({
      id: `talk:${t.slug}`, label: t.title, kind: 'talk' as const, href: `/writing#${t.slug}`,
      people: t.presenters, methods: [], related: t.related,
    })),
  ];
  const itemIds = new Set(items.map((i) => i.id));
  const projectByTitle = new Map(input.projects.map((p) => [p.title, `project:${p.slug}`]));
  const alias = new Map<string, string>();
  for (const p of input.publications) {
    const project = projectByTitle.get(p.title);
    if (project) alias.set(`publication:${p.slug}`, project);
  }
  const resolve = (id: string) => alias.get(id) ?? id;
  // People a project already lists don't also get an edge to each item related to that project.
  const projectPeople = new Map(input.projects.map((p) => [`project:${p.slug}`, new Set(p.collaborators)]));
  const carriedByProject = (related: string[], name: string) =>
    related.some((r) => projectPeople.get(resolve(r))?.has(name));

  const edges = new Map<string, GraphEdge>();
  const connect = (a: string, b: string) => {
    if (a === b) return;
    const [source, target] = [a, b].sort();
    edges.set(`${source}|${target}`, { source, target });
  };

  const people = new Map<string, string>();
  const methodUse = new Map<string, { label: string; items: string[] }>();
  for (const item of items) {
    const itemId = resolve(item.id);
    for (const name of item.people) {
      if (name === self) continue;
      if (item.kind !== 'project' && carriedByProject(item.related, name)) continue;
      const id = `person:${kebab(name)}`;
      people.set(id, name);
      connect(itemId, id);
    }
    for (const m of item.methods) {
      const id = `method:${kebab(m)}`;
      const use = methodUse.get(id) ?? { label: m, items: [] };
      use.items.push(itemId);
      methodUse.set(id, use);
    }
    for (const rel of item.related) {
      if (!itemIds.has(rel)) throw new Error(`Unknown related id "${rel}" in ${item.id}`);
      connect(itemId, resolve(rel));
    }
  }

  const methodNodes: GraphNode[] = [];
  for (const [id, use] of [...methodUse].sort(([a], [b]) => a.localeCompare(b))) {
    if (use.items.length < 2) continue;
    methodNodes.push({ id, label: use.label, kind: 'method' });
    use.items.forEach((i) => connect(i, id));
  }

  const nodes: GraphNode[] = [
    ...items.filter((i) => !alias.has(i.id)).map(({ id, label, kind, href }) => ({ id, label, kind, href })),
    ...[...people].sort(([a], [b]) => a.localeCompare(b)).map(([id, label]) => ({ id, label, kind: 'person' as const })),
    ...methodNodes,
  ];
  return { nodes, edges: [...edges.values()] };
}

type SimNode = GraphNode & SimulationNodeDatum;

/**
 * Lays the graph out with d3-force (deterministic) and fits it inside the box, leaving `margin`
 * (default 95px at the sides for labels, 30px top and bottom). In a tall box (a phone) nodes are
 * pulled harder toward the vertical axis and may be stretched vertically up to 2.2 times, so the
 * graph uses the height instead of shrinking to fit the width.
 */
export function layoutGraph(
  g: Graph,
  opts: { width: number; height: number; iterations?: number; margin?: { x: number; y: number } },
): (GraphNode & { x: number; y: number })[] {
  const { width, height, iterations = 300, margin = { x: 95, y: 30 } } = opts;
  const tall = height > width;
  const nodes: SimNode[] = g.nodes.map((n) => ({ ...n }));
  const links = g.edges.map((e) => ({ ...e }));
  forceSimulation(nodes)
    .force('link', forceLink<SimNode, (typeof links)[number]>(links).id((n) => n.id).distance(115))
    .force('charge', forceManyBody().strength(-340))
    .force('center', forceCenter(width / 2, height / 2))
    .force('collide', forceCollide(52))
    .force('x', forceX(width / 2).strength(tall ? 0.08 * (height / width) : 0.08))
    .force('y', forceY(height / 2).strength(0.12))
    .stop()
    .tick(iterations);

  const { x: mx, y: my } = margin;
  const xs = nodes.map((n) => n.x ?? 0);
  const ys = nodes.map((n) => n.y ?? 0);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const fitX = (width - 2 * mx) / (maxX - minX || 1);
  const fitY = (height - 2 * my) / (maxY - minY || 1);
  const scaleX = Math.min(fitX, fitY, 1.5);
  const scaleY = tall ? Math.min(fitY, scaleX * 2.2) : scaleX;
  const ox = (width - (maxX - minX) * scaleX) / 2;
  const oy = (height - (maxY - minY) * scaleY) / 2;
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const round = (v: number) => Math.round(v * 10) / 10;
  return nodes.map(({ id, label, kind, href, x = 0, y = 0 }) => ({
    id, label, kind, ...(href ? { href } : {}),
    x: round(clamp(ox + (x - minX) * scaleX, mx, width - mx)),
    y: round(clamp(oy + (y - minY) * scaleY, my, height - my)),
  }));
}

/**
 * A node label on at most two lines of about `max` characters: the part before any colon,
 * wrapped at word boundaries. Words that don't fit are dropped without an ellipsis, so the
 * visible text is always a prefix of the node's accessible name.
 */
export function wrapLabel(label: string, max = 22): string[] {
  const head = label.split(':')[0].trim();
  const lines: string[] = [];
  let line = '';
  for (const word of head.split(/\s+/)) {
    if (line && `${line} ${word}`.length > max) {
      lines.push(line);
      line = word;
      if (lines.length === 2) return lines;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line && lines.length < 2) lines.push(line);
  return lines;
}
