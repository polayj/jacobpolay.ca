# jacobpolay.ca Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy Jacob Polay's academic site at https://jacobpolay.ca: a scan-and-transcription home page with OCR and NER, research, a projects knowledge graph with a list view, writing with Cite buttons, the CV, and a Now page.

**Architecture:** A static Astro site. All content lives in typed content collections; three pure TypeScript modules (`periodize`, `cite`, `graph`) do the logic and are unit-tested; small client scripts add the animation, the view toggle and copying, and every page works without them. The build output (`dist/`) is served by a static-assets-only Cloudflare Worker on the custom domain, deployed by Cloudflare Workers Builds on every push to `main`.

**Tech stack:** Node 22, Astro 7.4, TypeScript (strict), d3-force 3 (build time only), satori 0.62 + @resvg/resvg-js 2.6 (share card at build time), @fontsource (IM Fell English, IM Fell English SC, Inter) and @fontsource-variable/source-serif-4, @astrojs/sitemap, @astrojs/rss, Vitest 5, Playwright 1.64 + @axe-core/playwright, Wrangler 4.

**Spec:** `docs/specs/2026-10-16-personal-site-design.md`. **Source copy:** `docs/source/overview.md` (Jacob's own words; use it for all prose and follow its corrections block). **Mockup:** `../toolbox-starter/jacobpolay-mockups/home.html`, concept C: reuse its CSS and animation logic.

## Global Constraints

- Project root: `C:\Users\TheCa\Downloads\jacobpolay.ca\`. Site URL: `https://jacobpolay.ca`.
- Colours (light): paper `#f7f3ea`, paper-2 `#efe7d5`, ink `#1f1b16`, ink-soft `#5a5148`, rule `#cfc5b4`, rubric `#9a2f22`. NER: person `#9a2f22`, org `#2d4a7c`, place `#3b6a43`, date `#8a6516`. Dark: paper `#16140f`, paper-2 `#211e17`, ink `#ece4d3`, ink-soft `#a89e8d`, rule `#3a342a`, rubric `#e07a63`, person `#e07a63`, org `#8fb0e8`, place `#8cc496`, date `#dcb45e`. Dark mode follows `prefers-color-scheme` unless `data-theme` is set on `<html>`.
- Fonts are self-hosted through @fontsource: no requests to fonts.googleapis.com. IM Fell for the name, headings, nav and period text; Source Serif 4 for body text; Inter only for labels at most 13px.
- Ornaments: ❦ fleuron, ☞ manicule on catchwords. Never Roman numerals, signature marks or parchment textures.
- Profiles, exactly: email `jacob.polay@usask.ca`, ORCID `https://orcid.org/0009-0001-9217-5531`, Bluesky `https://bsky.app/profile/historyjacob.bsky.social`, GitHub `https://github.com/polayj`. Nothing else.
- Land acknowledgement, verbatim from usask.ca, at the bottom of every page: "The University of Saskatchewan's main campus is situated on Treaty 6 Territory and the Homeland of the Métis. We pay our respect to the First Nations and Métis ancestors of this place and reaffirm our relationship with one another."
- Colophon: "Set in IM Fell, from type given to Oxford by Bishop John Fell in the 1670s, and Source Serif."
- Supervisor copy: "Dr. Jim Clifford", linked to `https://jimclifford.ca/`, described as "Professor of History". No SSHRC mention anywhere.
- No analytics, no cookies, no third-party requests at runtime.
- Storage keys: `jp-theme` (localStorage), `jp-projects-view` (localStorage), `jp-hero-played` (sessionStorage). Every storage access is wrapped in try/catch.
- Every page renders its full content with JavaScript disabled. All motion respects `prefers-reduced-motion: reduce`.
- WCAG AA contrast; visible focus; skip link; one `<h1>` per page.
- Commit after every task, with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **JavaScript disabled or a script error.** The home page must show the complete transcription, and Projects must show the list with the toggle hidden. Pinned in Task 3 (`hero no-js`) and Task 5 (`projects no-js`).
2. **Reduced motion.** No OCR sweep and no flashing labels: final text and settled underlines straight away. Pinned in Task 3 (`hero reduced-motion`).
3. **Storage blocked** (private windows, Safari lockdown). The theme toggle, the hero's once-per-session flag and the projects toggle must keep working without throwing. Pinned in Task 1 (`theme storage-blocked`), Task 3 (`hero storage-blocked`) and Task 5 (`projects storage-blocked`).
4. **A typo in a content file's `related` id.** The build must fail with a message naming the bad id, not quietly drop an edge from the graph. Pinned in Task 5 (`buildGraph unknown related`).
5. **A 360px phone.** No horizontal scroll on any page (long words like "Saskatchewan", the facsimile, the graph), and NER labels must not overlap the line above. Pinned in Task 8 (`no horizontal scroll`) and Task 3 (`ner labels clear of text`).

---

### Task 1: Scaffold, design system and base layout

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `vitest.config.ts`, `playwright.config.ts`
- Create: `src/site.ts`, `src/styles/global.css`, `src/layouts/Base.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`, `src/components/Catchword.astro`, `src/components/ThemeToggle.astro`, `src/scripts/theme.ts`
- Create: placeholder `src/pages/{index,research,writing,cv,now}.astro`, `src/pages/projects/index.astro`, and `src/pages/404.astro`
- Create: `public/favicon.svg`, `public/robots.txt`
- Test: `tests/e2e/layout.spec.ts`

**Interfaces:**
- Produces: `site` in `src/site.ts`:
  `{ name: 'Jacob Polay'; role: 'PhD Student'; department: 'Department of History'; university: 'University of Saskatchewan'; tagline: string; url: 'https://jacobpolay.ca'; email; orcid; bluesky; github; headshot: string | null /* path under public/, null = omit */; landAcknowledgement; colophon; nav: {href: string; label: string}[] }`, with `tagline` = "Historian of the early modern Atlantic world, its commodities and medicines, and of the machines that now read its archives." and `nav` = About `/`, Research `/research`, Projects `/projects`, Writing & Talks `/writing`, CV `/cv`, Now `/now`.
- Produces: `<Base title: string; description: string; next?: {href: string; label: string}>`. It renders `<head>` (title as "`{title} · Jacob Polay`", or just "Jacob Polay" on the home page), the skip link, Nav (with `aria-current` on the current page), a `<main id="main">` slot, `<Catchword>` when `next` is set, and Footer.
- Produces: the CSS custom properties from Global Constraints, as `--paper --paper-2 --ink --ink-soft --rule --rubric --e-person --e-org --e-place --e-date --fell --fell-sc --serif --sans`.

- [ ] **Step 1:** In the project root, run `git init`, scaffold Astro 7.4 (minimal template, TypeScript strict), and install the fonts, Vitest, Playwright, @axe-core/playwright and wrangler as dev dependencies. Add scripts: `dev`, `build`, `preview`, `test` (vitest run), `test:e2e` (playwright test), `check` (astro check). Configure `site: 'https://jacobpolay.ca'`. Configure Playwright's `webServer` as `npm run build && npm run preview -- --port 4321` with `baseURL` `http://localhost:4321`, and set up two projects: desktop at 1280×800 and phone at 375×812.
- [ ] **Step 2: Write the failing tests** in `tests/e2e/layout.spec.ts`:
  - `nav links resolve`: each `site.nav` href returns 200 and has exactly one `h1`.
  - `footer content`: the footer contains the exact land acknowledgement string, the colophon, and links whose `href`s are the four profile URLs plus `mailto:jacob.polay@usask.ca`.
  - `theme toggle persists`: clicking the toggle sets `html[data-theme="dark"]`, and after a reload it is still `dark`.
  - `theme storage-blocked`: with `addInitScript` making `localStorage.getItem` and `localStorage.setItem` throw, clicking the toggle still flips `data-theme` and the console shows no errors.
  - `404`: `/nope` returns 404 and contains a link to `/`.
  - `axe home`: an axe scan of `/` reports no `serious` or `critical` violations, in light and in dark.
- [ ] **Step 3:** Run `npm run test:e2e -- layout`. Expected: FAIL (the pages don't exist yet).
- [ ] **Step 4:** Implement the files above. Port the mockup's paper, typography, nav, footer and catchword styles into `global.css`. In the footer, from top to bottom: the ❦ fleuron, the profile links, the land acknowledgement, the colophon. `Catchword` renders `<small>next page</small><a href><span aria-hidden="true">☞</span>{label}</a>`. Put an inline script in `<head>` that sets `data-theme` from `jp-theme` before first paint, so the page doesn't flash. `favicon.svg` is a ❦ in `#9a2f22` on `#f7f3ea`.
- [ ] **Step 5:** Run `npm run test:e2e -- layout`. Expected: PASS in both projects.
- [ ] **Step 6:** Commit: `feat: scaffold site, design system and base layout`.

### Task 2: Content collections and data

**Files:**
- Create: `src/content.config.ts`, `src/content/schemas.ts`
- Create: `src/content/projects/{toolbox,earlymodernner,ocr-benchmark,ai-and-collaboration,footnotes-on-film}.md`
- Create: `src/content/publications/{reading-the-archive-by-machine,archive-is-not-a-toy,circumventing-the-garbler}.yaml`
- Create: `src/content/talks/{fitting-machine-to-page,reading-the-unreadable,solving-ocr}.yaml`
- Create: `src/content/now.md`, `src/data/cv.ts`
- Test: `tests/unit/schemas.test.ts`

**Interfaces:**
- Produces: zod schemas in `schemas.ts`, imported by `content.config.ts` (which uses the `glob()` loader):
  - `projectSchema`: `{ title: string; summary: string (≤ 200 chars); status: 'active'|'in development'|'complete'|'ongoing'; role: string; featured: boolean (default false); order: number; links: {label: string; href: url}[]; collaborators: string[]; methods: string[]; related: string[] /* graph ids such as "talk:fitting-machine-to-page" */ }`
  - `publicationSchema`: `{ type: 'article'|'working-paper'|'blog-post'; authors: {given: string; family: string}[]; title: string; venue: string; date: string /* YYYY or YYYY-MM-DD */; volume?: string; issue?: string; number?: string; pages?: string; doi?: string; url?: url; summary?: string; related: string[] (default []) }`
  - `talkSchema`: `{ title: string; presenters: string[]; event: string; place: string; date: YYYY-MM-DD string; url?: url; related: string[] (default []) }`
  - `nowSchema`: `{ updated: YYYY-MM-DD string }`
- Produces: `cv` in `src/data/cv.ts`: `{ education: {degree, institution, dates, thesis?}[]; experience: {title, org, dates, bullets: string[]}[]; awards: {name, org, year, amount}[]; methods: string[]; languages: string[]; training: string[]; interests: string[] }`, copied exactly from the corrected CV PDF.

- [ ] **Step 1: Write the failing tests** in `tests/unit/schemas.test.ts`: `talkSchema` rejects a talk without `date` and rejects `date: "Oct 2026"`; `publicationSchema` accepts `date: "2025"` and `"2026-07-13"` and rejects an `authors` entry without `family`; `projectSchema` rejects a `summary` over 200 characters.
- [ ] **Step 2:** Run `npm test -- schemas`. Expected: FAIL (the module isn't found).
- [ ] **Step 3:** Implement the schemas and write the content files from `docs/source/overview.md` and the CV. Exact data:
  - Publications. `circumventing-the-garbler`: article, Polay; "Circumventing the Garbler"; *Intersections*; vol 8, no 1; date 2025; page 28; no URL. `reading-the-archive-by-machine`: working paper; Clifford, Polay, Jessica Jack, Mark Humphries, Lianne C. Leddy; "Reading the Archive by Machine: An OCR Benchmark for Historians, 1612–1921"; *Working Papers in Critical Search*; number 4; 2026; url from the overview. `archive-is-not-a-toy`: blog post; Polay, Chloë Farr, Jessica Jack; `The Archive is Not a Toy: The Hidden Problems of a "Vintage" AI`; *Active History*; 2026-07-13; url from the overview. No DOIs.
  - Talks, with the dates and presenters from the overview. `fitting-machine-to-page`: presenter Jacob Polay; event "AI and History Conference, American Historical Association"; place Baltimore; 2026-10-16.
  - Projects: Toolbox (`featured: true`, `order: 1`, link to the repo), EarlyModernNER (repo link, plus the thesis link to harvest.usask.ca), OCR benchmark, AI and Collaboration (series link), Footnotes on Film (Broadway Theatre, `role: "Founder"`). Fill in `collaborators`, `methods` and `related` so the graph connects: OCR benchmark ↔ talks `reading-the-unreadable`, `solving-ocr` and `fitting-machine-to-page`; EarlyModernNER ↔ `reading-the-unreadable` and `fitting-machine-to-page`; AI and Collaboration ↔ publication `archive-is-not-a-toy`.
  - `now.md`: `updated: 2026-10-16`. One line: "Comprehensive exams: History of Capitalism and History of Medicine." Then a short paragraph on Footnotes on Film.
- [ ] **Step 4:** Run `npm test -- schemas && npm run build`. Expected: PASS, and the build validates every content file.
- [ ] **Step 5:** Commit: `feat: content collections and site content`.

### Task 3: Home page (concept C with OCR and NER)

**Files:**
- Create: `src/lib/periodize.ts`, `src/lib/recent.ts`, `src/components/Hero.astro`, `src/components/Headshot.astro`, `src/scripts/hero.ts`
- Modify: `src/pages/index.astro`
- Test: `tests/unit/periodize.test.ts`, `tests/unit/recent.test.ts`, `tests/e2e/home.spec.ts`

**Interfaces:**
- Produces: `periodize(word: string): string` (period spelling for one token, punctuation kept).
- Produces: `recentItems(talks, publications, n = 4): {title: string; date: string; meta: string; href: string}[]`, newest first. `href` is the talk's URL or the publication's `url`, otherwise `/writing#<slug>`.
- Produces: `runHero(root: HTMLElement, opts: {animate: boolean}): void` in `hero.ts`.
- Consumes: `site` (Task 1); the `talks` and `publications` collections (Task 2).

- [ ] **Step 1: Write the failing unit tests.**
  - `periodize`: `Jacob→Iacob`, `Historian→Hiſtorian`, `University→Vniverſity`, `Atlantic→Atlantick`, `Atlantic,→Atlantick,`, `and→&`, `its→its`, `class→claſs`, `transfer→transfer`, `Saskatoon:→Saſkatoon:`, `Student→Student`, `2026→2026`.
  - `recentItems`: given 3 talks and 3 publications, it returns 4 items sorted by date descending. The first is "Fitting Machine to Page" (2026-10-16). A publication dated just `2025` sorts as 2025-01-01.
- [ ] **Step 2:** Run `npm test -- periodize recent`. Expected: FAIL.
- [ ] **Step 3:** Implement `periodize` with the mockup's rules: whole word `and`→`&`; initial `J`→`I`; initial `U`→`V`; `ic` at the end of a word→`ick`; lowercase `s`→`ſ` when the next character is a letter other than `f`. Implement `recentItems`.
- [ ] **Step 4:** Run `npm test -- periodize recent`. Expected: PASS.
- [ ] **Step 5: Write the failing e2e tests** in `tests/e2e/home.spec.ts`:
  - `hero final state`: after the animation (wait for `[data-hero="done"]`), the transcription `h1` reads "Jacob Polay", the tagline equals `site.tagline`, and the page shows exactly 5 `.ent` elements with `data-type` values person, place, org, place, date.
  - `hero facsimile`: the page image contains "Iacob Polay", "Hiſtorian" and "Vniverſity", and has `aria-hidden="true"`.
  - `hero no-js` (JavaScript disabled): the transcription text is complete and visible, with no `.w` elements with opacity 0.
  - `hero reduced-motion` (`reducedMotion: 'reduce'`): `[data-hero="done"]` appears within 300ms, and no element ever has the class `box` or `show-label`.
  - `hero once per session`: on a second visit in the same context, `[data-hero="done"]` appears within 300ms.
  - `hero storage-blocked`: with sessionStorage throwing, the hero still reaches `done` with no console errors.
  - `ner labels clear of text`: at 375px and 1280px, while the labels show, no `.ent-label`'s bounding box intersects the client rects of the preceding text line in the same block.
  - `ner hover`: hovering the ORG entity makes its label's computed opacity `1`. The entities link as follows: PERSON → `#about`, ORG → `/cv`, "Atlantic world" → `/research`, "2026" → `/now`. "Saskatoon" has no link.
  - `about and recent`: `#about` contains "PhD student in the Department of History". "Recent" lists 4 items, the first being "Fitting Machine to Page". The catchword links to `/research`.
  - `headshot omitted`: with `site.headshot === null`, there is no `img` inside `#about`.
- [ ] **Step 6:** Run `npm run test:e2e -- home`. Expected: FAIL.
- [ ] **Step 7:** Implement:
  - `Hero.astro` server-renders both panes in their final state. The facsimile is built at build time by running every word of the title-page text through `periodize`.
  - `hero.ts` reads `jp-hero-played`. It animates only when `opts.animate` is true, which means no reduced motion and not already played. The animation follows the mockup's `runC` and `nerPass` timing: about 4 seconds in total, labels shown for 2.5 seconds. The script sets `data-hero="done"` on the root at the end, or immediately when it doesn't animate.
  - The NER labels are real `<span class="ent-label" aria-hidden="true">` elements. The transcript gets `line-height: 2.1` so labels clear the line above.
  - The home page: About paragraphs from the overview, `<Headshot>` (renders nothing when `site.headshot` is null), Recent, contact links and the catchword to Research.
- [ ] **Step 8:** Run `npm run test:e2e -- home`. Expected: PASS in both projects.
- [ ] **Step 9:** Commit: `feat: home page with OCR transcription and NER pass`.

### Task 4: Citations and the Writing & Talks page

**Files:**
- Create: `src/lib/cite.ts`, `src/components/CiteButton.astro`, `src/scripts/cite.ts`
- Modify: `src/pages/writing.astro`
- Test: `tests/unit/cite.test.ts`, `tests/e2e/writing.spec.ts`

**Interfaces:**
- Produces: `chicago(p: PublicationData, opts?: {html?: boolean}): string`, `bibtexKey(p: PublicationData): string`, `bibtex(p: PublicationData): string`. `PublicationData` is the inferred type of `publicationSchema` plus `slug: string`. With `html: true`, the venue is wrapped in `<i>`; otherwise the output is plain text.
- Consumes: the `publications` and `talks` collections.

- [ ] **Step 1: Write the failing unit tests.** Exact plain-text `chicago()` outputs:
  - `Polay, Jacob. "Circumventing the Garbler." Intersections 8, no. 1 (2025): 28.`
  - `Clifford, Jim, Jacob Polay, Jessica Jack, Mark Humphries, and Lianne C. Leddy. "Reading the Archive by Machine: An OCR Benchmark for Historians, 1612–1921." Working Papers in Critical Search, no. 4 (2026). https://working-papers-in-critical-search.github.io/paper-004-ocr-benchmark/.`
  - `Polay, Jacob, Chloë Farr, and Jessica Jack. "The Archive is Not a Toy: The Hidden Problems of a 'Vintage' AI." Active History, July 13, 2026. https://activehistory.ca/blog/2026/07/13/the-archive-is-not-a-toy-the-hidden-problems-of-a-vintage-ai/.`
  - Also: with `html: true`, the venue is wrapped in `<i>…</i>`, and a title ending in `?` gets no extra period. `bibtexKey` gives `polay2025circumventing`, `clifford2026reading` and `polay2026archive` (first author's family name, year, first title word not in {a, an, the}, all lowercased, ASCII). `bibtex()` produces `@article`, `@techreport` (working paper) and `@online` (blog post) entries with balanced braces; "Chloë" and "1612–1921" are kept as UTF-8; `doi` appears only when it is set.
- [ ] **Step 2:** Run `npm test -- cite`. Expected: FAIL.
- [ ] **Step 3:** Implement `cite.ts` so the tests pass. Inner double quotes in titles become single quotes.
- [ ] **Step 4:** Run `npm test -- cite`. Expected: PASS.
- [ ] **Step 5: Write the failing e2e tests** in `tests/e2e/writing.spec.ts`:
  - `sections`: the page has Publications (3, newest first), Public scholarship (the AI and Collaboration series) and Talks (3, newest first), and each item has `id={slug}`.
  - `cite no-js`: with JavaScript disabled, each Cite control is a `<details>`, and opening it shows the Chicago text.
  - `cite copy`: with clipboard permissions granted, clicking "Copy" on the Garbler citation puts the exact plain-text Chicago string on the clipboard, and the button announces "Copied" through `aria-live`.
  - `bibtex download`: clicking "BibTeX" downloads `polay2026archive.bib` for the Active History post, and the content starts with `@online{polay2026archive,`.
- [ ] **Step 6:** Run `npm run test:e2e -- writing`. Expected: FAIL.
- [ ] **Step 7:** Implement `CiteButton.astro` as `<details><summary>Cite</summary>` containing the Chicago text, a Copy button and a BibTeX download link (a `data:text/plain;charset=utf-8,` URL with the `download` attribute). `cite.ts` handles Copy with `navigator.clipboard.writeText`. Build `writing.astro` from the collections, with citations rendered by `chicago(p, {html: true})`.
- [ ] **Step 8:** Run `npm run test:e2e -- writing`. Expected: PASS.
- [ ] **Step 9:** Commit: `feat: writing and talks page with Chicago and BibTeX citations`.

### Task 5: Projects with the knowledge graph and list toggle

**Files:**
- Create: `src/lib/graph.ts`, `src/components/ProjectGraph.astro`, `src/components/ProjectList.astro`, `src/scripts/projects-view.ts`, `src/pages/projects/[slug].astro`
- Modify: `src/pages/projects/index.astro`
- Test: `tests/unit/graph.test.ts`, `tests/e2e/projects.spec.ts`

**Interfaces:**
- Produces, in `graph.ts`:
  ```ts
  type NodeKind = 'project' | 'publication' | 'talk' | 'person' | 'method';
  interface GraphNode { id: string; label: string; kind: NodeKind; href?: string }
  interface GraphEdge { source: string; target: string }
  interface Graph { nodes: GraphNode[]; edges: GraphEdge[] }
  interface GraphInput {
    projects: { slug: string; title: string; collaborators: string[]; methods: string[]; related: string[] }[];
    publications: { slug: string; title: string; authors: string[]; related: string[] }[];
    talks: { slug: string; title: string; presenters: string[]; related: string[] }[];
  }
  function buildGraph(input: GraphInput, self?: string /* default 'Jacob Polay' */): Graph
  function layoutGraph(g: Graph, opts: { width: number; height: number; iterations?: number }): (GraphNode & { x: number; y: number })[]
  ```
  Node ids are `project:<slug>`, `publication:<slug>`, `talk:<slug>`, `person:<kebab-name>` and `method:<kebab-name>`. Items link to `/projects/<slug>` or `/writing#<slug>`. The page converts publication authors to display names (`${given} ${family}`) before calling `buildGraph`.
- Consumes: the `projects`, `publications` and `talks` collections.

- [ ] **Step 1: Write the failing unit tests:**
  - `buildGraph dedupes people`: "Jim Clifford" appearing in a project and in two talks produces one `person:jim-clifford` node with three edges.
  - `buildGraph excludes self`: there is no node for "Jacob Polay".
  - `buildGraph methods threshold`: a method used by only one item gets no node; a method used by two or more does.
  - `buildGraph unknown related`: `related: ['talk:nope']` throws `Unknown related id "talk:nope" in project:<slug>`.
  - `buildGraph undirected dedupe`: A→B and B→A produce one edge.
  - `layoutGraph deterministic`: two runs give identical coordinates.
  - `layoutGraph in bounds`: every x is in [40, width−40] and every y is in [30, height−30].
- [ ] **Step 2:** Run `npm test -- graph`. Expected: FAIL.
- [ ] **Step 3:** Implement. `layoutGraph` uses `forceSimulation` with `forceLink` (distance 90), `forceManyBody` (strength −260), `forceCenter` and `forceCollide` (28). Call `.stop()`, then `tick(iterations ?? 300)`, then clamp to the bounds. d3's default phyllotaxis start positions make the result deterministic: no `Math.random`.
- [ ] **Step 4:** Run `npm test -- graph`. Expected: PASS.
- [ ] **Step 5: Write the failing e2e tests** in `tests/e2e/projects.spec.ts`:
  - `default desktop graph`: at 1280px, the graph `svg` is visible and the list is hidden. The Toolbox node has the class `featured`.
  - `default phone list`: at 375px, the list is visible.
  - `toggle remembers`: switching to List, then reloading, still shows the list. The toggle is a pair of buttons with `aria-pressed`.
  - `projects storage-blocked`: with localStorage throwing, the toggle still switches views.
  - `projects no-js`: the list is visible, the toggle isn't rendered visibly, and the list's order is Toolbox first.
  - `graph keyboard`: Tab reaches a node; focusing it lights its neighbours (the class `lit`); Enter navigates to the node's `href`.
  - `project pages`: each `/projects/<slug>` shows its title, status, role and links, plus related items linking back to `/writing#…` or `/projects/…`.
- [ ] **Step 6:** Run `npm run test:e2e -- projects`. Expected: FAIL.
- [ ] **Step 7:** Implement:
  - `ProjectGraph.astro` renders a static SVG at build time from `layoutGraph` (viewBox `0 0 720 480`). Each node is an `<a href>` with `tabindex="0"` and an `aria-label` naming the item and its kind. Project, publication and talk nodes are filled; person and method nodes are hollow. Styling follows the mockup.
  - The list is in the HTML by default. A `<script>` adds `js` to `<html>`, and CSS then shows the toggle and the stored view, defaulting to graph at ≥ 768px.
  - `projects-view.ts` (about 2 KB) handles the toggle, hover and focus highlighting.
- [ ] **Step 8:** Run `npm run test:e2e -- projects`. Expected: PASS.
- [ ] **Step 9:** Commit: `feat: projects knowledge graph with list view and project pages`.

### Task 6: Research, CV and Now pages

**Files:**
- Modify: `src/pages/research.astro`, `src/pages/cv.astro`, `src/pages/now.astro`
- Test: `tests/e2e/pages.spec.ts`

**Interfaces:**
- Consumes: `cv` (Task 2), the `publications` and `talks` collections, `now.md`, `chicago(…, {html: true})` (Task 4).

- [ ] **Step 1: Write the failing e2e tests:**
  - `research`: the page has three sections (doctoral project, NLP + GraphRAG, OCR benchmarking); a link to `https://jimclifford.ca/` with the text "Dr. Jim Clifford" next to "Professor of History"; a training line naming "History of Capitalism" and "History of Medicine"; and no text matching `/SSHRC/i` on any page in the nav.
  - `cv`: there is a "Download PDF" link to `/Polay_Jacob_CV.pdf`, which responds with content type `application/pdf`. Education lists the PhD, MA (with the full thesis title "Loud Yet Invisible: A Humanist-Designed Pipeline for Unlocking the Early Modern Archive") and BA. Publications and talks come from the collections, with talks newest first. Experience and awards match `cv.ts`.
  - `now`: the page shows "Updated 16 October 2026", mentions the comprehensive exams in one line, and mentions Footnotes on Film.
  - `catchwords`: Research → Projects, Projects → Writing & Talks, Writing & Talks → CV, CV → Now, Now → About.
- [ ] **Step 2:** Run `npm run test:e2e -- pages`. Expected: FAIL.
- [ ] **Step 3:** Implement the three pages from the overview and `cv.ts`, and set each page's `next`. Dates display as "16 October 2026".
- [ ] **Step 4:** Run `npm run test:e2e -- pages`. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: research, CV and now pages`.

### Task 7: Sharing, metadata and feeds

**Files:**
- Create: `src/pages/og.png.ts`, `src/lib/og-card.ts`, `src/components/Meta.astro`, `src/pages/rss.xml.ts`, `public/favicon-32.png`, `public/apple-touch-icon.png`
- Modify: `astro.config.mjs` (sitemap), `src/layouts/Base.astro` (use Meta)
- Test: `tests/e2e/meta.spec.ts`

**Interfaces:**
- Produces: `renderOgCard(): Promise<Buffer>` in `og-card.ts`, a 1200×630 PNG made with satori and resvg, using the IM Fell and Source Serif font files from `node_modules/@fontsource*`.
- Consumes: `site`, and the `publications` collection for the RSS feed and the ScholarlyArticle data.

- [ ] **Step 1: Write the failing e2e tests:**
  - `og tags`: every page has `og:title`, `og:description`, `og:image` = `https://jacobpolay.ca/og.png`, `twitter:card` = `summary_large_image`, and a canonical link.
  - `og image`: `/og.png` is a PNG of 1200×630 (read the IHDR bytes).
  - `json-ld person`: on the home page, the `Person` JSON-LD has `name` "Jacob Polay", `affiliation` University of Saskatchewan, and a `sameAs` containing the ORCID, Bluesky and GitHub URLs.
  - `json-ld articles`: `/writing` has 3 `ScholarlyArticle` objects whose `headline`s match the publication titles.
  - `feeds`: `/sitemap-index.xml` and `/rss.xml` return 200, and the RSS feed has 3 items.
  - `favicons`: the `<head>` links `favicon.svg`, `favicon-32.png` and `apple-touch-icon.png`, and all three return 200.
- [ ] **Step 2:** Run `npm run test:e2e -- meta`. Expected: FAIL.
- [ ] **Step 3:** Implement. The share card mirrors the title page: paper background, double rules, "Jacob Polay" in IM Fell at 120px, the tagline in IM Fell italic, a rubric ❦, and "PhD Student · History · University of Saskatchewan" in small caps. Export the two PNG favicons once from `favicon.svg` with resvg, using a one-off script run with `node`, and commit the PNGs.
- [ ] **Step 4:** Run `npm run test:e2e -- meta`. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: share card, favicons, structured data, sitemap and RSS`.

### Task 8: Site-wide quality sweep

**Files:**
- Create: `tests/e2e/sitewide.spec.ts`

- [ ] **Step 1: Write the tests.** For every URL in `/sitemap-0.xml`:
  - `internal links`: every internal `href`, `src` and `#fragment` target resolves (200, and the element with that id exists).
  - `axe`: no serious or critical violations, in light and in dark.
  - `no horizontal scroll`: at 360px wide, `document.documentElement.scrollWidth <= 360`.
  - `no-js render`: with JavaScript disabled, `main` has more than 200 characters of text.
  - `no third parties`: during page load, no request goes to a host other than `localhost:4321`.
- [ ] **Step 2:** Run `npm run test:e2e`. Expected: the full suite passes. Fix any failures in the task that owns the code, and record each fix in its own commit.
- [ ] **Step 3:** Run Lighthouse against `npm run preview` on `/` and `/projects`. Expected: Performance ≥ 95 and Accessibility ≥ 95 on both. Record the scores in the commit message.
- [ ] **Step 4:** Manual browser check in the preview pane, at 375px and 1280px, light and dark: the hero animation, the NER labels, the graph and the Cite buttons. Take screenshots for Jacob.
- [ ] **Step 5:** Commit: `test: site-wide link, accessibility, layout and privacy checks`.

### Task 9: Deploy to Cloudflare (requires Jacob's go-ahead at each external step)

**Files:**
- Create: `wrangler.jsonc`, `README.md`

- [ ] **Step 1:** Write `wrangler.jsonc`: `name: "jacobpolay-ca"`, a current `compatibility_date`, `assets: { directory: "./dist", not_found_handling: "404-page" }`, and `routes: [{ pattern: "jacobpolay.ca", custom_domain: true }, { pattern: "www.jacobpolay.ca", custom_domain: true }]`. There is no `main`: the Worker only serves static files.
- [ ] **Step 2:** Write `README.md` for Jacob. It covers how to add a project, talk or publication (copy an existing file and change the fields), how to update `now.md` and the headshot, how to run the site locally (`npm install`, `npm run dev`), and that pushing to `main` deploys.
- [ ] **Step 3:** Run `npm run build && npx wrangler deploy --dry-run`. Expected: it uploads nothing and reports the asset count.
- [ ] **Step 4 (ask Jacob first):** Create the GitHub repo `polayj/jacobpolay.ca` with `gh repo create polayj/jacobpolay.ca --public --source . --push`. Ask whether it should be public or private.
- [ ] **Step 5 (Jacob, in the Cloudflare dashboard, guided):** In Workers & Pages, create a Worker by importing the GitHub repo, with build command `npm run build` and deploy command `npx wrangler deploy`. Cloudflare attaches `jacobpolay.ca` and `www.jacobpolay.ca` from `routes`. Then add a redirect rule: `www.jacobpolay.ca/*` → `https://jacobpolay.ca/$1` (301).
- [ ] **Step 6:** Verify: `curl -sI https://jacobpolay.ca` returns 200; `curl -sI https://www.jacobpolay.ca/cv` returns 301 to `https://jacobpolay.ca/cv`; the share card previews correctly in a link-preview checker.
- [ ] **Step 7:** Commit: `chore: Cloudflare Worker config and README`. Push after Jacob confirms.
