import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

import {
  HOMEPAGE_PRESET_ENDPOINT,
  HOMEPAGE_PRESET_SAVE_HEADER,
  type HomepagePresetArgs,
  isHomepagePresetStoryId,
} from './homepagePresetContract.ts';
import { HomepagePresetSourceError, saveHomepagePreset } from './homepagePresetSource.ts';

type Next = () => void;
type HomepagePresetMiddleware = (
  request: IncomingMessage,
  response: ServerResponse,
  next: Next,
) => void;

type HomepagePresetMiddlewareOptions = {
  projectRoot: string;
  maxBodyBytes?: number;
};

class HomepagePresetRequestError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

function sendJson(response: ServerResponse, statusCode: number, body: object): void {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

function isLoopbackHost(host: string | undefined): boolean {
  if (!host) {
    return false;
  }

  try {
    const hostname = new URL(`http://${host}`).hostname.toLowerCase();
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  } catch {
    return false;
  }
}

function isSameOrigin(origin: string | undefined, host: string): boolean {
  if (!origin) {
    return true;
  }

  try {
    return new URL(origin).host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

async function readBody(request: IncomingMessage, maxBodyBytes: number): Promise<string> {
  const chunks: Buffer[] = [];
  let byteLength = 0;
  let tooLarge = false;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    byteLength += buffer.byteLength;
    if (byteLength <= maxBodyBytes) {
      chunks.push(buffer);
    } else {
      tooLarge = true;
    }
  }

  if (tooLarge) {
    throw new HomepagePresetRequestError(413, 'Request body is too large.');
  }

  return Buffer.concat(chunks).toString('utf8');
}

function parsePayload(body: string): {
  storyId: ReturnType<typeof assertStoryId>;
  args: HomepagePresetArgs;
} {
  let value: unknown;
  try {
    value = JSON.parse(body);
  } catch {
    throw new HomepagePresetRequestError(400, 'Request body must be valid JSON.');
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HomepagePresetRequestError(400, 'Invalid homepage preset payload.');
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  if (keys.length !== 2 || keys[0] !== 'args' || keys[1] !== 'storyId') {
    throw new HomepagePresetRequestError(400, 'Invalid homepage preset payload fields.');
  }
  if (!record.args || typeof record.args !== 'object' || Array.isArray(record.args)) {
    throw new HomepagePresetRequestError(400, 'Homepage preset args must be an object.');
  }

  return {
    storyId: assertStoryId(record.storyId),
    args: record.args as HomepagePresetArgs,
  };
}

function assertStoryId(value: unknown) {
  if (typeof value !== 'string' || !isHomepagePresetStoryId(value)) {
    throw new HomepagePresetRequestError(400, 'Unknown homepage preset story.');
  }
  return value;
}

export function createHomepagePresetMiddleware({
  projectRoot,
  maxBodyBytes = 64 * 1024,
}: HomepagePresetMiddlewareOptions): HomepagePresetMiddleware {
  return (request, response, next) => {
    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
    if (pathname !== HOMEPAGE_PRESET_ENDPOINT) {
      next();
      return;
    }

    const host = request.headers.host;
    if (!isLoopbackHost(host) || !isSameOrigin(request.headers.origin, host ?? '')) {
      sendJson(response, 403, { error: 'Homepage preset saving is local-only.' });
      return;
    }

    if (request.method === 'GET') {
      sendJson(response, 200, { available: true });
      return;
    }

    if (request.method !== 'POST') {
      response.setHeader('Allow', 'GET, POST');
      sendJson(response, 405, { error: 'Method not allowed.' });
      return;
    }

    if (request.headers[HOMEPAGE_PRESET_SAVE_HEADER.toLowerCase()] !== '1') {
      sendJson(response, 403, { error: 'Missing Storybook save authorization header.' });
      return;
    }

    const contentType = request.headers['content-type'];
    if (typeof contentType !== 'string' || !contentType.toLowerCase().startsWith('application/json')) {
      sendJson(response, 415, { error: 'Content-Type must be application/json.' });
      return;
    }

    void (async () => {
      try {
        const payload = parsePayload(await readBody(request, maxBodyBytes));

        await saveHomepagePreset(projectRoot, payload.storyId, payload.args);
        sendJson(response, 200, { saved: true });
      } catch (error) {
        if (error instanceof HomepagePresetRequestError) {
          sendJson(response, error.statusCode, { error: error.message });
        } else if (error instanceof HomepagePresetSourceError) {
          sendJson(response, 400, { error: error.message });
        } else {
          sendJson(response, 500, { error: 'Unable to save homepage preset.' });
        }
      }
    })();
  };
}

export function createHomepagePresetPersistencePlugin(
  options: HomepagePresetMiddlewareOptions,
): Plugin {
  return {
    name: 'kipory-homepage-preset-persistence',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(createHomepagePresetMiddleware(options));
    },
  };
}
