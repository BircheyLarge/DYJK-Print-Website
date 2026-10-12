/**
 * Stamps the quote form with a signed "issued at" time as /request-a-quote/
 * is served, so POST /api/quote can tell a person (a few seconds or more)
 * from a bot (instantly). It works without JavaScript, and the page stays
 * static for everyone else. See src/lib/form-token.ts.
 */
import { issueToken } from '../../src/lib/form-token';

interface Env {
  TURNSTILE_SECRET_KEY?: string;
}

interface Context {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
}

// The Workers runtime's streaming HTML rewriter; not in the DOM typings.
declare class HTMLRewriter {
  on(
    selector: string,
    handlers: {
      element(element: {
        setAttribute(name: string, value: string): void;
      }): void;
    },
  ): HTMLRewriter;
  transform(response: Response): Response;
}

export const onRequest = async ({
  request,
  env,
  next,
}: Context): Promise<Response> => {
  const response = await next();
  const secret = env.TURNSTILE_SECRET_KEY;
  const isPage =
    request.method === 'GET' &&
    (response.headers.get('content-type') ?? '').includes('text/html');
  if (!secret || !isPage) return response;

  const token = await issueToken(secret);
  const stamped = new HTMLRewriter()
    .on('input[name="issued"]', {
      element(element) {
        element.setAttribute('value', token);
      },
    })
    .transform(response);
  // Each visit gets its own stamp, so no shared cache may keep one.
  const headers = new Headers(stamped.headers);
  headers.set('cache-control', 'private, no-store');
  return new Response(stamped.body, { status: stamped.status, headers });
};
