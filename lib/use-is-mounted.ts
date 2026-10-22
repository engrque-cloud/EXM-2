'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Hydration-safe hook that returns true only after mounting on the client.
 * Uses React's standard useSyncExternalStore to avoid SSR mismatches
 * and avoid ESLint react-hooks/set-state-in-effect warnings.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}
