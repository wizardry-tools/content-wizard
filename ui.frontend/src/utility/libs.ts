/**
 * Does what the name says, extracts the name of a file/endpoint from a URL.
 * @param path
 */
export function getFileName(path: string): string | undefined {
  if (!path || typeof path === 'undefined') {
    return '';
  }
  return path.split('\\').pop()?.split('/').pop();
}

export function isFunction(functionToCheck: never): boolean {
  return typeof functionToCheck === 'function';
}

/**
 * Simple method that checks if a passed value is an Object or not.
 * @param value
 */
export function isPlainObject<T>(value: T): boolean {
  if (!value) {
    return false;
  }
  return Object.prototype.toString.call(value) === '[object Object]';
}

export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}
