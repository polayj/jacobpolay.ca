// Runs before the static assets: sends www.jacobpolay.ca and plain http to https://jacobpolay.ca,
// then hands every other request to the built site in ./dist.
interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const CANONICAL_HOST = 'jacobpolay.ca';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const ours = url.hostname === CANONICAL_HOST || url.hostname === `www.${CANONICAL_HOST}`;
    if (ours && (url.hostname !== CANONICAL_HOST || url.protocol !== 'https:')) {
      url.hostname = CANONICAL_HOST;
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
