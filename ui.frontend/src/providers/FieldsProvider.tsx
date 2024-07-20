import { createContext, Dispatch, PropsWithChildren, useContext, useEffect, useReducer, useRef } from 'react';
import {
  DateRange,
  defaultFields,
  FieldConfigAction,
  FieldConfigNameKey,
  FieldsConfig,
  InputValue,
  PredicateConfig,
  predicates,
  predicateTypes,
} from 'src/components/QueryWizard/Components';
import { useQueryDispatcher } from './QueryProvider';
import { endpoints, Query, QueryLanguage } from 'src/components/Query';
import { useLogger } from './LoggingProvider';
import { useDebounce } from 'src/utility';

const FieldsConfigContext = createContext<FieldsConfig>(null!);
const FieldConfigDispatchContext = createContext<Dispatch<FieldConfigAction>>(null!);

export type FieldsProviderProps = PropsWithChildren & Partial<Query>;

/**
 * This Provider is responsible for handling Field Dispatching and re-building the QueryWizard's
 * QueryBuilder statement anytime the QueryWizard fields are updated.
 * @param children
 * @constructor
 */
export function FieldsProvider({ children }: FieldsProviderProps) {
  // use a Ref instead of a hook, so that the main effect isn't running more than it should.
  const renderCount = useRef(0);
  const logger = useLogger();
  logger.debug({ message: `FieldsProvider[${++renderCount.current}] render()` });
  const queryDispatcher = useQueryDispatcher();
  const [fields, configDispatcher] = useReducer(fieldConfigReducer, defaultFields);
  const debouncedFields = useDebounce(fields, 250);

  /**
   * The purpose of this useEffect is to rebuild the Query statement when the
   * fields are updated, but with a debounce, to improve performance.
   */
  useEffect(() => {
    logger.debug({ message: `FieldsProvider[${renderCount.current}] useEffect()` });
    if (renderCount.current === 1) {
      // avoid building on first render, let the QueryProvider provide default statement,
      // so that the editors and storage are not out of sync
      return;
    }
    const statement = generateQuery(debouncedFields);
    logger.debug({ message: `FieldsProvider[${renderCount.current}] useEffect() timeout`, statement });
    // dispatch the query with static QueryBuilder values
    queryDispatcher({
      statement,
      language: QueryLanguage.QueryBuilder,
      url: endpoints.queryBuilderPath,
      status: '',
      isAdvanced: false,
      type: 'replaceQuery',
      caller: FieldsProvider,
    });
  }, [debouncedFields, logger, queryDispatcher]);

  return (
    <FieldsConfigContext.Provider value={fields}>
      <FieldConfigDispatchContext.Provider value={configDispatcher}>{children}</FieldConfigDispatchContext.Provider>
    </FieldsConfigContext.Provider>
  );
}

export function useFields() {
  return useContext(FieldsConfigContext);
}

export function useFieldDispatcher() {
  return useContext(FieldConfigDispatchContext);
}

/**
 * QueryFilter Actions???
 * 1. Update field
 * @param fields
 * @param action
 */
function fieldConfigReducer(fields: FieldsConfig, action: FieldConfigAction): FieldsConfig {
  switch (action.type) {
    case 'UPDATE_VALUE': {
      const key = action.name as FieldConfigNameKey;
      const oldField = fields[key];
      const updatedField = {
        ...oldField,
        value: action.value,
      };
      return {
        ...fields,
        [key]: updatedField,
      };
    }
    default: {
      throw Error(`Unknown Query Filter Action ${action.type}`);
    }
  }
}

/**
 * This method takes an InputValue, a PredicateConfig, the entire FieldsConfig,
 * with an optional index, and produces a single QueryBuilder Predicate Statement.
 * @param value
 * @param predicate
 * @param fields
 * @param index
 */
function buildPredicateStatement(value: InputValue, predicate: PredicateConfig, fields: FieldsConfig, index?: number) {
  const dateRange = value as DateRange;
  const { rawInject, property, configInject, operation } = { ...predicate };

  // 1_, 2_, ...
  let prefix = index ? `${index}_` : '';

  if (rawInject && value) {
    const injected = rawInject(value, prefix);
    if (injected) {
      return injected;
    }
  }

  if (dateRange.upperBound || dateRange.lowerBound) {
    prefix = `${prefix}daterange.`;
  }

  let predicateString = '';

  // initial property definition required before appending a value statement
  if (configInject && predicate.useConfig) {
    predicateString += `${prefix}property=${configInject(fields)}\n`;
  } else if (property) {
    predicateString += `${prefix}property=${property}\n`;
  }

  if (!predicateString) {
    // predicateString didn't populate above, need to exit with empty string
    return '';
  }
  // different types of value statements.
  if ((property || predicate.useConfig) && value && !(dateRange.upperBound || dateRange.lowerBound)) {
    // don't render value if dateRange is populated.
    predicateString += `${prefix}property.value=${value}\n`;
  }
  if ((property || predicate.useConfig) && value && operation) {
    //need value for checkbox true/false operations
    predicateString += `${prefix}property.operation=${operation}\n`;
  }

  if (dateRange?.lowerBound) {
    predicateString += `${prefix}lowerBound=${dateRange.lowerBound.format()}\n`;
  }
  if (dateRange?.upperBound) {
    predicateString += `${prefix}upperBound=${dateRange.upperBound.format()}\n`;
  }
  return predicateString;
}

/**
 * This method takes a FieldsConfig and loops through it, checking the
 * validity of the field's value and predicate requirements, and provides
 * a full QueryBuilder Query Statement.
 * @param fields
 */
export const generateQuery = (fields: FieldsConfig): string => {
  let propCounter = 1;
  return Object.values(fields || {})
    .map((field) => {
      const value = field.value;
      const predicate = predicates[field.name];
      // check validity of the predicate against the corresponding field value
      // also don't process disabled fields
      if ((!field.isDisabled || !field.isDisabled(fields)) && predicate.isValid && predicate.isValid(value)) {
        if (predicate.raw) {
          // if raw, nothing to build, return the raw statement
          return predicate.raw;
        }
        // property strings, configInject functions, and operation strings require predicate statements to have an indexed prefix
        if (predicate.property || predicate.configInject || predicate.operation) {
          const predicateStatement = buildPredicateStatement(value, predicate, fields, propCounter);
          if (predicateStatement && predicate.type === predicateTypes.property) {
            // only increment if a statement was returned.
            propCounter++;
          }
          return predicateStatement;
        } else {
          return buildPredicateStatement(value, predicate, fields);
        }
      } else {
      }
      return '';
    })
    .filter((statement) => !!statement && statement !== '')
    .join('');
};
