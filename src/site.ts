export interface NavItem {
  href: string;
  label: string;
}

export const site = {
  name: 'Jacob Polay',
  role: 'PhD Student',
  department: 'Department of History',
  university: 'University of Saskatchewan',
  tagline:
    'Historian of the early modern Atlantic world, its commodities and medicines, and of the machines that now read its archives.',
  url: 'https://jacobpolay.ca',
  email: 'jacob.polay@usask.ca',
  orcid: 'https://orcid.org/0009-0001-9217-5531',
  bluesky: 'https://bsky.app/profile/historyjacob.bsky.social',
  github: 'https://github.com/polayj',
  /** Path under public/, e.g. '/headshot.jpg'. null leaves the headshot out entirely. */
  headshot: null as string | null,
  landAcknowledgement:
    "The University of Saskatchewan's main campus is situated on Treaty 6 Territory and the Homeland of the Métis. We pay our respect to the First Nations and Métis ancestors of this place and reaffirm our relationship with one another.",
  colophon: 'Set in IM Fell, from type given to Oxford by Bishop John Fell in the 1670s, and Source Serif.',
  nav: [
    { href: '/', label: 'About' },
    { href: '/research', label: 'Research' },
    { href: '/projects', label: 'Projects' },
    { href: '/writing', label: 'Writing & Talks' },
    { href: '/cv', label: 'CV' },
    { href: '/now', label: 'Now' },
  ] as NavItem[],
};
