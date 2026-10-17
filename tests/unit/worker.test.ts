import { describe, it, expect } from 'vitest';
import worker from '../../worker/index';

const env = {
  ASSETS: { fetch: async (req: Request) => new Response(`asset:${new URL(req.url).pathname}`, { status: 200 }) },
};
const get = (url: string) => worker.fetch(new Request(url), env);

describe('worker', () => {
  it('redirects www to the bare domain, keeping path and query', async () => {
    const res = await get('https://www.jacobpolay.ca/cv?x=1');
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe('https://jacobpolay.ca/cv?x=1');
  });
  it('redirects http to https', async () => {
    const res = await get('http://jacobpolay.ca/projects');
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe('https://jacobpolay.ca/projects');
  });
  it('serves everything else from the static assets', async () => {
    const res = await get('https://jacobpolay.ca/writing');
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('asset:/writing');
  });
  it('leaves local development hosts alone', async () => {
    const res = await get('http://localhost:8787/cv');
    expect(await res.text()).toBe('asset:/cv');
  });
});
