import { useEffect, useReducer, useRef } from 'react';
import type { FieldsProviderProps } from '@/types';
import { queryBuilderPath } from '@/constants';
import { useDebounce } from '@/utility';
import { defaultFields } from '@/components/QueryWizard/Components';
import { useQueryDispatcher } from '../QueryProvider';
import { useLogger } from '../LoggingProvider';
import { FieldConfigDispatchContext, fieldConfigReducer, FieldsConfigContext, generateQuery } from './context';

/**
 * This Provider is responsible for handling Field Dispatching and re-building the QueryWizard's
 * QueryBuilder statement anytime the QueryWizard fields are updated.
 * @param children
 * @constructor
 */
export const FieldsProvider = ({ children }: FieldsProviderProps) => {
  // use a Ref instead of a hook, so that the main effect isn't running more than it should.
  const renderCount = useRef(0);
  const logger = useLogger();
  logger.debug({ message: `FieldsProvider[${++renderCount.current}] render()` });
  const queryDispatcher = useQueryDispatcher();
  const [fields, configDispatcher] = useReducer(fieldConfigReducer, defaultFields);
  const debouncedFields = useDebounce(fields, 300);

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
      language: 'QueryBuilder',
      url: queryBuilderPath,
      status: '',
      isAdvanced: false,
      type: 'replaceQuery',
    });
  }, [debouncedFields, logger, queryDispatcher]);

  return (
    <FieldsConfigContext.Provider value={fields}>
      <FieldConfigDispatchContext.Provider value={configDispatcher}>{children}</FieldConfigDispatchContext.Provider>
    </FieldsConfigContext.Provider>
  );
};
