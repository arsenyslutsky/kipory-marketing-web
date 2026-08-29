# Storybook Homepage Preset Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an explicit local Storybook toolbar action that persists Controls values from the three `Current Next.js App` stories into their canonical typed homepage preset files.

**Architecture:** A browser-safe contract module defines the exact supported story IDs and request shape. The Storybook manager renders copy/save controls, while a Vite development middleware validates same-origin requests and delegates to a TypeScript-AST source writer that can update only the three registered preset object literals through atomic file replacement.

**Tech Stack:** TypeScript 5.9, React 19, Storybook 10 manager API, Vite development middleware, Node.js HTTP/filesystem APIs, TypeScript compiler API, Vitest 4, Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-27-storybook-homepage-preset-persistence-design.md`

## Global Constraints

- Saving is explicit through **Save to Next.js**; Controls changes never auto-save.
- Only the three exact `Current Next.js App` story IDs may write presets.
- The browser never supplies a file path, export name, or source text.
- Preset values remain flat strings, finite numbers, and booleans.
- Missing request keys preserve current persisted values; unknown keys and primitive-category changes are rejected.
- Writes replace only the registered object literal through a temporary sibling file and atomic rename.
- The endpoint exists only in local Storybook development and accepts only loopback, same-origin JSON requests carrying the custom save header.
- No Next.js route, production write API, browser storage, database, or new dependency is introduced.
- Use strict TDD: add one observable-behavior test, run it red for the expected reason, add minimal production code, then run it green before continuing.

## File Structure

- Create `.storybook/homepagePresetContract.ts`: browser-safe IDs, types, arg filtering, and request builders shared by the manager and server.
- Create `.storybook/homepagePresetContract.test.ts`: story allowlist, arg filtering, and request contract behavior.
- Create `.storybook/homepagePresetSource.ts`: server-only story registry, TypeScript AST parsing/merging/rendering, and atomic preset writes.
- Create `.storybook/homepagePresetSource.test.ts`: real source transformations and temporary-filesystem write coverage.
- Create `.storybook/homepagePresetMiddleware.ts`: Node request validation, bounded JSON parsing, capability response, save endpoint, and Vite plugin factory.
- Create `.storybook/homepagePresetMiddleware.test.ts`: real HTTP-server integration tests against a temporary project tree.
- Create `.storybook/HomepagePresetToolbar.tsx`: React copy/save toolbar UI and save-state transitions.
- Create `.storybook/HomepagePresetToolbar.test.tsx`: visible, unavailable, successful, and failed save behavior.
- Modify `.storybook/manager.tsx`: register the toolbar for the three exact supported stories and feed current Storybook args/argTypes into the toolbar component.
- Modify `.storybook/main.ts`: install the development middleware plugin through `viteFinal`.

---

### Task 1: Define the browser/server contract

**Files:**
- Create: `.storybook/homepagePresetContract.ts`
- Test: `.storybook/homepagePresetContract.test.ts`

**Interfaces:**
- Produces: `HOMEPAGE_PRESET_ENDPOINT`, `HOMEPAGE_PRESET_SAVE_HEADER`, `HOMEPAGE_PRESET_STORY_IDS`, `HomepagePresetStoryId`, `HomepagePresetArgs`, `isHomepagePresetStoryId(value)`, `filterHomepagePresetArgs(args, argTypes)`, `createHomepagePresetCapabilityRequest()`, and `createHomepagePresetSaveRequest(storyId, args)`.
- Consumes: no application modules; this file must remain safe in both manager-browser and Storybook-server bundles.

- [ ] **Step 1: Write failing allowlist and filtering tests**

```ts
import { describe, expect, it } from 'vitest';
import {
  createHomepagePresetSaveRequest,
  filterHomepagePresetArgs,
  isHomepagePresetStoryId,
} from './homepagePresetContract';

describe('homepage preset contract', () => {
  it.each([
    'animated-illustrations-businessflow3d--current-nextjs-app',
    'animated-illustrations-businessflowvertical--current-nextjs-app',
    'animated-illustrations-businessflowhorizontal--current-nextjs-app',
  ])('accepts the supported story %s', (storyId) => {
    expect(isHomepagePresetStoryId(storyId)).toBe(true);
  });

  it('rejects foundation and prefix-only story IDs', () => {
    expect(isHomepagePresetStoryId('animated-illustrations-businessflowhorizontal--foundation')).toBe(false);
    expect(isHomepagePresetStoryId('animated-illustrations-businessflowhorizontal--current-nextjs-app-extra')).toBe(false);
  });

  it('keeps enabled current args and removes disabled or functional args', () => {
    expect(filterHomepagePresetArgs(
      { speed: 1.4, color: '#fff', renderLabel: () => 'x', hidden: true },
      { speed: {}, color: {}, renderLabel: {}, hidden: { table: { disable: true } } },
    )).toEqual({ speed: 1.4, color: '#fff' });
  });

  it('builds a same-origin JSON save request with the required custom header', async () => {
    const request = createHomepagePresetSaveRequest(
      'animated-illustrations-businessflowhorizontal--current-nextjs-app',
      { connectorOpacity: 0.22 },
    );
    expect(request.url).toBe('/__kipory/homepage-presets');
    expect(request.init).toMatchObject({ method: 'POST' });
    expect(request.init.headers).toEqual({
      'Content-Type': 'application/json',
      'X-Kipory-Storybook-Save': '1',
    });
    expect(request.init.body).toBe(JSON.stringify({
      storyId: 'animated-illustrations-businessflowhorizontal--current-nextjs-app',
      args: { connectorOpacity: 0.22 },
    }));
  });
});
```

- [ ] **Step 2: Run the contract test and verify RED**

Run: `npm test -- .storybook/homepagePresetContract.test.ts`

Expected: FAIL because `homepagePresetContract.ts` and its exports do not exist.

- [ ] **Step 3: Implement the minimal shared contract**

```ts
export const HOMEPAGE_PRESET_ENDPOINT = '/__kipory/homepage-presets';
export const HOMEPAGE_PRESET_SAVE_HEADER = 'X-Kipory-Storybook-Save';

export const HOMEPAGE_PRESET_STORY_IDS = [
  'animated-illustrations-businessflow3d--current-nextjs-app',
  'animated-illustrations-businessflowvertical--current-nextjs-app',
  'animated-illustrations-businessflowhorizontal--current-nextjs-app',
] as const;

export type HomepagePresetStoryId = typeof HOMEPAGE_PRESET_STORY_IDS[number];
export type HomepagePresetArgs = Record<string, unknown>;
export type HomepagePresetArgTypes = Record<string, { table?: { disable?: boolean } }>;

export function isHomepagePresetStoryId(value: string | undefined): value is HomepagePresetStoryId {
  return typeof value === 'string' && HOMEPAGE_PRESET_STORY_IDS.includes(value as HomepagePresetStoryId);
}

export function filterHomepagePresetArgs(
  args: Record<string, unknown>,
  argTypes: HomepagePresetArgTypes,
): HomepagePresetArgs {
  return Object.fromEntries(Object.keys(argTypes)
    .filter((name) => argTypes[name]?.table?.disable !== true && name in args)
    .filter((name) => typeof args[name] !== 'function')
    .map((name) => [name, args[name]]));
}

export function createHomepagePresetCapabilityRequest() {
  return { url: HOMEPAGE_PRESET_ENDPOINT, init: { method: 'GET' } satisfies RequestInit };
}

export function createHomepagePresetSaveRequest(
  storyId: HomepagePresetStoryId,
  args: HomepagePresetArgs,
) {
  return {
    url: HOMEPAGE_PRESET_ENDPOINT,
    init: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [HOMEPAGE_PRESET_SAVE_HEADER]: '1',
      },
      body: JSON.stringify({ storyId, args }),
    } satisfies RequestInit,
  };
}
```

- [ ] **Step 4: Run the contract test and verify GREEN**

Run: `npm test -- .storybook/homepagePresetContract.test.ts`

Expected: PASS with all four behaviors covered.

- [ ] **Step 5: Commit the contract**

```bash
git add .storybook/homepagePresetContract.ts .storybook/homepagePresetContract.test.ts
git commit -m "feat: define Storybook preset save contract"
```

---

### Task 2: Parse and atomically rewrite registered presets

**Files:**
- Create: `.storybook/homepagePresetSource.ts`
- Test: `.storybook/homepagePresetSource.test.ts`

**Interfaces:**
- Consumes: `HomepagePresetArgs` and `HomepagePresetStoryId` from Task 1.
- Produces: `getHomepagePresetTarget(storyId): { relativePath: string; exportName: string }`, `rewriteHomepagePresetSource(source, exportName, args): string`, and `saveHomepagePreset(projectRoot, storyId, args): Promise<void>`.

- [ ] **Step 1: Write a failing transformation test**

```ts
import { expect, it } from 'vitest';
import { rewriteHomepagePresetSource } from './homepagePresetSource';

it('merges partial primitive args while preserving imports, omitted values, and key order', () => {
  const source = `import type { Props } from './types';\n\nexport const demo = {\n  color: '#fff',\n  speed: 1.4,\n  enabled: true,\n} satisfies Props;\n`;

  expect(rewriteHomepagePresetSource(source, 'demo', { speed: 0.5 })).toBe(
    `import type { Props } from './types';\n\nexport const demo = {\n  color: "#fff",\n  speed: 0.5,\n  enabled: true,\n} satisfies Props;\n`,
  );
});
```

- [ ] **Step 2: Run the source test and verify RED**

Run: `npm test -- .storybook/homepagePresetSource.test.ts`

Expected: FAIL because the source writer does not exist.

- [ ] **Step 3: Implement TypeScript-AST discovery and deterministic rendering**

Implement `rewriteHomepagePresetSource` with `typescript.createSourceFile`, requiring exactly one exported variable with the requested name, unwrapping its `satisfies` expression, and accepting only object property assignments whose names are identifiers or string literals and whose initializers are string literals, finite numeric literals (including unary negative literals), or `true`/`false` keywords.

Use these concrete helpers and contracts:

```ts
type Primitive = string | number | boolean;
type PresetEntry = { key: string; value: Primitive };

function readPrimitive(node: ts.Expression): Primitive;
function readPresetEntries(object: ts.ObjectLiteralExpression): PresetEntry[];
function serializePrimitive(value: Primitive): string {
  return typeof value === 'string' ? JSON.stringify(value) : String(value);
}
function renderPresetObject(entries: PresetEntry[]): string;
```

Throw `HomepagePresetSourceError` for a missing/duplicate export, non-object initializer, duplicate/unsupported property, unknown submitted key, unsupported submitted value, non-finite number, or primitive-category change. Derive the replacement span from the AST object's `getStart(sourceFile)` and `.getEnd()` so only the object literal changes.

- [ ] **Step 4: Run the first source test and verify GREEN**

Run: `npm test -- .storybook/homepagePresetSource.test.ts`

Expected: PASS.

- [ ] **Step 5: Add failing table tests for unsafe source and payload shapes**

Add literal fixtures asserting rejection of:

```ts
it.each([
  ['unknown key', { missing: 1 }, 'Unknown preset property'],
  ['type change', { speed: 'fast' }, 'must remain a number'],
  ['nested value', { speed: { value: 1 } }, 'must be a string, finite number, or boolean'],
  ['non-finite value', { speed: Number.POSITIVE_INFINITY }, 'must be finite'],
])('rejects %s', (_label, args, message) => {
  expect(() => rewriteHomepagePresetSource(validSource, 'demo', args)).toThrow(message);
});
```

Use explicit malformed source fixtures for the source-only cases:

```ts
it.each([
  ['duplicate export', `export const demo = { speed: 1 };\nexport const demo = { speed: 2 };`, 'exactly one exported preset'],
  ['spread property', `export const demo = { ...base } satisfies Props;`, 'property assignments'],
  ['computed property', `export const demo = { ['speed']: 1 } satisfies Props;`, 'static property name'],
  ['shorthand property', `export const demo = { speed } satisfies Props;`, 'property assignments'],
  ['unsupported initializer', `export const demo = { speed: defaultSpeed } satisfies Props;`, 'literal primitive'],
])('rejects a source containing %s', (_label, source, message) => {
  expect(() => rewriteHomepagePresetSource(source, 'demo', {})).toThrow(message);
});
```

- [ ] **Step 6: Run the source tests and verify RED, then implement minimal validation**

Run: `npm test -- .storybook/homepagePresetSource.test.ts`

Expected before implementation: FAIL on the first missing validation branch. Add one validation branch at a time and rerun until all cases pass.

- [ ] **Step 7: Add a failing real-filesystem atomic save test**

Create a `mkdtemp` project tree containing the registered horizontal preset path, call `saveHomepagePreset(tempRoot, horizontalStoryId, { connectorOpacity: 0.64 })`, and assert:

- the target file contains `connectorOpacity: 0.64`;
- its other literal values remain present;
- no sibling `.tmp` file remains;
- the other registered target paths were not created.

Also call `saveHomepagePreset` with invalid args and assert the original file is byte-for-byte unchanged.

- [ ] **Step 8: Run the filesystem test and verify RED**

Run: `npm test -- .storybook/homepagePresetSource.test.ts`

Expected: FAIL because `saveHomepagePreset` is not implemented.

- [ ] **Step 9: Implement the fixed registry and atomic writer**

Define an exhaustive `Record<HomepagePresetStoryId, HomepagePresetTarget>` using the three paths and export names from the spec. Resolve the registered relative path below `projectRoot`, read UTF-8, transform it, write a sibling temporary file named with `process.pid` and `randomUUID()`, rename it over the target, and unlink the temporary file in an error cleanup path. Never concatenate request-provided data into a path.

- [ ] **Step 10: Run the source tests and verify GREEN**

Run: `npm test -- .storybook/homepagePresetSource.test.ts`

Expected: PASS with transformation, validation, and real-filesystem coverage.

- [ ] **Step 11: Commit the source writer**

```bash
git add .storybook/homepagePresetSource.ts .storybook/homepagePresetSource.test.ts
git commit -m "feat: persist registered homepage presets"
```

---

### Task 3: Expose a bounded local development endpoint

**Files:**
- Create: `.storybook/homepagePresetMiddleware.ts`
- Test: `.storybook/homepagePresetMiddleware.test.ts`
- Modify: `.storybook/main.ts`

**Interfaces:**
- Consumes: endpoint/header constants and story guard from Task 1; `saveHomepagePreset(projectRoot, storyId, args)` from Task 2.
- Produces: `createHomepagePresetMiddleware({ projectRoot, maxBodyBytes? })` and `createHomepagePresetPersistencePlugin({ projectRoot })`.

- [ ] **Step 1: Write a failing real-HTTP capability and save test**

Start a Node `createServer` with `createHomepagePresetMiddleware`, binding to `127.0.0.1` on an ephemeral port and returning 404 from `next()`. Against that real server, assert:

```ts
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
    storyId: 'animated-illustrations-businessflowhorizontal--current-nextjs-app',
    args: { connectorOpacity: 0.64 },
  }),
});
expect(saved.status).toBe(200);
expect(await saved.json()).toEqual({ saved: true });
expect(await readFile(horizontalPresetPath, 'utf8')).toContain('connectorOpacity: 0.64');
```

- [ ] **Step 2: Run the middleware test and verify RED**

Run: `npm test -- .storybook/homepagePresetMiddleware.test.ts`

Expected: FAIL because the middleware module does not exist.

- [ ] **Step 3: Implement routing, capability response, and valid saves**

Implement a Connect-compatible `(request, response, next) => void` handler. Call `next()` for paths other than `HOMEPAGE_PRESET_ENDPOINT`. Return JSON with `Content-Type: application/json; charset=utf-8`, never absolute paths. For a valid POST, read the bounded body, validate the exact `{ storyId, args }` shape, call `saveHomepagePreset`, and return `{ saved: true }`.

- [ ] **Step 4: Run the capability/save test and verify GREEN**

Run: `npm test -- .storybook/homepagePresetMiddleware.test.ts`

Expected: PASS.

- [ ] **Step 5: Add failing HTTP rejection tests**

Use the same real server to verify literal response statuses and that the preset file remains unchanged for:

- non-loopback `Host` → 403;
- mismatched `Origin` → 403;
- missing `X-Kipory-Storybook-Save` → 403;
- non-JSON content type → 415;
- malformed JSON → 400;
- body larger than the configured test limit → 413;
- extra top-level field, unknown story ID, array/null `args`, unknown arg, or nested arg → 400;
- `PUT` → 405 with `Allow: GET, POST`;
- an unrelated path → the test server's 404 fallback.

- [ ] **Step 6: Run rejection tests and verify RED, then add each validation branch**

Run: `npm test -- .storybook/homepagePresetMiddleware.test.ts`

Expected before implementation: FAIL on rejected requests that currently save or return the wrong status. Add `isLoopbackHost`, `isSameOrigin`, `readJsonBody`, and exact-payload validation helpers, rerunning until all tests pass.

- [ ] **Step 7: Add the Vite plugin to Storybook config**

In `.storybook/main.ts`, resolve the repository root from the configuration module and append the plugin without discarding existing Vite plugins:

```ts
import { fileURLToPath } from 'node:url';
import { createHomepagePresetPersistencePlugin } from './homepagePresetMiddleware';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  staticDirs: ['../public'],
  async viteFinal(viteConfig) {
    viteConfig.plugins = [
      ...(viteConfig.plugins ?? []),
      createHomepagePresetPersistencePlugin({ projectRoot }),
    ];
    return viteConfig;
  },
};
```

The plugin's `configureServer` installs the middleware. It has no build-time write hook, so a static Storybook build cannot service the endpoint.

- [ ] **Step 8: Run middleware tests, typecheck, and Storybook build**

Run: `npm test -- .storybook/homepagePresetMiddleware.test.ts && npm run typecheck && npm run build-storybook`

Expected: tests and typecheck PASS; Storybook static build completes, with only the repository's existing chunk-size warning permitted.

- [ ] **Step 9: Commit the endpoint**

```bash
git add .storybook/homepagePresetMiddleware.ts .storybook/homepagePresetMiddleware.test.ts .storybook/main.ts
git commit -m "feat: add local Storybook preset endpoint"
```

---

### Task 4: Add copy and explicit save controls to the Storybook toolbar

**Files:**
- Create: `.storybook/HomepagePresetToolbar.tsx`
- Test: `.storybook/HomepagePresetToolbar.test.tsx`
- Modify: `.storybook/manager.tsx`

**Interfaces:**
- Consumes: story ID, current args, enabled argTypes, request builders, and endpoint responses from Tasks 1 and 3.
- Produces: `HomepagePresetToolbar` accepting `{ storyId, args, argTypes, fetcher? }`; `.storybook/manager.tsx` becomes a thin Storybook-hook adapter.

- [ ] **Step 1: Write failing toolbar visibility and save-state tests**

Render `HomepagePresetToolbar` with the supported horizontal story ID, representative args, and argTypes. Inject a `fetcher` whose capability response is `{ available: true }` and whose POST response is `{ saved: true }`. Assert that:

- **Copy JSON** and **Save to Next.js** become available;
- clicking save changes the button to **Saving…** while the POST promise is pending;
- resolving the POST changes it to **Saved**;
- the request body contains the filtered current args, excluding disabled/function args.

Add explicit unavailable and failed-save cases:

```tsx
it('disables saving when the local capability endpoint is unavailable', async () => {
  render(<HomepagePresetToolbar {...baseProps} fetcher={async () => new Response(null, { status: 404 })} />);
  expect(await screen.findByRole('button', { name: /local storybook development server/i })).toBeDisabled();
  expect(screen.getByRole('button', { name: /copy/i })).toBeEnabled();
});

it('shows the server error after a rejected save', async () => {
  const fetcher = vi.fn()
    .mockResolvedValueOnce(Response.json({ available: true }))
    .mockResolvedValueOnce(Response.json({ error: 'Preset rejected' }, { status: 400 }));
  render(<HomepagePresetToolbar {...baseProps} fetcher={fetcher} />);
  await userEvent.click(await screen.findByRole('button', { name: 'Save to Next.js' }));
  expect(await screen.findByRole('button', { name: /Save failed: Preset rejected/i })).toBeEnabled();
});
```

- [ ] **Step 2: Run the toolbar test and verify RED**

Run: `npm test -- .storybook/HomepagePresetToolbar.test.tsx`

Expected: FAIL because `HomepagePresetToolbar` does not exist.

- [ ] **Step 3: Implement the toolbar component**

Use `CopyIcon` and `SaveIcon`, Storybook's `Button` and `useCopyButton`, React state/effect, and the shared filter/request helpers. The capability effect must use `AbortController` and ignore abort errors. Disable repeat save clicks while saving. Expose safe server error text in the button tooltip/accessible label, reset **Saved** to ready after a short timer, and clear timers/requests on unmount or story change.

The injected fetch signature is:

```ts
type HomepagePresetFetcher = (input: string, init?: RequestInit) => Promise<Response>;
```

Production defaults to `globalThis.fetch`; tests inject only the external HTTP boundary while exercising the real component, request construction, filtering, and state transitions.

- [ ] **Step 4: Run the toolbar test and verify GREEN**

Run: `npm test -- .storybook/HomepagePresetToolbar.test.tsx`

Expected: PASS without React `act` warnings.

- [ ] **Step 5: Replace the manager's prefix-only tool with the exact story adapter**

Keep `useArgs`, `useArgTypes`, and `useStorybookState` in `.storybook/manager.tsx`. Render `HomepagePresetToolbar` only when `viewMode === 'story'` and `isHomepagePresetStoryId(storyId)` is true. Register the tool under a homepage-illustration addon ID and set its title to `Save homepage illustration parameters`.

- [ ] **Step 6: Run toolbar/contract tests, lint, and typecheck**

Run: `npm test -- .storybook/HomepagePresetContract.test.ts .storybook/HomepagePresetToolbar.test.tsx && npm run lint && npm run typecheck`

Expected: all commands PASS with no `act`, lint, or type errors.

- [ ] **Step 7: Commit the toolbar**

```bash
git add .storybook/HomepagePresetToolbar.tsx .storybook/HomepagePresetToolbar.test.tsx .storybook/manager.tsx
git commit -m "feat: save homepage presets from Storybook"
```

---

### Task 5: Verify persistence across Storybook and Next.js

**Files:**
- Modify only if verification exposes a tested defect in the files from Tasks 1–4.

**Interfaces:**
- Consumes: complete local save workflow.
- Produces: verified local persistence without retaining verification-only preset edits.

- [ ] **Step 1: Run the complete automated verification suite**

Run:

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run build-storybook
git diff --check
```

Expected: all tests, lint, typecheck, Next.js build, Storybook build, and whitespace check PASS. The known Storybook chunk-size warning is non-fatal.

- [ ] **Step 2: Start or confirm both local development servers**

Run Storybook on `http://localhost:6006` and Next.js on the repository's current local port. Confirm the endpoint capability request returns `{ "available": true }` only from the Storybook development server.

- [ ] **Step 3: Verify each story writes only its matching preset**

For 3D, vertical, and horizontal in turn:

1. record the selected preset file's current contents;
2. change one representative numeric control;
3. click **Save to Next.js** and wait for **Saved**;
4. reload the story and confirm the control retains the value;
5. reload the Next.js homepage and confirm the matching illustration reflects the value;
6. confirm neither of the other two preset files changed;
7. restore the recorded value through Storybook's save action.

- [ ] **Step 4: Verify static Storybook cannot save**

Serve or inspect the built Storybook output and confirm `/__kipory/homepage-presets` is not a functioning write endpoint. Confirm the manager reports local saving as unavailable while **Copy JSON** remains usable.

- [ ] **Step 5: Re-run focused tests and confirm a clean worktree**

Run: `npm test -- .storybook && git diff --check && git status --short`

Expected: Storybook persistence tests PASS; no verification-only preset values or uncommitted build artifacts remain.

- [ ] **Step 6: Commit any verification-driven fix through its own red-green cycle**

If verification exposes a defect, first add a focused failing regression test to the relevant existing test file, watch it fail, patch only the matching module, rerun the focused and full suites, and commit those two explicit files with `git commit -m "fix: harden Storybook preset persistence"`. If no correction is needed, do not create an empty commit.
