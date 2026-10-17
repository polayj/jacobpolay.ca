const KEY = 'jp-hero-played';

function alreadyPlayed(): boolean {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

function markPlayed() {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* storage blocked: the animation may replay on the next visit */
  }
}

/** Wraps every word of root's text (outside [data-skip]) in a span.w and returns the spans in order. */
function wrapWords(root: Element): HTMLElement[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      n.nodeValue?.trim() && !n.parentElement?.closest('[data-skip]') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
  });
  const texts: Text[] = [];
  while (walker.nextNode()) texts.push(walker.currentNode as Text);
  const words: HTMLElement[] = [];
  for (const t of texts) {
    const frag = document.createDocumentFragment();
    for (const part of t.nodeValue!.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
        continue;
      }
      const span = document.createElement('span');
      span.className = 'w';
      span.textContent = part;
      if (t.parentElement?.closest('h1, .f-name')) span.dataset.big = '1';
      frag.appendChild(span);
      words.push(span);
    }
    t.replaceWith(frag);
  }
  return words;
}

/** Plays the OCR sweep and NER pass once per session; otherwise marks the hero done immediately. */
export function runHero(root: HTMLElement, opts: { animate: boolean }) {
  const fx = root.querySelector('.fx');
  const tx = root.querySelector('.transcript');
  if (!opts.animate || !fx || !tx || alreadyPlayed()) {
    root.dataset.hero = 'done';
    return;
  }
  markPlayed();
  const fWords = wrapWords(fx);
  const tWords = wrapWords(tx.querySelector('.tbody')!);
  root.dataset.hero = 'running';

  const at = (ms: number, fn: () => void) => setTimeout(fn, ms);
  let t = 400;
  fWords.forEach((w, i) => {
    const big = w.dataset.big === '1';
    at(t, () => {
      w.classList.add('box');
      tWords[i]?.classList.add('shown');
    });
    at(t + (big ? 480 : 260), () => w.classList.remove('box'));
    t += big ? 360 : 70;
  });
  at(t, () => tWords.slice(fWords.length).forEach((w) => w.classList.add('shown')));

  const ents = Array.from(tx.querySelectorAll<HTMLElement>('.ent'));
  const nerStart = t + 300;
  ents.forEach((e, i) => {
    at(nerStart + i * 200, () => e.classList.add('tagged', 'show-label'));
    at(nerStart + 2500 + i * 100, () => e.classList.remove('show-label'));
  });
  at(nerStart + 2500 + ents.length * 100 + 300, () => {
    root.dataset.hero = 'done';
    ents.forEach((e) => e.classList.remove('tagged'));
  });
}
