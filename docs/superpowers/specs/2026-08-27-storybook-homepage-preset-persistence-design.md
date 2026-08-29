# Storybook Homepage Preset Persistence Design

## Goal

Allow a developer to tune any of the three `Current Next.js App` illustration stories in Storybook and explicitly save the current Controls values into the typed homepage preset consumed by both Storybook and the Next.js homepage. Reloading either application must retain the saved values.

The three supported stories are:

- `animated-illustrations-businessflow3d--current-nextjs-app`
- `animated-illustrations-businessflowvertical--current-nextjs-app`
- `animated-illustrations-businessflowhorizontal--current-nextjs-app`

Saving is an intentional development action. Changing a control remains temporary until the developer clicks **Save to Next.js**.

## Scope

This feature extends the existing Storybook manager toolbar and adds a development-only Storybook server endpoint. It updates only these canonical preset declarations:

- `businessFlow3DHomepageProps` in `src/features/business-flow-3d/presets.ts`
- `businessFlowVerticalHomepageProps` in `src/features/business-flow-vertical/presets.ts`
- `businessFlowHorizontalHomepageProps` in `src/features/business-flow-horizontal/presets.ts`

The existing data flow remains unchanged after a save:

```text
typed feature homepage preset
    ├── Next.js homepage component props
    └── Storybook “Current Next.js App” story args
```

There is no production API, database, browser storage, or background synchronization. The rewritten TypeScript preset is the durable source of truth and is reviewed through source control.

## User Experience

The Storybook toolbar shows the existing **Copy JSON** action and a new **Save to Next.js** action only while one of the three supported `Current Next.js App` stories is active.

The save action has four states:

- **Save to Next.js** when ready;
- **Saving…** while the request is in flight, with repeat clicks disabled;
- **Saved** briefly after a successful write;
- **Save failed** after an error, accompanied by a concise tooltip or notification containing the server's safe error message.

The manager checks the development endpoint's availability. In a static or hosted Storybook build, where the file-writing middleware does not exist, the action is disabled or omitted and explains that saving is available only from the local Storybook development server. **Copy JSON** remains available.

After a successful save, Storybook's source watcher reloads the imported story preset and the Next.js development server reloads the same preset used by the homepage. A manual reload must reproduce the saved configuration in both places.

## Architecture

### Manager toolbar

`.storybook/manager.tsx` owns the browser-side toolbar UI. Its story filter changes from the current BusinessFlow3D prefix check to an exact allowlist of the three supported story IDs. A shared helper filters `useArgs()` values through the current story's enabled `argTypes`, removes functions, and produces the flat serializable payload used by both **Copy JSON** and **Save to Next.js**.

The save request contains only:

```json
{
  "storyId": "animated-illustrations-businessflowhorizontal--current-nextjs-app",
  "args": {
    "connectorOpacity": 0.22
  }
}
```

The browser never sends a filesystem path, export name, or arbitrary source text.

### Development middleware

`.storybook/main.ts` registers a small Vite development plugin through `viteFinal`. Its `configureServer` hook installs same-origin middleware beneath a reserved path such as `/__kipory/homepage-presets`.

The middleware exposes:

- a read-only capability request used by the manager to determine whether local saving is available;
- a `POST` save request that validates and writes one approved preset.

The middleware is installed only by `storybook dev`. A static Storybook build contains the manager UI but no writable endpoint and no server-side file-writing code in its browser bundle.

The middleware and its pure parsing, validation, merge, and rendering helpers live in a dedicated `.storybook` module so they can be tested without starting Storybook.

### Story-to-preset registry

The server owns a fixed registry mapping each exact story ID to one repository-relative preset file and export name. Paths are resolved from the Storybook configuration directory, never from request data.

```text
BusinessFlow3D current-app story
    → src/features/business-flow-3d/presets.ts
    → businessFlow3DHomepageProps

BusinessFlowVertical current-app story
    → src/features/business-flow-vertical/presets.ts
    → businessFlowVerticalHomepageProps

BusinessFlowHorizontal current-app story
    → src/features/business-flow-horizontal/presets.ts
    → businessFlowHorizontalHomepageProps
```

Unknown story IDs are rejected before any filesystem operation.

## Preset Read, Merge, and Write

The writer reads the selected TypeScript file and uses the TypeScript parser to locate the registered exported variable and its object-literal initializer. It does not use regular expressions to locate editable source and does not evaluate or import the module.

The current object literal defines the writable key allowlist and provides the values used when a request omits a key. Every supported preset value must remain a flat JSON primitive: string, finite number, or boolean. The writer rejects unknown keys, `null`, arrays, nested objects, functions, non-finite numbers, and a source object containing unsupported expressions.

For each accepted request:

1. Parse the current preset object.
2. Reject any submitted key not already present in that object.
3. Validate each submitted value as an allowed primitive and require it to have the same primitive category as the existing value.
4. Merge submitted values over the current values; missing request keys preserve the existing preset values.
5. Render the complete object deterministically in its existing key order.
6. Replace only the initializer object literal, preserving imports, the exported constant name, and its `satisfies` type expression.
7. Write a temporary sibling file and atomically rename it over the preset file.

Strings are emitted through JSON string serialization, so request content cannot become executable TypeScript. The result stays readable, produces stable diffs, and continues to be checked by the existing `satisfies` declaration and TypeScript build.

If parsing, validation, temporary writing, or renaming fails, the original preset file remains untouched and the endpoint returns a non-success status with a safe, actionable error.

## Request Security and Limits

Although this is a local development tool, the endpoint must not behave as a general filesystem writer. It enforces all of the following:

- the request host is a loopback hostname or address;
- the `Origin`, when present, matches the Storybook server origin;
- the content type is JSON;
- a custom manager header is present, preventing a simple cross-origin form submission;
- the request body has a small fixed size limit;
- the story ID is in the exact server-side registry;
- the payload contains only the expected top-level fields;
- every argument key and value passes the preset validation rules;
- no path supplied by the browser is accepted or resolved.

The endpoint returns method-not-allowed for unsupported methods and structured JSON errors for invalid requests. Error responses do not expose absolute paths or source contents.

## Concurrency and Reload Behavior

The manager disables the button while its save is active. The server processes each request independently against the latest file contents, so omitted keys are always merged with the newest persisted object rather than a stale browser copy. Atomic replacement prevents readers from observing a partially written preset.

If separate Storybook tabs save the same story at nearly the same time, the last completed valid save wins. This local developer workflow does not add locking or conflict resolution; source control and the visible Controls state make the resulting edit reviewable.

The source rewrite may cause the active story to reload and reset its runtime args to the newly saved preset. That reset is expected and confirms that the persisted object is now authoritative.

## Testing and Verification

Automated tests cover the pure server behavior:

- all three exact story IDs resolve to the intended preset and export;
- unknown story IDs never reach filesystem access;
- the TypeScript parser locates the registered object and rejects missing, duplicate, or unsupported declarations;
- partial payloads preserve omitted values and existing key order;
- strings, booleans, and finite numbers serialize deterministically;
- unknown keys, type-category changes, nested values, non-finite numbers, malformed JSON, oversized bodies, invalid origins, and missing custom headers are rejected;
- a successful save replaces only the registered object literal;
- a failed write leaves the original source unchanged;
- the manager filter shows save controls only for the three supported stories and submits the filtered current args.

Integration verification uses the local development servers:

1. Open each `Current Next.js App` story.
2. Change a representative control and click **Save to Next.js**.
3. Confirm the matching preset source changes and unrelated preset files do not.
4. Reload Storybook and confirm the control retains the saved value.
5. Reload the Next.js homepage and confirm the corresponding illustration uses the same value.
6. Restore any verification-only value through the same save workflow.

The complete test suite, TypeScript checking, ESLint, the Next.js production build, and the Storybook production build must still pass. The production Storybook output must not expose a functioning file-write endpoint.

## Out of Scope

- Automatic saving on every Controls change
- Saving Foundation, Workflow, or any non-homepage story
- Editing arbitrary source files or creating new preset keys
- Persisting functions, React elements, arrays, nested objects, or other complex args
- A production or remotely hosted write service
- Multi-user locking, authentication, database storage, or cloud synchronization
- Reformatting entire preset files or unrelated source code
