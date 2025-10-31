import { useCallback, useRef } from 'react';

export function useDebouncedCallback<TArgs extends unknown[]>(fn: (...args: TArgs) => void, delayMs: number) {
  const timerRef = useRef<number | null>(null);
  const lastArgsRef = useRef<TArgs | null>(null);

  return useCallback((...args: TArgs) => {
    lastArgsRef.current = args;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (lastArgsRef.current) fn(...lastArgsRef.current);
      lastArgsRef.current = null;
      timerRef.current = null;
    }, delayMs);
  }, [fn, delayMs]);
}


