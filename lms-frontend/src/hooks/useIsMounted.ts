'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Modern React 19 hook to detect client hydration without cascading renders.
 * Guarantees server snapshot matches client hydration snapshot (false),
 * then transitions safely to true on the client.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default useIsMounted;

