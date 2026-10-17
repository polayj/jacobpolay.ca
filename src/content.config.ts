import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { projectSchema, publicationSchema, talkSchema, nowSchema } from './content/schemas';

export const collections = {
  projects: defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/projects' }), schema: projectSchema }),
  publications: defineCollection({ loader: glob({ pattern: '*.yaml', base: './src/content/publications' }), schema: publicationSchema }),
  talks: defineCollection({ loader: glob({ pattern: '*.yaml', base: './src/content/talks' }), schema: talkSchema }),
  now: defineCollection({ loader: glob({ pattern: 'now.md', base: './src/content' }), schema: nowSchema }),
};
