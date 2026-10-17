/** Hover and focus highlighting for the projects graph. The Graph/List toggle is in the page's inline head script. */
export function initGraphHighlight(svg: SVGSVGElement | null) {
  if (!svg) return;
  const lines = Array.from(svg.querySelectorAll<SVGLineElement>('line'));
  const nodes = new Map(Array.from(svg.querySelectorAll<SVGElement>('.node')).map((n) => [n.dataset.id!, n]));
  const clear = () => {
    svg.classList.remove('hovering');
    svg.querySelectorAll('.lit').forEach((el) => el.classList.remove('lit'));
  };
  const light = (id: string) => {
    clear();
    svg.classList.add('hovering');
    nodes.get(id)?.classList.add('lit');
    for (const l of lines) {
      const other = l.dataset.a === id ? l.dataset.b : l.dataset.b === id ? l.dataset.a : undefined;
      if (!other) continue;
      l.classList.add('lit');
      nodes.get(other)?.classList.add('lit');
    }
  };
  for (const [id, node] of nodes) {
    node.addEventListener('mouseenter', () => light(id));
    node.addEventListener('mouseleave', clear);
    node.addEventListener('focus', () => light(id));
    node.addEventListener('blur', clear);
  }
}
