import type { FieldConfigName, FieldsConfig, InputValue } from './Fields';

export type PredicateType = 'fulltext' | 'path' | 'type' | 'nodename' | 'property' | 'limit' | 'isLiveCopy' | null;

export type RawInjectCallback = (value: InputValue, prefix?: string) => string;
export type PredicateValidityCallback = (value: InputValue) => boolean;
export type ConfigInjectCallback = (fields: FieldsConfig) => string;

export type PredicateConfig = {
  readonly type: PredicateType;
  readonly raw?: string; // static predicate value
  readonly rawInject?: RawInjectCallback; // simple predicate based on string injection
  readonly valueRequired?: boolean;
  readonly operation?: string;
  readonly property?: string;
  readonly configInject?: ConfigInjectCallback; // relative property path for the query, uses a callback since some fields need dynamic definitions.
  readonly useConfig?: boolean;
  readonly isValid?: PredicateValidityCallback;
};

export type PredicatesConfig = Record<FieldConfigName, PredicateConfig>;
