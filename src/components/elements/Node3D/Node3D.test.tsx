import { render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { createNode3DScene } from './createNode3DScene';
import { Node3D } from './Node3D';

vi.mock('./createNode3DScene', () => ({
  createNode3DScene: vi.fn(() => ({ destroy: vi.fn() })),
}));

afterEach(() => {
  vi.mocked(createNode3DScene).mockClear();
});

it('forwards distinct icon fill and stroke colors to the standalone Node3D scene', () => {
  render(<Node3D iconColor="#123456" iconStrokeColor="#fedcba" />);

  expect(createNode3DScene).toHaveBeenCalledWith(expect.objectContaining({
    iconColor: '#123456',
    iconStrokeColor: '#fedcba',
  }));
});

it('keeps the standalone Node3D stroke color optional for legacy callers', () => {
  render(<Node3D iconColor="#123456" />);

  expect(createNode3DScene).toHaveBeenCalledWith(expect.objectContaining({
    iconColor: '#123456',
    iconStrokeColor: undefined,
  }));
});
