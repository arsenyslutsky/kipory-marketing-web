import { randomUUID } from 'node:crypto';
import { readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import ts from 'typescript';

import type {
  HomepagePresetArgs,
  HomepagePresetStoryId,
} from './homepagePresetContract.ts';

type Primitive = string | number | boolean;
type PresetEntry = { key: string; value: Primitive };
type HomepagePresetTarget = { relativePath: string; exportName: string };

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
  'ui-glowlink--current-nextjs-app': {
    relativePath: 'src/components/ui/GlowLink.presets.ts',
    exportName: 'glowLinkHomepageProps',
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

    return {
      key,
      value: readPrimitive(property.initializer),
    };
  });
}

function renderPresetObject(entries: PresetEntry[]): string {
  const properties = entries
    .map(({ key, value }) => {
      const serialized = typeof value === 'string'
        ? `'${JSON.stringify(value).slice(1, -1).replaceAll("'", "\\'").replaceAll('\\"', '"')}'`
        : String(value);
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
  const existingValues = new Map(entries.map(({ key, value }) => [key, value]));

  for (const [key, value] of Object.entries(args)) {
    if (!existingValues.has(key)) {
      throw new HomepagePresetSourceError(`Unknown preset property ${key}.`);
    }
    if (!['string', 'number', 'boolean'].includes(typeof value)) {
      throw new HomepagePresetSourceError(
        `Preset property ${key} must be a string, finite number, or boolean.`,
      );
    }
    if (typeof value === 'number' && !Number.isFinite(value)) {
      throw new HomepagePresetSourceError(`Preset property ${key} must be finite.`);
    }

    const currentValue = existingValues.get(key);
    if (typeof value !== typeof currentValue) {
      throw new HomepagePresetSourceError(
        `Preset property ${key} must remain a ${typeof currentValue}.`,
      );
    }
  }

  const merged = entries.map((entry) => ({
    ...entry,
    value: entry.key in args ? (args[entry.key] as Primitive) : entry.value,
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
}
