import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer, request as createRequest, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { expect, it } from 'vitest';

import {
  createHomepagePresetMiddleware,
  createHomepagePresetPersistencePlugin,
} from './homepagePresetMiddleware';
import { getHomepagePresetTarget } from './homepagePresetSource';

const horizontalStoryId =
  'animated-illustrations-businessflowhorizontal--current-nextjs-app' as const;

async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve());
  });
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Expected an internet server address.');
  }
  return `http://127.0.0.1:${address.port}`;
}

async function close(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

async function postWithHost(url: string, host: string, origin: string, body: string) {
  const target = new URL(url);
  return new Promise<number>((resolve, reject) => {
    const request = createRequest(
      {
        hostname: target.hostname,
        port: target.port,
        path: target.pathname,
        method: 'POST',
        headers: {
          Host: host,
          Origin: origin,
          'Content-Type': 'application/json',
          'X-Kipory-Storybook-Save': '1',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (response) => {
        response.resume();
        response.once('end', () => resolve(response.statusCode ?? 0));
      },
    );
    request.once('error', reject);
    request.end(body);
  });
}

it('reports local capability and saves through the real HTTP endpoint', async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), 'kipory-preset-endpoint-'));
  const target = getHomepagePresetTarget(horizontalStoryId);
  const targetPath = join(projectRoot, target.relativePath);
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(
    targetPath,
    `import type { Props } from './types';

export const businessFlowHorizontalHomepageDarkProps = {
  connectorOpacity: 0.22,
  beamEnabled: true,
} satisfies Props;
`,
    'utf8',
  );

  const middleware = createHomepagePresetMiddleware({ projectRoot });
  const server = createServer((request, response) => {
    middleware(request, response, () => {
      response.statusCode = 404;
      response.end();
    });
  });

  try {
    const origin = await listen(server);
    const capability = await fetch(`${origin}/__kipory/homepage-presets`);
    expect(capability.status).toBe(200);
    expect(await capability.json()).toEqual({ available: true });

    const saved = await fetch(`${origin}/__kipory/homepage-presets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Kipory-Storybook-Save': '1',
        Origin: origin,
      },
      body: JSON.stringify({
        storyId: horizontalStoryId,
        args: { connectorOpacity: 0.64 },
      }),
    });

    expect(saved.status).toBe(200);
    expect(await saved.json()).toEqual({ saved: true });
    expect(await readFile(targetPath, 'utf8')).toContain('connectorOpacity: 0.64');
  } finally {
    if (server.listening) {
      await close(server);
    }
    await rm(projectRoot, { recursive: true, force: true });
  }
});

it('rejects non-local, malformed, oversized, and unregistered requests without changing source', async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), 'kipory-preset-security-'));
  const target = getHomepagePresetTarget(horizontalStoryId);
  const targetPath = join(projectRoot, target.relativePath);
  const initialSource = `export const businessFlowHorizontalHomepageDarkProps = {
  connectorOpacity: 0.22,
  beamEnabled: true,
} satisfies Props;
`;
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, initialSource, 'utf8');

  const middleware = createHomepagePresetMiddleware({ projectRoot, maxBodyBytes: 256 });
  const server = createServer((request, response) => {
    middleware(request, response, () => {
      response.statusCode = 404;
      response.end();
    });
  });

  try {
    const origin = await listen(server);
    const endpoint = `${origin}/__kipory/homepage-presets`;
    const validBody = JSON.stringify({
      storyId: horizontalStoryId,
      args: { connectorOpacity: 0.64 },
    });
    const post = (
      body: string,
      headers: Record<string, string> = {},
    ) => fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Kipory-Storybook-Save': '1',
        Origin: origin,
        ...headers,
      },
      body,
    });

    expect(await postWithHost(endpoint, 'evil.test', origin, validBody)).toBe(403);
    expect((await post(validBody, { Origin: 'http://evil.test' })).status).toBe(403);
    expect(
      (
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Origin: origin },
          body: validBody,
        })
      ).status,
    ).toBe(403);
    expect((await post(validBody, { 'Content-Type': 'text/plain' })).status).toBe(415);
    expect((await post('{not-json')).status).toBe(400);
    expect((await post(JSON.stringify({ padding: 'x'.repeat(512) }))).status).toBe(413);

    const invalidPayloads = [
      { storyId: horizontalStoryId, args: {}, extra: true },
      { storyId: 'animated-illustrations-businessflowhorizontal--foundation', args: {} },
      { storyId: horizontalStoryId, args: null },
      { storyId: horizontalStoryId, args: [] },
      { storyId: horizontalStoryId, args: { unknown: 1 } },
      { storyId: horizontalStoryId, args: { connectorOpacity: { nested: true } } },
    ];
    for (const payload of invalidPayloads) {
      expect((await post(JSON.stringify(payload))).status).toBe(400);
    }

    const put = await fetch(endpoint, { method: 'PUT' });
    expect(put.status).toBe(405);
    expect(put.headers.get('Allow')).toBe('GET, POST');
    expect((await fetch(`${origin}/unrelated`)).status).toBe(404);
    expect(await readFile(targetPath, 'utf8')).toBe(initialSource);
  } finally {
    if (server.listening) {
      await close(server);
    }
    await rm(projectRoot, { recursive: true, force: true });
  }
});

it('registers the working middleware only as a Vite development plugin', async () => {
  const registered: Array<ReturnType<typeof createHomepagePresetMiddleware>> = [];
  const plugin = createHomepagePresetPersistencePlugin({ projectRoot: '/unused-for-capability' });
  expect(plugin.apply).toBe('serve');
  expect(typeof plugin.configureServer).toBe('function');

  const configureServer = plugin.configureServer as unknown as (server: {
    middlewares: {
      use: (middleware: ReturnType<typeof createHomepagePresetMiddleware>) => void;
    };
  }) => void;
  configureServer({ middlewares: { use: (middleware) => registered.push(middleware) } });

  const server = createServer((request, response) => {
    registered[0](request, response, () => {
      response.statusCode = 404;
      response.end();
    });
  });

  try {
    const origin = await listen(server);
    const response = await fetch(`${origin}/__kipory/homepage-presets`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ available: true });
  } finally {
    if (server.listening) {
      await close(server);
    }
  }
});
