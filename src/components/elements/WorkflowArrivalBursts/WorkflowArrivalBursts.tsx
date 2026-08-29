'use client';

import { useImperativeHandle, useState, type CSSProperties, type Ref } from 'react';
import type { FlowLayer3DArrivalEvent } from '../FlowLayer3D';
import styles from './WorkflowArrivalBursts.module.css';

type BurstRecord = {
  key: string;
  point: readonly [number, number];
};

export type WorkflowArrivalBurstsHandle = {
  add: (event: FlowLayer3DArrivalEvent) => void;
  clear: () => void;
};

export type WorkflowArrivalBurstsProps = {
  active: boolean;
  color: string;
  fadeTime?: number;
  highlight: string;
  radius?: number;
  reducedMotion?: boolean;
  ref?: Ref<WorkflowArrivalBurstsHandle>;
  resetKey?: unknown;
  strength?: number;
};

type BurstState = {
  records: BurstRecord[];
  resetKey: unknown;
};

export function WorkflowArrivalBursts({
  active,
  color,
  fadeTime = 920,
  highlight,
  radius = 32,
  reducedMotion = false,
  ref,
  resetKey,
  strength = 1,
}: WorkflowArrivalBurstsProps) {
  const [state, setState] = useState<BurstState>({ records: [], resetKey });
  const records = active && !reducedMotion && state.resetKey === resetKey ? state.records : [];

  useImperativeHandle(ref, () => ({
    add(event) {
      if (!active || reducedMotion) return;
      const key = `${event.runId}:${event.generation}:${event.arrival.id}`;
      setState((current) => {
        const currentRecords = current.resetKey === resetKey ? current.records : [];
        return currentRecords.some((record) => record.key === key)
          ? current
          : {
            records: [...currentRecords, { key, point: event.arrival.point }],
            resetKey,
          };
      });
    },
    clear() {
      setState({ records: [], resetKey });
    },
  }), [active, reducedMotion, resetKey]);

  const layerStyle = {
    '--workflow-burst-color': color,
    '--workflow-burst-fade-time': `${Math.max(1, fadeTime)}ms`,
    '--workflow-burst-highlight': highlight,
    '--workflow-burst-radius': `${Math.max(0, radius)}px`,
    '--workflow-burst-strength': String(Math.max(0, strength)),
  } as CSSProperties;

  return (
    <div className={styles.layer} style={layerStyle} aria-hidden="true">
      <span className={styles.ambient} />
      {records.map((record) => (
        <span
          className={styles.burst}
          data-testid="arrival-burst"
          key={record.key}
          onAnimationEnd={() => {
            setState((current) => ({
              ...current,
              records: current.records.filter((item) => item.key !== record.key),
            }));
          }}
          style={{
            left: `${record.point[0] * 100}%`,
            top: `${record.point[1] * 100}%`,
          }}
        />
      ))}
    </div>
  );
}
