import { z } from 'astro/zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');
const yearOrDate = z.string().regex(/^\d{4}(-\d{2}-\d{2})?$/, 'Use YYYY or YYYY-MM-DD');
/** Graph ids such as "talk:fitting-machine-to-page" or "project:toolbox". */
const relatedIds = z.array(z.string().regex(/^(project|publication|talk):[a-z0-9-]+$/)).default([]);

export const projectSchema = z.object({
  title: z.string(),
  summary: z.string().max(200),
  status: z.enum(['active', 'in development', 'complete', 'ongoing']),
  role: z.string(),
  featured: z.boolean().default(false),
  order: z.number(),
  links: z.array(z.object({ label: z.string(), href: z.url() })),
  collaborators: z.array(z.string()),
  methods: z.array(z.string()),
  related: relatedIds,
});

export const publicationSchema = z.object({
  type: z.enum(['article', 'working-paper', 'blog-post']),
  authors: z.array(z.object({ given: z.string(), family: z.string() })).min(1),
  title: z.string(),
  venue: z.string(),
  date: yearOrDate,
  volume: z.string().optional(),
  issue: z.string().optional(),
  number: z.string().optional(),
  pages: z.string().optional(),
  doi: z.string().optional(),
  url: z.url().optional(),
  summary: z.string().optional(),
  related: relatedIds,
});

export const talkSchema = z.object({
  title: z.string(),
  presenters: z.array(z.string()).min(1),
  event: z.string(),
  place: z.string(),
  date: isoDate,
  url: z.url().optional(),
  summary: z.string().optional(),
  related: relatedIds,
});

export const nowSchema = z.object({ updated: isoDate });

export type ProjectData = z.infer<typeof projectSchema>;
export type PublicationData = z.infer<typeof publicationSchema> & { slug: string };
export type TalkData = z.infer<typeof talkSchema> & { slug: string };
