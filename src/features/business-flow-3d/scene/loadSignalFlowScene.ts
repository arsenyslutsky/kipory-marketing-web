import type { createSignalFlowScene as CreateSignalFlowScene } from './createSignalFlowScene';

export async function loadSignalFlowSceneFactory(): Promise<typeof CreateSignalFlowScene> {
  const { createSignalFlowScene } = await import('./createSignalFlowScene');
  return createSignalFlowScene;
}
