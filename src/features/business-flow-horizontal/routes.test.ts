import { expect, it } from 'vitest';
import {
  businessFlowHorizontalPaths,
  createBusinessFlowHorizontalBeamSource,
} from './routes';

it('preserves twelve connectors and the off-canvas entry', () => {
  expect(businessFlowHorizontalPaths).toHaveLength(12);
  expect(businessFlowHorizontalPaths[0]).toMatchObject({
    id: 'aux-top',
    points: [
      [324 / 320, 244 / 608], [302 / 320, 244 / 608],
      [302 / 320, 282 / 608], [282 / 320, 282 / 608], [248 / 320, 304 / 608],
    ],
  });
  expect(businessFlowHorizontalPaths.at(-1)?.id).toBe('relay-bottom-terminal-2');
});

it('fades only the off-canvas auxiliary connectors toward the collector', () => {
  expect(
    businessFlowHorizontalPaths
      .filter((path) => path.fading)
      .map((path) => ({
        end: path.points.at(-1),
        id: path.id,
        start: path.points[0],
      })),
  ).toEqual([
    {
      end: [248 / 320, 304 / 608],
      id: 'aux-top',
      start: [324 / 320, 244 / 608],
    },
    {
      end: [248 / 320, 304 / 608],
      id: 'aux-middle',
      start: [324 / 320, 304 / 608],
    },
    {
      end: [248 / 320, 304 / 608],
      id: 'aux-bottom',
      start: [324 / 320, 364 / 608],
    },
  ]);
});

it('extends every attached connector beneath the center of its item', () => {
  const endpoints = Object.fromEntries(businessFlowHorizontalPaths.map((path) => [
    path.id,
    [path.points[0], path.points.at(-1)],
  ]));

  expect(endpoints).toEqual({
    'aux-top': [[324 / 320, 244 / 608], [248 / 320, 304 / 608]],
    'aux-middle': [[324 / 320, 304 / 608], [248 / 320, 304 / 608]],
    'aux-bottom': [[324 / 320, 364 / 608], [248 / 320, 304 / 608]],
    'collector-relay-top': [[248 / 320, 304 / 608], [143 / 320, 107 / 608]],
    'collector-relay-middle': [[248 / 320, 304 / 608], [143 / 320, 304 / 608]],
    'collector-relay-bottom': [[248 / 320, 304 / 608], [143 / 320, 501 / 608]],
    'relay-top-terminal-1': [[143 / 320, 107 / 608], [37 / 320, 59 / 608]],
    'relay-top-terminal-2': [[143 / 320, 107 / 608], [37 / 320, 155 / 608]],
    'relay-middle-terminal-1': [[143 / 320, 304 / 608], [37 / 320, 251 / 608]],
    'relay-middle-terminal-2': [[143 / 320, 304 / 608], [37 / 320, 357 / 608]],
    'relay-bottom-terminal-1': [[143 / 320, 501 / 608], [37 / 320, 453 / 608]],
    'relay-bottom-terminal-2': [[143 / 320, 501 / 608], [37 / 320, 549 / 608]],
  });
});

it('preserves staggering and scales the cycle by speed', () => {
  const source = createBusinessFlowHorizontalBeamSource(2);
  expect(source.slots).toBe(12);
  expect(source.next(0, 0)).toMatchObject({ id: 'aux-top:0', delayMs: 0, durationMs: 312 });
  expect(source.next(1, 0)?.delayMs).toBe(50);
  expect(source.next(0, 1)?.delayMs).toBe(2288);
});
