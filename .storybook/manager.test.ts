import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import ts from 'typescript';
import { expect, it } from 'vitest';

it('registers and renders the toolbar when the manager uses classic JSX', () => {
  const source = readFileSync(join(process.cwd(), '.storybook/manager.tsx'), 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.React,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  let registeredTool: { render: () => unknown } | undefined;
  const toolbar = () => null;
  const react = {
    createElement: (type: unknown, props: unknown) => ({ type, props }),
    useCallback: (callback: unknown) => callback,
  };
  const requireModule = (specifier: string) => {
    if (specifier === 'react') {
      return { __esModule: true, default: react };
    }
    if (specifier === 'storybook/manager-api') {
      return {
        addons: {
          register: (_id: string, register: () => void) => register(),
          add: (_id: string, tool: { render: () => unknown }) => {
            registeredTool = tool;
          },
        },
        types: { TOOL: 'tool' },
        useArgs: () => [{}],
        useArgTypes: () => ({}),
        useParameter: () => ({ keys: ['connectorOpacity'] }),
        useStorybookApi: () => ({
          getCurrentStoryData: () => ({ type: 'story', args: {} }),
          on: () => undefined,
          off: () => undefined,
        }),
        useStorybookState: () => ({
          storyId: 'animated-illustrations-businessflowhorizontal--current-nextjs-app',
          viewMode: 'story',
        }),
      };
    }
    if (specifier === 'storybook/internal/core-events') {
      return { STORY_ARGS_UPDATED: 'storyArgsUpdated' };
    }
    if (specifier === './HomepagePresetToolbar.tsx') {
      return { HomepagePresetToolbar: toolbar };
    }
    if (specifier === './homepagePresetContract.ts') {
      return { isHomepagePresetStoryId: () => true };
    }
    throw new Error(`Unexpected module ${specifier}`);
  };

  const execute = new Function('require', 'exports', output);
  execute(requireModule, {});

  expect(registeredTool).toBeDefined();
  expect(registeredTool?.render()).toMatchObject({
    type: toolbar,
    props: { presetKeys: ['connectorOpacity'] },
  });
});

it('renders the extracted toolbar when the manager uses classic JSX', () => {
  const source = readFileSync(
    join(process.cwd(), '.storybook/HomepagePresetToolbar.tsx'),
    'utf8',
  );
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.React,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const react = {
    createElement: (type: unknown, props: unknown, ...children: unknown[]) => ({
      type,
      props,
      children,
    }),
    Fragment: Symbol('Fragment'),
    useEffect: () => undefined,
    useMemo: (factory: () => unknown) => factory(),
    useRef: (value: unknown) => ({ current: value }),
    useState: (value: unknown) => [value, () => undefined],
  };
  const button = () => null;
  const requireModule = (specifier: string) => {
    if (specifier === 'react') {
      return react;
    }
    if (specifier === '@storybook/icons') {
      return { CopyIcon: () => null, SaveIcon: () => null };
    }
    if (specifier === 'storybook/internal/components') {
      return {
        Button: button,
        useCopyButton: () => ({
          buttonProps: { onClick: () => undefined, ariaLabel: 'Copy' },
          children: 'Copy JSON',
        }),
      };
    }
    if (specifier === './homepagePresetContract.ts') {
      return {
        createHomepagePresetCapabilityRequest: () => ({ url: '/capability', init: {} }),
        createHomepagePresetSaveRequest: () => ({ url: '/save', init: {} }),
        filterHomepagePresetArgs: (args: unknown) => args,
      };
    }
    throw new Error(`Unexpected module ${specifier}`);
  };
  const moduleExports: { HomepagePresetToolbar?: (props: object) => unknown } = {};
  const execute = new Function('require', 'exports', output);
  execute(requireModule, moduleExports);

  expect(() => moduleExports.HomepagePresetToolbar?.({
    storyId: 'animated-illustrations-businessflowhorizontal--current-nextjs-app',
    args: { connectorOpacity: 0.64 },
    argTypes: { connectorOpacity: {} },
    presetKeys: ['connectorOpacity'],
    fetcher: async () => Response.json({ available: true }),
  })).not.toThrow();
});
