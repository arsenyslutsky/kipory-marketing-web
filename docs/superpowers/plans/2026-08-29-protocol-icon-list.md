# Protocol Icon List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable, type-safe horizontal list of existing protocol icons with an optional reference-styled title and selectable wrapping or horizontal-scrolling behavior.

**Architecture:** Add a focused `ProtocolIconList` component beside `ProtocolIcon`. It maps a caller-ordered `readonly ProtocolIconVariant[]` to semantic list items containing `ProtocolIcon withText`, while a CSS module owns the title treatment and the two layout modes. Storybook supplies interactive controls and representative stories without coupling the component to a page surface.

**Tech Stack:** React 19, TypeScript, CSS Modules, Vitest, Testing Library, Storybook 10.

**Spec:** `docs/superpowers/specs/2026-08-29-protocol-icon-list-design.md`

## Global Constraints

- Accept only existing `ProtocolIconVariant` values.
- Preserve caller order exactly; repeated variants are outside the supported contract.
- `layout` supports exactly `wrap` and `scroll`, defaulting to `wrap`.
- `size` defaults to `48` and scales the icons, optional title treatment, and inter-logo gap.
- Logo, text, and title opacity are independently controllable from `0` to `1` and default to fully opaque.
- Logo, text, and title scale are independently controllable from `0.5` to `1.5` and default to `1`.
- Entry spacing and logo-to-label spacing have independent `0.5` to `1.5` scale controls and default to `1`.
- The optional title uses a 56px `currentColor` rule, 22px rule-to-title gap, existing accent typography tokens, uppercase text, and accent green.
- The component inherits its background and does not recreate the reference grid.
- Do not create implementation commits: `ProtocolIcon` is currently untracked shared work, so the user’s later aggregate commit must keep the dependency and this component atomic.

---

### Task 1: Implement the ProtocolIconList contract

**Files:**
- Create: `src/components/icons/ProtocolIconList/ProtocolIconList.test.tsx`
- Create: `src/components/icons/ProtocolIconList/ProtocolIconList.tsx`
- Create: `src/components/icons/ProtocolIconList/ProtocolIconList.module.css`
- Create: `src/components/icons/ProtocolIconList/index.ts`

**Interfaces:**
- Consumes: `ProtocolIcon`, `ProtocolIconVariant` from `../ProtocolIcon`.
- Produces: `ProtocolIconList`, `ProtocolIconListLayout`, and `ProtocolIconListProps` from `src/components/icons/ProtocolIconList/index.ts`.

- [ ] **Step 1: Write the failing behavior tests**

Create tests that exercise the real component API:

```tsx
import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';

import { ProtocolIconList } from './ProtocolIconList';

it('renders built-in protocol names in caller order', () => {
  render(<ProtocolIconList variants={['sockets', 'mcp', 'graphql']} />);
  const items = screen.getAllByRole('listitem');

  expect(items).toHaveLength(3);
  expect(within(items[0]).getByText('Sockets')).toBeInTheDocument();
  expect(within(items[1]).getByText('MCP')).toBeInTheDocument();
  expect(within(items[2]).getByText('GraphQL')).toBeInTheDocument();
});

it('renders the optional title only when supplied', () => {
  const { rerender } = render(
    <ProtocolIconList title="Adjustable Surface" variants={['rest']} />,
  );

  expect(screen.getByText('Adjustable Surface')).toBeInTheDocument();
  rerender(<ProtocolIconList variants={['rest']} />);
  expect(screen.queryByText('Adjustable Surface')).not.toBeInTheDocument();
});

it.each(['wrap', 'scroll'] as const)('selects the %s layout', (layout) => {
  render(<ProtocolIconList data-testid="protocol-list" layout={layout} variants={['sse']} />);
  expect(screen.getByTestId('protocol-list')).toHaveAttribute('data-layout', layout);
});

it('passes one shared size to every protocol icon', () => {
  const { container } = render(
    <ProtocolIconList size={32} variants={['grpc', 'jsonata']} />,
  );
  expect([...container.querySelectorAll('svg')].map((svg) => svg.getAttribute('height')))
    .toEqual(['32', '32']);
});

it('renders an empty semantic list for empty input', () => {
  render(<ProtocolIconList variants={[]} />);
  expect(screen.getByRole('list')).toBeEmptyDOMElement();
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
PATH="/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH" npm test -- src/components/icons/ProtocolIconList/ProtocolIconList.test.tsx
```

Expected: FAIL because `./ProtocolIconList` does not exist.

- [ ] **Step 3: Implement the minimal component**

Create the component with this contract and structure:

```tsx
import type { HTMLAttributes, ReactNode } from 'react';

import { ProtocolIcon, type ProtocolIconVariant } from '../ProtocolIcon';
import styles from './ProtocolIconList.module.css';

export type ProtocolIconListLayout = 'wrap' | 'scroll';

export type ProtocolIconListProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  layout?: ProtocolIconListLayout;
  size?: number;
  title?: ReactNode;
  variants: readonly ProtocolIconVariant[];
};

export function ProtocolIconList({
  className,
  layout = 'wrap',
  size = 48,
  title,
  variants,
  ...props
}: ProtocolIconListProps) {
  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-layout={layout}
      {...props}
    >
      {title ? <p className={styles.title}>{title}</p> : null}
      <ul className={styles.list}>
        {variants.map((variant) => (
          <li className={styles.item} key={variant}>
            <ProtocolIcon variant={variant} height={size} withText />
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Create the CSS module with these exact behaviors:

```css
.root {
  min-width: 0;
  color: inherit;
}

.title {
  margin: 0 0 var(--protocol-icon-list-title-gap, 32px);
  display: flex;
  align-items: center;
  gap: 22px;
  color: var(--accent);
  font-family: var(--type-accent-family);
  font-size: var(--type-accent-size-page);
  font-weight: var(--type-accent-weight);
  line-height: var(--type-accent-leading-page);
  letter-spacing: var(--type-accent-tracking);
  text-transform: uppercase;
}

.title::before {
  content: '';
  width: 56px;
  height: 1px;
  flex: 0 0 auto;
  background: currentColor;
}

.list {
  margin: 0;
  padding: 0;
  display: flex;
  gap: var(--protocol-icon-list-item-gap, clamp(24px, 4vw, 48px));
  align-items: center;
  list-style: none;
}

.item {
  flex: 0 0 auto;
}

.root[data-layout='wrap'] .list {
  flex-wrap: wrap;
}

.root[data-layout='scroll'] .list {
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  scrollbar-color: var(--accent-dark) color-mix(in srgb, var(--paper) 8%, transparent);
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
}
```

Export the public surface:

```ts
export {
  ProtocolIconList,
  type ProtocolIconListLayout,
  type ProtocolIconListProps,
} from './ProtocolIconList';
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run the Task 1 command again.

Expected: all `ProtocolIconList.test.tsx` tests PASS without warnings.

---

### Task 2: Add Storybook stories and contract tests

**Files:**
- Create: `src/components/icons/ProtocolIconList/ProtocolIconList.stories.tsx`
- Create: `src/components/icons/ProtocolIconList/ProtocolIconList.stories.test.tsx`

**Interfaces:**
- Consumes: `ProtocolIconList` and its public props from `./ProtocolIconList`.
- Produces: Storybook stories `Wrapped`, `Scrollable`, and `WithoutTitle` under `Icons/ProtocolIconList`.

- [ ] **Step 1: Write failing story contract tests**

```tsx
import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { expect, it } from 'vitest';

import { ProtocolIconList } from './ProtocolIconList';
import meta, { Scrollable, WithoutTitle, Wrapped } from './ProtocolIconList.stories';

function renderStory(story: { args?: Partial<ComponentProps<typeof ProtocolIconList>> }) {
  const args = { ...meta.args, ...story.args } as ComponentProps<typeof ProtocolIconList>;
  return render(<ProtocolIconList {...args} />);
}

it('keeps the configured logo order in the wrapped story', () => {
  renderStory(Wrapped);
  expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
    'MCP', 'REST', 'GraphQL', 'gRPC', 'JSONata', 'SSE', 'Sockets',
  ]);
});

it('provides the horizontal scrolling story', () => {
  renderStory(Scrollable);
  expect(screen.getByRole('list').parentElement).toHaveAttribute('data-layout', 'scroll');
});

it('provides a story without the optional title', () => {
  renderStory(WithoutTitle);
  expect(screen.queryByText('Adjustable Surface')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run story tests and verify RED**

Run:

```bash
PATH="/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH" npm test -- src/components/icons/ProtocolIconList/ProtocolIconList.stories.test.tsx
```

Expected: FAIL because `ProtocolIconList.stories.tsx` does not exist.

- [ ] **Step 3: Implement Storybook stories**

Create `Icons/ProtocolIconList` metadata with a centered dark preview and controls:

```tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ProtocolIconList } from './ProtocolIconList';

const variants = ['mcp', 'rest', 'graphql', 'grpc', 'jsonata', 'sse', 'sockets'] as const;

const meta = {
  title: 'Icons/ProtocolIconList',
  component: ProtocolIconList,
  parameters: { layout: 'centered', controls: { sort: 'none' } },
  argTypes: {
    variants: { control: 'object', table: { category: 'Content' } },
    title: { control: 'text', table: { category: 'Content' } },
    layout: {
      control: 'inline-radio',
      options: ['wrap', 'scroll'],
      table: { category: 'Layout' },
    },
    size: {
      control: { type: 'range', min: 16, max: 96, step: 1 },
      table: { category: 'Size' },
    },
  },
  args: {
    size: 48,
    layout: 'wrap',
    title: 'Adjustable Surface',
    variants,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(1100px, calc(100vw - 64px))' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProtocolIconList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Wrapped: Story = {};
export const Scrollable: Story = { args: { layout: 'scroll' } };
export const WithoutTitle: Story = { args: { title: undefined } };
```

- [ ] **Step 4: Run both focused files and verify GREEN**

Run:

```bash
PATH="/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH" npm test -- src/components/icons/ProtocolIconList/ProtocolIconList.test.tsx src/components/icons/ProtocolIconList/ProtocolIconList.stories.test.tsx
```

Expected: both test files PASS.

---

### Task 3: Verify responsive visuals and project health

**Files:**
- Inspect: `src/components/icons/ProtocolIconList/ProtocolIconList.tsx`
- Inspect: `src/components/icons/ProtocolIconList/ProtocolIconList.module.css`
- Inspect: `src/components/icons/ProtocolIconList/ProtocolIconList.stories.tsx`

**Interfaces:**
- Consumes: completed component and stories from Tasks 1–2.
- Produces: verified Storybook surface and project-wide regression evidence.

- [ ] **Step 1: Run the Impeccable detector once after final UI edits**

```bash
PATH="/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH" node /Users/arsenys/.codex/skills/impeccable/scripts/detect.mjs --target src/components/icons/ProtocolIconList
```

Expected: exit `0` with no findings.

- [ ] **Step 2: Inspect Storybook in one bounded browser pass**

Verify the `Wrapped` story at desktop and narrow widths, then the `Scrollable` story at a narrow width. Confirm:

- the title matches the reference’s green accent face, uppercase tracking, 56px rule, and 22px rule gap;
- caller order is unchanged;
- wrap mode produces additional rows without clipping names;
- scroll mode remains one row and its `scrollWidth` exceeds `clientWidth` at the narrow viewport;
- neither mode creates document-level horizontal overflow.

- [ ] **Step 3: Run complete verification**

Run independently:

```bash
PATH="/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH" npm test
PATH="/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH" npm run typecheck
PATH="/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH" npm run lint
PATH="/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH" npm run build-storybook
git diff --check
```

Expected: every command exits `0`; Vitest reports no failed files or tests; Storybook completes successfully.
