import { randomUUID } from 'node:crypto';
import { readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import ts from 'typescript';

import type {
  HomepagePresetArgs,
  HomepagePresetStoryId,
} from './homepagePresetContract.ts';

type Primitive = string | number | boolean;
type PresetValue = Primitive | Primitive[];
type PresetEntry =
  | { key: string; value: PresetValue }
  | { expression: string; key: string };
type HomepagePresetTarget = { relativePath: string; exportName: string };

const presetSaveQueues = new Map<string, Promise<void>>();

const HOMEPAGE_PRESET_TARGETS: Record<HomepagePresetStoryId, HomepagePresetTarget> = {
  'animated-illustrations-businessflow3d--current-nextjs-app': {
    relativePath: 'src/features/business-flow-3d/presets.ts',
    exportName: 'businessFlow3DHomepageProps',
  },
  'animated-illustrations-businessflowvertical--current-nextjs-app': {
    relativePath: 'src/features/business-flow-vertical/presets.ts',
    exportName: 'businessFlowVerticalHomepageProps',
  },
  'animated-illustrations-businessflowhorizontal--current-nextjs-app': {
    relativePath: 'src/features/business-flow-horizontal/presets.ts',
    exportName: 'businessFlowHorizontalHomepageProps',
  },
  'animated-illustrations-businesscorenodeflow--current-nextjs-app': {
    relativePath: 'src/features/business-core-node-flow/presets.ts',
    exportName: 'businessCoreNodeFlowContactProps',
  },
  'animated-illustrations-businesscorenodeflow--current-nextjs-app-2': {
    relativePath: 'src/features/business-core-node-flow/presets.ts',
    exportName: 'businessCoreNodeFlowWaitlistProps',
  },
  'ui-glowlink--current-nextjs-app': {
    relativePath: 'src/components/ui/GlowLink.presets.ts',
    exportName: 'glowLinkHomepageProps',
  },
  'marketing-sitecontainer--current-nextjs-app': {
    relativePath: 'src/components/marketing/presets.ts',
    exportName: 'siteContainerHomepageProps',
  },
  'marketing-section--current-nextjs-app': {
    relativePath: 'src/components/marketing/presets.ts',
    exportName: 'marketingSectionHomepageProps',
  },
  'marketing-splitlayout--current-nextjs-app': {
    relativePath: 'src/components/marketing/presets.ts',
    exportName: 'splitLayoutHomepageProps',
  },
  'marketing-pagehero--current-nextjs-app': {
    relativePath: 'src/components/marketing/presets.ts',
    exportName: 'pageHeroHomepageProps',
  },
  'marketing-sectionheader--current-nextjs-app': {
    relativePath: 'src/components/marketing/presets.ts',
    exportName: 'sectionHeaderHomepageProps',
  },
  'marketing-numberedrow--current-nextjs-app': {
    relativePath: 'src/components/marketing/presets.ts',
    exportName: 'numberedRowHomepageProps',
  },
  'marketing-formfield--current-nextjs-app': {
    relativePath: 'src/components/marketing/presets.ts',
    exportName: 'formFieldHomepageProps',
  },
  'icons-protocoliconlist--current-nextjs-app': {
    relativePath: 'src/components/icons/ProtocolIconList/presets.ts',
    exportName: 'protocolIconListHomepageProps',
  },
};

export class HomepagePresetSourceError extends Error {}

export function getHomepagePresetTarget(
  storyId: HomepagePresetStoryId,
): HomepagePresetTarget {
  return { ...HOMEPAGE_PRESET_TARGETS[storyId] };
}

function readPropertyName(name: ts.PropertyName): string {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) {
    return name.text;
  }

  throw new HomepagePresetSourceError('Preset properties must use a static property name.');
}

function readPrimitive(node: ts.Expression): Primitive {
  if (ts.isStringLiteral(node)) {
    return node.text;
  }
  if (ts.isNumericLiteral(node)) {
    const value = Number(node.text);
    if (!Number.isFinite(value)) {
      throw new HomepagePresetSourceError('Preset numbers must be finite.');
    }
    return value;
  }
  if (
    ts.isPrefixUnaryExpression(node) &&
    node.operator === ts.SyntaxKind.MinusToken &&
    ts.isNumericLiteral(node.operand)
  ) {
    const value = -Number(node.operand.text);
    if (!Number.isFinite(value)) {
      throw new HomepagePresetSourceError('Preset numbers must be finite.');
    }
    return value;
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  }
  if (node.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  }

  throw new HomepagePresetSourceError('Preset values must be literal primitives.');
}

function readPresetValue(node: ts.Expression): PresetValue {
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((element) => {
      if (ts.isOmittedExpression(element) || ts.isSpreadElement(element)) {
        throw new HomepagePresetSourceError(
          'Preset arrays must contain only literal primitives.',
        );
      }
      return readPrimitive(element);
    });
  }

  return readPrimitive(node);
}

function readPresetEntries(object: ts.ObjectLiteralExpression): PresetEntry[] {
  const keys = new Set<string>();

  return object.properties.map((property) => {
    if (!ts.isPropertyAssignment(property)) {
      throw new HomepagePresetSourceError('Preset objects may contain only property assignments.');
    }

    const key = readPropertyName(property.name);
    if (keys.has(key)) {
      throw new HomepagePresetSourceError(`Preset contains duplicate property ${key}.`);
    }
    keys.add(key);

    if (ts.isPropertyAccessExpression(property.initializer)) {
      return { expression: property.initializer.getText(), key };
    }

    return { key, value: readPresetValue(property.initializer) };
  });
}

function renderPrimitive(value: Primitive): string {
  return typeof value === 'string'
    ? `'${JSON.stringify(value).slice(1, -1).replaceAll("'", "\\'").replaceAll('\\"', '"')}'`
    : String(value);
}

function renderPresetObject(entries: PresetEntry[]): string {
  const properties = entries
    .map((entry) => {
      const { key } = entry;
      if ('expression' in entry) {
        return `  ${key}: ${entry.expression},`;
      }

      const { value } = entry;
      const serialized = Array.isArray(value)
        ? `[${value.map(renderPrimitive).join(', ')}]`
        : renderPrimitive(value);
      return `  ${key}: ${serialized},`;
    })
    .join('\n');

  return `{\n${properties}\n}`;
}

function findPresetObject(
  sourceFile: ts.SourceFile,
  exportName: string,
): ts.ObjectLiteralExpression {
  const declarations: ts.VariableDeclaration[] = [];

  for (const statement of sourceFile.statements) {
    if (
      !ts.isVariableStatement(statement) ||
      !statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      continue;
    }

    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === exportName) {
        declarations.push(declaration);
      }
    }
  }

  if (declarations.length !== 1) {
    throw new HomepagePresetSourceError(
      `Expected exactly one exported preset named ${exportName}.`,
    );
  }

  const initializer = declarations[0].initializer;
  const expression = initializer && ts.isSatisfiesExpression(initializer)
    ? initializer.expression
    : initializer;

  if (!expression || !ts.isObjectLiteralExpression(expression)) {
    throw new HomepagePresetSourceError(`Preset ${exportName} must use an object literal.`);
  }

  return expression;
}

export function rewriteHomepagePresetSource(
  source: string,
  exportName: string,
  args: HomepagePresetArgs,
): string {
  const sourceFile = ts.createSourceFile(
    'preset.ts',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const object = findPresetObject(sourceFile, exportName);
  const entries = readPresetEntries(object);
  const existingEntries = new Map(entries.map((entry) => [entry.key, entry]));

  for (const [key, value] of Object.entries(args)) {
    if (!existingEntries.has(key)) {
      throw new HomepagePresetSourceError(`Unknown preset property ${key}.`);
    }
    if (Array.isArray(value)) {
      if (!value.every((item) => (
        typeof item === 'string' ||
        typeof item === 'boolean' ||
        (typeof item === 'number' && Number.isFinite(item))
      ))) {
        throw new HomepagePresetSourceError(
          `Preset property ${key} arrays may contain only strings, finite numbers, or booleans.`,
        );
      }
    } else if (!['string', 'number', 'boolean'].includes(typeof value)) {
      throw new HomepagePresetSourceError(
        `Preset property ${key} must be a string, finite number, or boolean.`,
      );
    }
    if (typeof value === 'number' && !Number.isFinite(value)) {
      throw new HomepagePresetSourceError(`Preset property ${key} must be finite.`);
    }

    const currentEntry = existingEntries.get(key);
    if (!currentEntry || 'expression' in currentEntry) {
      continue;
    }

    const currentValue = currentEntry.value;
    if (Array.isArray(value) !== Array.isArray(currentValue)) {
      const expectedType = Array.isArray(currentValue) ? 'array' : typeof currentValue;
      throw new HomepagePresetSourceError(
        `Preset property ${key} must remain a ${expectedType}.`,
      );
    }
    if (!Array.isArray(value) && typeof value !== typeof currentValue) {
      throw new HomepagePresetSourceError(
        `Preset property ${key} must remain a ${typeof currentValue}.`,
      );
    }
  }

  const merged = entries.map((entry) => ({
    ...(entry.key in args ? { key: entry.key, value: args[entry.key] as PresetValue } : entry),
  }));

  return `${source.slice(0, object.getStart(sourceFile))}${renderPresetObject(merged)}${source.slice(object.getEnd())}`;
}

export async function saveHomepagePreset(
  projectRoot: string,
  storyId: HomepagePresetStoryId,
  args: HomepagePresetArgs,
): Promise<void> {
  const target = getHomepagePresetTarget(storyId);
  const targetPath = resolve(projectRoot, target.relativePath);
  const previousSave = presetSaveQueues.get(targetPath) ?? Promise.resolve();
  const currentSave = previousSave.catch(() => undefined).then(async () => {
    const source = await readFile(targetPath, 'utf8');
    const updatedSource = rewriteHomepagePresetSource(source, target.exportName, args);
    const temporaryPath = `${targetPath}.${process.pid}-${randomUUID()}.tmp`;

    try {
      await writeFile(temporaryPath, updatedSource, 'utf8');
      await rename(temporaryPath, targetPath);
    } catch (error) {
      await unlink(temporaryPath).catch(() => undefined);
      throw error;
    }
  });

  presetSaveQueues.set(targetPath, currentSave);

  try {
    await currentSave;
  } finally {
    if (presetSaveQueues.get(targetPath) === currentSave) {
      presetSaveQueues.delete(targetPath);
    }
  }
}
