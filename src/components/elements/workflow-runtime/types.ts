export type WorkflowLoadStrategy = 'eager' | 'near-viewport';

export type WorkflowActivityStrategy = 'always' | 'visible';

export type WorkflowRuntimeOptions = {
  activityStrategy?: WorkflowActivityStrategy;
  loadStrategy?: WorkflowLoadStrategy;
  preloadMargin?: string;
  resolutionScale?: 'display' | number;
};

export type WorkflowRuntimeState = {
  active: boolean;
  shouldInitialize: boolean;
};

export const workflowRuntimeDefaults = {
  activityStrategy: 'visible',
  loadStrategy: 'eager',
  preloadMargin: '600px 0px',
  resolutionScale: 'display',
} as const satisfies Required<WorkflowRuntimeOptions>;
