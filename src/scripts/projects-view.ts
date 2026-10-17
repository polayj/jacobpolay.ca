const KEY = 'jp-projects-view';
type View = 'graph' | 'list';

function setView(view: View, buttons: HTMLButtonElement[], persist: boolean) {
  document.documentElement.dataset.projectsView = view;
  buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
  if (!persist) return;
  try {
    localStorage.setItem(KEY, view);
  } catch {
    /* storage blocked: the choice lasts for this page only */
  }
}

function initHighlight(svg: SVGSVGElement) {
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

/** Wires the Graph/List toggle (remembered in localStorage) and the graph's hover and focus highlighting. */
export function initProjectsView() {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.view-toggle button[data-view]'));
  const current: View = document.documentElement.dataset.projectsView === 'graph' ? 'graph' : 'list';
  setView(current, buttons, false);
  buttons.forEach((b) => b.addEventListener('click', () => setView(b.dataset.view as View, buttons, true)));
  const svg = document.querySelector<SVGSVGElement>('svg.project-graph');
  if (svg) initHighlight(svg);
}
