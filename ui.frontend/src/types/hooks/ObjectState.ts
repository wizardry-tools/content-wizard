// handleUpdate
export type ObjectStateHandleUpdate<T> = (state: T) => void;
// arg()
export type ObjectStateUpdateCallback<T> = (state: T) => T;
export type ObjectStateOrCallback<T> = ObjectStateUpdateCallback<T> | T;
