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
 * the people they share and the methods used by two or more projects.
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

  const edges = new Map<string, GraphEdge>();
  const connect = (a: string, b: string) => {
    if (a === b) return;
    const [source, target] = [a, b].sort();
    edges.set(`${source}|${target}`, { source, target });
  };

  const people = new Map<string, string>();
  const methodUse = new Map<string, { label: string; items: string[] }>();
  for (const item of items) {
    for (const name of item.people) {
      if (name === self) continue;
      const id = `person:${kebab(name)}`;
      people.set(id, name);
      connect(item.id, id);
    }
    for (const m of item.methods) {
      const id = `method:${kebab(m)}`;
      const use = methodUse.get(id) ?? { label: m, items: [] };
      use.items.push(item.id);
      methodUse.set(id, use);
    }
    for (const rel of item.related) {
      if (!itemIds.has(rel)) throw new Error(`Unknown related id "${rel}" in ${item.id}`);
      connect(item.id, rel);
    }
  }

  const methodNodes: GraphNode[] = [];
  for (const [id, use] of [...methodUse].sort(([a], [b]) => a.localeCompare(b))) {
    if (use.items.length < 2) continue;
    methodNodes.push({ id, label: use.label, kind: 'method' });
    use.items.forEach((i) => connect(i, id));
  }

  const nodes: GraphNode[] = [
    ...items.map(({ id, label, kind, href }) => ({ id, label, kind, href })),
    ...[...people].sort(([a], [b]) => a.localeCompare(b)).map(([id, label]) => ({ id, label, kind: 'person' as const })),
    ...methodNodes,
  ];
  return { nodes, edges: [...edges.values()] };
}

type SimNode = GraphNode & SimulationNodeDatum;

/** Lays the graph out with d3-force (deterministic) and fits it inside the box, leaving 95px at the sides for labels and 30px top and bottom. */
export function layoutGraph(
  g: Graph,
  opts: { width: number; height: number; iterations?: number },
): (GraphNode & { x: number; y: number })[] {
  const { width, height, iterations = 300 } = opts;
  const nodes: SimNode[] = g.nodes.map((n) => ({ ...n }));
  const links = g.edges.map((e) => ({ ...e }));
  forceSimulation(nodes)
    .force('link', forceLink<SimNode, (typeof links)[number]>(links).id((n) => n.id).distance(100))
    .force('charge', forceManyBody().strength(-260))
    .force('center', forceCenter(width / 2, height / 2))
    .force('collide', forceCollide(40))
    .force('x', forceX(width / 2).strength(0.08))
    .force('y', forceY(height / 2).strength(0.12))
    .stop()
    .tick(iterations);

  const mx = 95;
  const my = 30;
  const xs = nodes.map((n) => n.x ?? 0);
  const ys = nodes.map((n) => n.y ?? 0);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scale = Math.min((width - 2 * mx) / (maxX - minX || 1), (height - 2 * my) / (maxY - minY || 1), 1.5);
  const ox = (width - (maxX - minX) * scale) / 2;
  const oy = (height - (maxY - minY) * scale) / 2;
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const round = (v: number) => Math.round(v * 10) / 10;
  return nodes.map(({ id, label, kind, href, x = 0, y = 0 }) => ({
    id, label, kind, ...(href ? { href } : {}),
    x: round(clamp(ox + (x - minX) * scale, mx, width - mx)),
    y: round(clamp(oy + (y - minY) * scale, my, height - my)),
  }));
}
