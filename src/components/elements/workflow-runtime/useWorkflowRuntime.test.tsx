import { act, renderHook } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWorkflowRuntime } from './useWorkflowRuntime';

type ObserverRecord = {
  callback: IntersectionObserverCallback;
  disconnect: () => void;
  observed: Element[];
  rootMargin: string;
};

const observers: ObserverRecord[] = [];

function emit(record: ObserverRecord, target: Element, isIntersecting: boolean) {
  record.callback([{
    boundingClientRect: target.getBoundingClientRect(),
    intersectionRatio: isIntersecting ? 1 : 0,
    intersectionRect: target.getBoundingClientRect(),
    isIntersecting,
    rootBounds: null,
    target,
    time: 0,
  }], {} as IntersectionObserver);
}

describe('useWorkflowRuntime', () => {
  beforeEach(() => {
    observers.length = 0;
    vi.stubGlobal('IntersectionObserver', class {
      readonly root = null;
      readonly thresholds = [0];
      readonly rootMargin: string;
      private readonly record: ObserverRecord;

      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        this.rootMargin = options?.rootMargin ?? '0px';
        this.record = {
          callback,
          disconnect: vi.fn(),
          observed: [],
          rootMargin: this.rootMargin,
        };
        observers.push(this.record);
      }

      observe = (target: Element) => this.record.observed.push(target);
      disconnect = () => this.record.disconnect();
      takeRecords = () => [];
      unobserve = vi.fn();
    });
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('initializes near the viewport and activates only in the real viewport', () => {
    const element = document.createElement('div');
    const ref = createRef<HTMLDivElement>();
    ref.current = element;
    const { result } = renderHook(() => useWorkflowRuntime(ref, {
      activityStrategy: 'visible',
      loadStrategy: 'near-viewport',
      preloadMargin: '600px 0px',
    }));

    expect(result.current).toEqual({ active: false, shouldInitialize: false });
    expect(observers.map(({ rootMargin }) => rootMargin)).toEqual(['600px 0px', '0px']);

    act(() => emit(observers[0], element, true));
    expect(result.current).toEqual({ active: false, shouldInitialize: true });

    act(() => emit(observers[1], element, true));
    expect(result.current).toEqual({ active: true, shouldInitialize: true });

    act(() => emit(observers[1], element, false));
    expect(result.current).toEqual({ active: false, shouldInitialize: true });
  });

  it('initializes eagerly but still waits for real visibility before activating', () => {
    const ref = createRef<HTMLDivElement>();
    ref.current = document.createElement('div');
    const { result } = renderHook(() => useWorkflowRuntime(ref, { loadStrategy: 'eager' }));

    expect(result.current).toEqual({ active: false, shouldInitialize: true });
    expect(observers).toHaveLength(1);

    act(() => emit(observers[0], ref.current!, true));
    expect(result.current.active).toBe(true);
  });

  it('keeps an initialized always-active runtime independent of intersection', () => {
    const ref = createRef<HTMLDivElement>();
    ref.current = document.createElement('div');
    const { result } = renderHook(() => useWorkflowRuntime(ref, {
      activityStrategy: 'always',
      loadStrategy: 'eager',
    }));

    expect(result.current).toEqual({ active: true, shouldInitialize: true });
    expect(observers).toHaveLength(0);
  });

  it('pauses and resumes active work with document visibility', () => {
    const ref = createRef<HTMLDivElement>();
    ref.current = document.createElement('div');
    const { result } = renderHook(() => useWorkflowRuntime(ref, { activityStrategy: 'always' }));

    expect(result.current.active).toBe(true);
    act(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current.active).toBe(false);

    act(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current.active).toBe(true);
  });

  it('disconnects every observer during cleanup', () => {
    const ref = createRef<HTMLDivElement>();
    ref.current = document.createElement('div');
    const view = renderHook(() => useWorkflowRuntime(ref, { loadStrategy: 'near-viewport' }));

    view.unmount();

    expect(observers).toHaveLength(2);
    observers.forEach(({ disconnect }) => expect(disconnect).toHaveBeenCalledOnce());
  });

  it('falls back to immediate initialization and activity without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const ref = createRef<HTMLDivElement>();
    ref.current = document.createElement('div');
    const { result } = renderHook(() => useWorkflowRuntime(ref, {
      loadStrategy: 'near-viewport',
    }));

    expect(result.current).toEqual({ active: true, shouldInitialize: true });
  });
});
