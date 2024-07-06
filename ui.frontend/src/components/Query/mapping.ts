

/**
 * This is a helper function that takes a Mapped Object and Reverse the Values with the Keys.
 * This is needed when dealing with 'as const' Types, where the Values and Keys are not identical.
 * @param obj
 */
export function createReverseMapping<T extends Record<string, string>>(obj: T): Record<T[keyof T], keyof T> {
  const reverseMapping: Record<string, string> = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      reverseMapping[obj[key]] = key;
    }
  }
  return reverseMapping as Record<T[keyof T], keyof T>;
}