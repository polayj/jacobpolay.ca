export const NAV = [
  { href: '/', label: 'About' },
  { href: '/research', label: 'Research' },
  { href: '/projects', label: 'Projects' },
  { href: '/writing', label: 'Writing & Talks' },
  { href: '/cv', label: 'CV' },
  { href: '/now', label: 'Now' },
];
export const LAND_ACK =
  "The University of Saskatchewan's main campus is situated on Treaty 6 Territory and the Homeland of the Métis. We pay our respect to the First Nations and Métis ancestors of this place and reaffirm our relationship with one another.";
export const COLOPHON = 'Set in IM Fell, from type given to Oxford by Bishop John Fell in the 1670s, and Source Serif.';
export const PROFILES = [
  'mailto:jacob.polay@usask.ca',
  'https://orcid.org/0009-0001-9217-5531',
  'https://bsky.app/profile/historyjacob.bsky.social',
  'https://github.com/polayj',
];
export const TAGLINE =
  'Historian of the early modern Atlantic world and its commodities and medicines, exploring the role large language models will play in historical practice.';

/** Makes the given Web Storage throw on every access, as in locked-down private windows. */
export const blockStorage = (kind: 'localStorage' | 'sessionStorage') => `
  (() => {
    const boom = () => { throw new DOMException('blocked', 'SecurityError'); };
    const s = window['${kind}'];
    for (const m of ['getItem', 'setItem', 'removeItem', 'clear', 'key']) {
      try { Object.defineProperty(Storage.prototype, m, { value: boom, configurable: true }); } catch {}
    }
  })();`;
