// Generates public/og.png (1200×630 share card), public/favicon.svg (glyphs converted to paths),
// public/favicon-32.png and public/apple-touch-icon.png. Run once with `node scripts/make-images.mjs`
// and commit the output. The ❦ fleuron comes from Windows' Segoe UI Symbol (IM Fell lacks the glyph);
// on another OS, pass a font that has U+2766 as FLEURON_FONT=/path/to/font.ttf.
import { readFile, writeFile } from 'node:fs/promises';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const PAPER = '#f7f3ea';
const INK = '#1f1b16';
const SOFT = '#5a5148';
const RUBRIC = '#9a2f22';
const fs = (p) => readFile(new URL(`../node_modules/${p}`, import.meta.url));

const fonts = [
  { name: 'Fell', data: await fs('@fontsource/im-fell-english/files/im-fell-english-latin-400-normal.woff'), weight: 400, style: 'normal' },
  { name: 'Fell', data: await fs('@fontsource/im-fell-english/files/im-fell-english-latin-400-italic.woff'), weight: 400, style: 'italic' },
  { name: 'FellSC', data: await fs('@fontsource/im-fell-english-sc/files/im-fell-english-sc-latin-400-normal.woff'), weight: 400, style: 'normal' },
  { name: 'Fleuron', data: await readFile(process.env.FLEURON_FONT ?? 'C:/Windows/Fonts/seguisym.ttf'), weight: 400, style: 'normal' },
];

const h = (type, style, ...children) => ({ type, props: { style, children: children.length === 1 ? children[0] : children } });
const doubleRule = (width) =>
  h('div', { display: 'flex', flexDirection: 'column', width, gap: 4 }, h('div', { height: 2, background: INK }), h('div', { height: 2, background: INK }));

const card = h(
  'div',
  { width: 1200, height: 630, background: PAPER, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: INK },
  doubleRule(760),
  h('div', { fontFamily: 'Fell', fontSize: 120, marginTop: 34, lineHeight: 1 }, 'Jacob Polay'),
  h(
    'div',
    { fontFamily: 'Fell', fontStyle: 'italic', fontSize: 33, maxWidth: 900, textAlign: 'center', marginTop: 26, lineHeight: 1.35 },
    'Historian of the early modern Atlantic world and its commodities and medicines, exploring the role large language models will play in historical practice.',
  ),
  h('div', { fontFamily: 'Fleuron', fontSize: 40, color: RUBRIC, marginTop: 18 }, '❦'),
  h('div', { fontFamily: 'FellSC', fontSize: 30, letterSpacing: 1.5, marginTop: 14, marginBottom: 30 }, 'PhD Student · History · University of Saskatchewan'),
  doubleRule(760),
  h('div', { fontFamily: 'Fell', fontSize: 24, color: SOFT, marginTop: 22 }, 'jacobpolay.ca'),
);

const icon = h(
  'div',
  { width: 64, height: 64, background: PAPER, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  h('div', { fontFamily: 'Fleuron', fontSize: 50, color: RUBRIC, marginTop: -4 }, '❦'),
);

const png = (svg, width) => new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();

const cardSvg = await satori(card, { width: 1200, height: 630, fonts });
await writeFile(new URL('../public/og.png', import.meta.url), png(cardSvg, 1200));

const iconSvg = await satori(icon, { width: 64, height: 64, fonts });
await writeFile(new URL('../public/favicon.svg', import.meta.url), iconSvg);
await writeFile(new URL('../public/favicon-32.png', import.meta.url), png(iconSvg, 32));
await writeFile(new URL('../public/apple-touch-icon.png', import.meta.url), png(iconSvg, 180));
console.log('Wrote og.png, favicon.svg, favicon-32.png, apple-touch-icon.png');
