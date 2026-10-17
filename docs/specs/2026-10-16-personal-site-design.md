# jacobpolay.ca: design spec

**Date:** 16 October 2026
**Status:** Draft for Jacob's review (open items resolved 16 October 2026)
**Mockup it builds on:** `toolbox-starter/jacobpolay-mockups/home.html`, concept C

## 1. Purpose

An academic personal site for Jacob Polay, PhD student in History at the University of Saskatchewan. It is mainly for hiring committees, scholars and conference contacts. Research and the CV lead. Projects come next, then writing and talks.

The design borrows from Jacob's own work, early modern print and the machines that read it. It is meant to be memorable without being gimmicky: every playful element is a real convention (a title page, OCR, NER, a knowledge graph, the fleuron, the manicule, the colophon), and each one stays restrained.

Success means:
- A committee member finds the CV, research summary, publications and contact details within one click of the home page.
- The site reads well on a phone, in dark mode, and with JavaScript turned off.
- Jacob can add a project, talk or publication by adding one small text file and pushing to GitHub.

## 2. Look and feel

- **Type:** IM Fell English, with its small caps, for the name, headings, navigation and period touches. Source Serif 4 for body text. Inter only for tiny UI labels such as entity tags and the "Page image" caption. Fonts are self-hosted, so visitors make no requests to Google.
- **Colour:** warm paper (`#f7f3ea`), ink (`#1f1b16`) and one rubric red (`#9a2f22`) as the accent. NER uses four muted inks: person red, org blue, place green, date ochre. Dark mode switches to a dark-paper palette automatically and has a manual toggle. All text meets WCAG AA contrast.
- **Ornaments:** the ❦ fleuron as a section divider, in the footer and as the favicon. A ☞ manicule on the "next page" catchword link at the foot of each page. No Roman numerals, no signature marks, no parchment textures.

## 3. Pages

| Path | Content |
|---|---|
| `/` | **Hero, concept C:** a "page image" of Jacob's title page set in period type (long-s, I for J, V for U, "Atlantick"). OCR boxes sweep it word by word while a clean modern transcription fills in beside it, then a single NER pass tags PERSON, PLACE, ORG and DATE. Below the hero: the About paragraphs, a headshot slot, a "Recent" list (3 to 4 items, newest first), contact links, and a catchword to Research. |
| `/research` | The doctoral project (medicinal commodities, c. 1660–1815); NLP + GraphRAG for historical corpora; OCR benchmarking. A short "Training" line names the comprehensive fields, History of Capitalism (Dr. Jim Clifford) and History of Medicine (Dr. Erika Dyck), as training background without further detail. The supervisor is named in prose: "supervised by [Dr. Jim Clifford](https://jimclifford.ca/), Professor of History", using his own description, with no added labels. |
| `/projects` | **Graph / List toggle.** The graph view is the knowledge graph of Jacob's work: projects, papers, talks, collaborators and methods. Hovering or focusing a node highlights its neighbours, and clicking opens the item. The list view is ordinary cards. The list is the default on phones and without JavaScript, the graph is the default on wide screens, and the toggle remembers the visitor's choice. Each project has its own page at `/projects/<slug>`. |
| `/projects/<slug>` | Summary, status, Jacob's role, collaborators, methods, links (repo, live site, paper), related talks and writing. |
| `/writing` | Publications, public scholarship and talks, in citation style. Each publication and post has a **Cite** button that copies a Chicago citation and offers a BibTeX download, with DOIs and links where they exist. |
| `/cv` | A full web version of the CV and a "Download PDF" link to `Polay_Jacob_CV.pdf`. |
| `/now` | What Jacob is working on this term: a one-line mention of comprehensive exams (no detail) and Footnotes on Film. It is dated, so readers know how fresh it is. |

**Projects at launch:** The Digital Historian's Toolbox (featured first), the EarlyModernNER + GraphRAG pipeline, the OCR benchmark, the AI and Collaboration series (Active History), and Footnotes on Film.

**Navigation:** About · Research · Projects · Writing & Talks · CV · Now, in IM Fell small caps.

**Footer, on every page:**
- Contact and profiles: email `jacob.polay@usask.ca`, ORCID `0009-0001-9217-5531`, Bluesky `@historyjacob.bsky.social`, and GitHub `polayj`. There are no other profiles: Google Scholar, Humanities Commons and LinkedIn are left out.
- A **land acknowledgement** in USask's standard wording (Treaty 6 Territory and the Homeland of the Métis), at the bottom of every page, with no personal addition.
- A short **colophon**, along the lines of "Set in IM Fell, from type given to Oxford by Bishop John Fell in the 1670s, and Source Serif."
- The ❦ fleuron.

## 4. Animation and NER rules

- The OCR and NER animation runs **once per browser session**, on the home page only, and lasts about 4 seconds in total.
- When a visitor has asked their device to reduce motion, or JavaScript is off, the finished transcription shows immediately.
- NER labels show for about 2.5 seconds, then settle into thin underlines. Hovering or focusing an entity brings its label back. Tags are limited to the hero's 5 entities, and the transcript gets extra line-height so labels never overlap the text.
- Tagged entities link into the site: PERSON goes to About, ORG to the CV, and so on. The Projects graph handles collaborators.
- Screen readers get the plain transcription. The page image and the animation are hidden from assistive technology.

## 5. Headshot

The layout has a headshot slot beside the About text. **Until Jacob has a photo, the slot is left out entirely**, with no placeholder silhouette. Adding one later means dropping `headshot.jpg` into the site and setting one line in the config. A university or department photo day, or any plain background with daylight, is enough.

## 6. Sharing and metadata

- **Social preview card** (1200×630): a title-page design with the double rules, the name in IM Fell, the tagline, the fleuron, and "PhD Student · History · University of Saskatchewan". It is a single site-wide image, generated at build time.
- **Favicon:** ❦ in rubric red on paper, as SVG with a PNG fallback.
- **Metadata:** page titles and descriptions, OpenGraph and Twitter tags, schema.org `Person` data linking to ORCID, Bluesky and GitHub, `ScholarlyArticle` data for publications, a sitemap, and an RSS feed for Writing.
- **No analytics or cookies** by default. Cloudflare Web Analytics, which is cookieless, can be switched on later if wanted.

## 7. Technical design

- **Framework:** Astro, as a static build with no server code.
- **Hosting:** a Cloudflare Worker that serves the static files on `jacobpolay.ca`, with `www.jacobpolay.ca` redirecting to it. The source lives in a GitHub repo (proposed: `polayj/jacobpolay.ca`), and every push to `main` builds and deploys through Cloudflare Workers Builds, the same pattern as the Toolbox.
- **Content:** Astro content collections, one file per item.
  - `src/content/projects/*.md`: frontmatter for title, summary, status, role, links, collaborators, methods and related items, plus a Markdown body.
  - `src/content/publications/*.yaml`: authors, title, venue, year, volume, issue, pages, DOI, URL and type (article, working paper or blog post). Chicago and BibTeX citations are generated from these fields.
  - `src/content/talks/*.yaml`: title, co-presenters, event, place, date and an optional link.
  - `src/content/now.md`: free text with an `updated` date.
  - `src/site.ts`: name, email, profile links, the headshot setting and the land acknowledgement text.
- **Knowledge graph:** nodes and edges are built at build time from the content files' `collaborators`, `methods` and `related` fields, and the layout is computed at build time with `d3-force`. The page ships a static SVG plus about 2 KB of JavaScript for hover, focus and the toggle, with no graph library in the browser. Nodes are keyboard-focusable, and the list view is the accessible equivalent.
- **Accessibility:** semantic HTML, skip link, visible focus states, labelled toggles, `prefers-reduced-motion` and `prefers-color-scheme` respected, and alt text for every image.

## 8. Testing and verification

- The build succeeds with no broken internal links, checked by a link-check step.
- Each page is checked in the browser at phone (375px) and desktop widths, in light and dark mode, and with JavaScript disabled.
- An axe accessibility scan finds no serious issues, and Lighthouse scores at least 95 for performance and accessibility.
- The share card renders correctly in a link-preview checker.

## 9. Settled details (formerly open items)

1. **AHA talk:** "Fitting Machine to Page", AI and History Conference (American Historical Association), Baltimore, 16 October 2026, credited to Jacob alone.
2. **Supervisor:** link to https://jimclifford.ca/ and describe him as "Professor of History, University of Saskatchewan", as he describes himself there.
3. **GitHub:** `polayj` is Jacob's account. Toolbox repo: https://github.com/polayj/digital-historians-toolbox. EarlyModernNER repo: https://github.com/polayj/earlymodernner.
4. **DOIs:** a web search turned up neither for "Circumventing the Garbler" nor for the OCR benchmark working paper. The Cite buttons use the venue details and links instead: the working paper's page at https://working-papers-in-critical-search.github.io/paper-004-ocr-benchmark/, and *Intersections* 8.1 with no URL until one is found.
5. **Now page:** comprehensive exams (one line, as training) and Footnotes on Film. No SSHRC mention.
6. **Land acknowledgement:** USask's standard wording, unaltered, at the bottom of each page.
7. **Profiles:** email, ORCID, Bluesky and GitHub only.
8. **CV PDF:** the site serves a corrected copy (header "PhD Student") exported from `Jacob Polay CV - September 2026.docx`. Jacob's original files are untouched.

Still to come, but not blocking: a headshot (section 5).

## 10. Out of scope

A blog engine beyond the Writing list, comments, a contact form, search, translations, and per-page share images.
