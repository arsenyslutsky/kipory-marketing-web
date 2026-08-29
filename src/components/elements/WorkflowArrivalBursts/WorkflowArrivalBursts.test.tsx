import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import {
  WorkflowArrivalBursts,
  type WorkflowArrivalBurstsHandle,
} from './WorkflowArrivalBursts';

const arrival = {
  arrival: { id: 'node', point: [0.2, 0.5] as const, progress: 1 },
  generation: 1,
  runId: 'run',
  slot: 0,
};

it('renders arrivals only while active and clears them when paused', () => {
  const ref = createRef<WorkflowArrivalBurstsHandle>();
  const view = render(
    <WorkflowArrivalBursts ref={ref} active color="#44a040" highlight="#fff" />,
  );
  act(() => ref.current?.add(arrival));
  const burst = screen.getByTestId('arrival-burst');
  expect(burst).toHaveStyle({ left: '20%', top: '50%' });

  view.rerender(
    <WorkflowArrivalBursts ref={ref} active={false} color="#44a040" highlight="#fff" />,
  );
  act(() => ref.current?.clear());
  expect(screen.queryByTestId('arrival-burst')).not.toBeInTheDocument();

  view.rerender(
    <WorkflowArrivalBursts ref={ref} active color="#44a040" highlight="#fff" />,
  );
  expect(screen.queryByTestId('arrival-burst')).not.toBeInTheDocument();
  act(() => ref.current?.add({ ...arrival, generation: 2 }));
  fireEvent.animationEnd(screen.getByTestId('arrival-burst'));
  expect(screen.queryByTestId('arrival-burst')).not.toBeInTheDocument();
});

it('uses one static ambient layer and no moving filter or blend effects', () => {
  const css = readFileSync(
    'src/components/elements/WorkflowArrivalBursts/WorkflowArrivalBursts.module.css',
    'utf8',
  );
  expect(css).not.toContain('drop-shadow');
  expect(css).not.toContain('mix-blend-mode');
  expect(css.match(/\.ambient\s*\{/g)).toHaveLength(1);
});
