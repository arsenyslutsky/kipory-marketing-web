import { readFileSync } from 'node:fs';
import path from 'node:path';
import { getRSCModuleInformation } from 'next/dist/build/analysis/get-page-static-info';
import { transformSync } from 'next/dist/build/swc';
import { getLoaderSWCOptions } from 'next/dist/build/swc/options';
import { expect, it } from 'vitest';

it('compiles the public horizontal component as a Next client boundary', () => {
  const projectRoot = process.cwd();
  const filename = path.join(
    projectRoot,
    'src/features/business-flow-horizontal/components/BusinessFlowHorizontal.tsx',
  );
  const source = readFileSync(filename, 'utf8');
  const options = getLoaderSWCOptions({
    appDir: path.join(projectRoot, 'src/app'),
    bundleLayer: 'rsc',
    cacheHandlers: undefined,
    compilerOptions: {},
    configDir: projectRoot,
    development: false,
    filename,
    hasReactRefresh: false,
    isCacheComponents: false,
    isPageFile: false,
    isServer: true,
    jsConfig: {},
    modularizeImports: undefined,
    optimizePackageImports: undefined,
    optimizeServerReact: false,
    pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
    relativeFilePathFromRoot: path.relative(projectRoot, filename),
    serverComponents: true,
    serverReferenceHashSalt: 'business-flow-horizontal-boundary-test',
    supportedBrowsers: undefined,
    swcCacheDir: path.join(projectRoot, '.next/cache/swc'),
    swcPlugins: [],
    taintEnabled: false,
    trackDynamicImports: false,
    useCacheEnabled: false,
  });

  const transformed = transformSync(source, { ...options, filename });
  const rsc = getRSCModuleInformation(transformed.code, true);

  expect(rsc).toMatchObject({
    clientRefs: expect.arrayContaining(['BusinessFlowHorizontal']),
    type: 'client',
  });
});
