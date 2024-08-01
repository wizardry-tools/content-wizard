/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: Refactor this logic to avoid use of `any`
// disable the no-explicit-any rule for this file until the exported function is refactored.
/**
 * Provided a duration and a function, returns a new function which is called
 * `duration` milliseconds after the last call.
 */
export default function debounce<F extends (...args: any[]) => void>(duration: number, fn: F) {
  let timeout: number | null;
  return function (...args) {
    if (timeout) {
      window.clearTimeout(timeout);
    }
    timeout = window.setTimeout(() => {
      timeout = null;
      fn(...args);
    }, duration);
  } as F;
}
