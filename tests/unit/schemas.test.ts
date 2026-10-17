import { describe, it, expect } from 'vitest';
import { talkSchema, publicationSchema, projectSchema } from '../../src/content/schemas';

const talk = { title: 'T', presenters: ['Jacob Polay'], event: 'E', place: 'P', date: '2026-10-16' };
const pub = { type: 'article', authors: [{ given: 'Jacob', family: 'Polay' }], title: 'T', venue: 'V', date: '2025' };
const project = { title: 'P', summary: 'S', status: 'active', role: 'Lead', order: 1, links: [], collaborators: [], methods: [], related: [] };

describe('talkSchema', () => {
  it('accepts a complete talk', () => expect(talkSchema.safeParse(talk).success).toBe(true));
  it('rejects a talk without date', () => {
    const { date, ...rest } = talk;
    expect(talkSchema.safeParse(rest).success).toBe(false);
  });
  it('rejects a free-text date', () => expect(talkSchema.safeParse({ ...talk, date: 'Oct 2026' }).success).toBe(false));
});

describe('publicationSchema', () => {
  it('accepts a year-only date', () => expect(publicationSchema.safeParse(pub).success).toBe(true));
  it('accepts a full date', () => expect(publicationSchema.safeParse({ ...pub, date: '2026-07-13' }).success).toBe(true));
  it('rejects an author without family name', () =>
    expect(publicationSchema.safeParse({ ...pub, authors: [{ given: 'Jacob' }] }).success).toBe(false));
  it('defaults related to []', () => expect(publicationSchema.parse(pub).related).toEqual([]));
});

describe('projectSchema', () => {
  it('accepts a project', () => expect(projectSchema.safeParse(project).success).toBe(true));
  it('rejects a summary over 200 characters', () =>
    expect(projectSchema.safeParse({ ...project, summary: 'x'.repeat(201) }).success).toBe(false));
  it('defaults featured to false', () => expect(projectSchema.parse(project).featured).toBe(false));
});
