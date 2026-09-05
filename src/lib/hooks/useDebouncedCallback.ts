"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Generic, reusable debounce wrapper for any callback — not specific to
 * product search. `T`'s constraint uses `any[]` rather than `unknown[]`
 * purely to satisfy TypeScript's contravariant parameter check for a rest
 * signature (`unknown[]` rejects any concrete single-typed-arg callback
 * under `strict: true`); real call sites still get full type-checking via
 * `Parameters<T>`.
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}
