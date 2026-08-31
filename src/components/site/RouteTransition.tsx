import * as React from 'react';
import { cloneElement, type ReactElement } from 'react';

type RouteTransitionChild = ReactElement<{
  'data-route-transition'?: string;
}>;

export function RouteTransition({ children }: { children: RouteTransitionChild }) {
  const participant = cloneElement(children, {
    'data-route-transition': 'quiet-signal',
  });
  const ViewTransition = React.ViewTransition;

  if (!ViewTransition) return participant;

  return (
    <ViewTransition default="none" enter="route-enter" exit="route-exit">
      {participant}
    </ViewTransition>
  );
}
