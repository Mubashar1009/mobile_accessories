"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Generic, reusable debounce wrapper for any callback — not specific to
 * product search. The argument list is captured as a tuple type parameter
 * (`TArgs`) rather than typing the callback itself, so a concrete
 * single-arg callback still infers cleanly under `strict: true` and call
 * sites keep full type-checking on the debounced function.
 */
export function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number
): (...args: TArgs) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: TArgs) => {
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
