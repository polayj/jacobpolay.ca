import { getCollection } from 'astro:content';
import type { GraphInput } from './graph';

/** Loads projects, publications and talks in the shape buildGraph() expects. */
export async function loadGraphInput(): Promise<GraphInput> {
  const [projects, publications, talks] = await Promise.all([
    getCollection('projects'),
    getCollection('publications'),
    getCollection('talks'),
  ]);
  return {
    projects: projects.map((p) => ({
      slug: p.id, title: p.data.title, collaborators: p.data.collaborators, methods: p.data.methods, related: p.data.related,
    })),
    publications: publications.map((p) => ({
      slug: p.id, title: p.data.title, authors: p.data.authors.map((a) => `${a.given} ${a.family}`), related: p.data.related,
    })),
    talks: talks.map((t) => ({ slug: t.id, title: t.data.title, presenters: t.data.presenters, related: t.data.related })),
  };
}
