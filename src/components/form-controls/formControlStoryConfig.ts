export const formControlVisualArgTypes = {
  padding: {
    control: { type: 'range', min: 0, max: 40, step: 1 },
    table: { category: 'Spacing' },
  },
  margin: {
    control: { type: 'range', min: 0, max: 40, step: 1 },
    table: { category: 'Spacing' },
  },
  horizontalPadding: {
    control: { type: 'range', min: 0, max: 40, step: 1 },
    table: { category: 'Spacing' },
  },
  horizontalMargin: {
    control: { type: 'range', min: 0, max: 40, step: 1 },
    table: { category: 'Spacing' },
  },
  fontSize: {
    control: { type: 'range', min: 10, max: 32, step: 1 },
    table: { category: 'Typography' },
  },
  backgroundColor: {
    control: 'color',
    table: { category: 'Surface' },
  },
  backgroundOpacity: {
    control: { type: 'range', min: 0, max: 1, step: 0.01 },
    table: { category: 'Surface' },
  },
  focusedBackgroundColor: {
    control: 'color',
    table: { category: 'Surface' },
  },
  focusedBackgroundOpacity: {
    control: { type: 'range', min: 0, max: 1, step: 0.01 },
    table: { category: 'Surface' },
  },
} as const;

export const formControlVisualArgs = {
  padding: 8,
  margin: 8,
  backgroundColor: '#0a0c0b24',
  backgroundOpacity: 1,
  focusedBackgroundColor: '#0a0c0b24',
  focusedBackgroundOpacity: 1,
} as const;

export {
  formControlCurrentNextjsAppProps as formControlCurrentNextjsAppArgs,
} from './presets';
