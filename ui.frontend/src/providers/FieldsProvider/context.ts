import { createContext, useContext } from 'react';
import type { Dispatch } from 'react';
import type { DateRange, FieldConfigAction, FieldsConfig, InputValue, PredicateConfig } from '@/types';
import { predicates } from '@/components/QueryWizard/Components';

export const FieldsConfigContext = createContext<FieldsConfig>(null!);
export const FieldConfigDispatchContext = createContext<Dispatch<FieldConfigAction>>(null!);

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
export function fieldConfigReducer(fields: FieldsConfig, action: FieldConfigAction): FieldsConfig {
  switch (action.type) {
    case 'UPDATE_VALUE': {
      const key = action.name;
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
      throw Error(`Unknown Query Filter Action ${action.type as string}`);
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

  if (dateRange.upperBound ?? dateRange.lowerBound) {
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
  if ((property ?? predicate.useConfig) && value && !(dateRange.upperBound ?? dateRange.lowerBound)) {
    // don't render value if dateRange is populated.
    predicateString += `${prefix}property.value=${value as string}\n`;
  }
  if ((property ?? predicate.useConfig) && value && operation) {
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
      if (!field.isDisabled?.(fields) && predicate.isValid?.(value)) {
        if (predicate.raw) {
          // if raw, nothing to build, return the raw statement
          return predicate.raw + '\n';
        }
        // property strings, configInject functions, and operation strings require predicate statements to have an indexed prefix
        if (predicate.property ?? predicate.configInject ?? predicate.operation) {
          const predicateStatement = buildPredicateStatement(value, predicate, fields, propCounter);
          if (predicateStatement && predicate.type === 'property') {
            // only increment if a statement was returned.
            propCounter++;
          }
          return predicateStatement;
        } else {
          return buildPredicateStatement(value, predicate, fields);
        }
      }
      return '';
    })
    .filter((statement) => !!statement && statement !== '')
    .join('');
};
