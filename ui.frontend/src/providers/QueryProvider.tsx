import {
  createContext,
  Dispatch,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { DYNAMIC_HEADERS, getParams } from 'src/utility';
import {
  buildGraphQLURL,
  buildQueryString,
  endpoints,
  Query,
  QueryAction,
  QueryLanguage,
  QueryLanguageKey,
  QueryResponse,
  Statement,
} from 'src/components/Query';
import { useStorageContext, API } from 'src/components/IDE/core/src';

import {
  DateRange,
  FieldConfigAction,
  FieldConfigNameKey,
  fields as defaultFields,
  FieldsConfig,
  InputValue,
  PredicateConfig,
  predicates,
  predicateTypes,
} from 'src/components/QueryWizard/Components';

const QueryContext = createContext<Query>(null!);
const QueryDispatchContext = createContext<Dispatch<QueryAction>>(null!);
const FieldsConfigContext = createContext<FieldsConfig>(null!);
const FieldConfigDispatchContext = createContext<Dispatch<FieldConfigAction>>(null!);
const QueryRunnerContext = createContext<(query: Query) => Promise<QueryResponse>>(null!);
const IsGraphQLContext = createContext<boolean>(false);

const defaultSimpleQuery: Query = {
  statement: '', // build inside provider init
  language: QueryLanguage.QueryBuilder,
  url: endpoints.queryBuilderPath,
  status: '',
  isAdvanced: false,
};

export function QueryProvider({ children }: PropsWithChildren) {
  useStorageContext();
  //const predicateService = useMemo(()=>new PredicateService(defaultQueryFilters),[]);

  const [fields, configDispatch] = useReducer(fieldConfigReducer, defaultFields);
  const [query, queryDispatch] = useReducer(queryReducer, {
    ...defaultSimpleQuery,
    statement: generateQuery(fields),
  });

  /**
   * This boolean will toggle features on/off for the IDE,
   * since the IDE was originally written for GraphQL.
   */
  const isGraphQL = useMemo(() => query.language === (QueryLanguage.GraphQL as QueryLanguageKey), [query.language]);

  const rebuildQuery = useCallback(() => {
    const statement = generateQuery(fields);
    queryDispatch({
      ...defaultSimpleQuery,
      statement: statement,
      type: 'replaceQuery',
    });
  }, [fields]);

  const queryRunner = useCallback(
    async (query: Query): Promise<QueryResponse> => {
      const url = query.url + buildQueryString(query);
      // prechecks
      if (!url) {
        return {
          results: [],
          status: 'Refusing to query with empty URL',
          query,
        };
      }
      let params = isGraphQL ? getParams(query) : DYNAMIC_HEADERS;

      // flight
      try {
        let response = await fetch(url, params);
        if (response.ok) {
          let json = await response.json();
          return {
            results: json.hits || json.results || JSON.stringify(json.data),
            status: response.status,
            query,
          };
        }
      } catch (e) {
        console.error(e);
        return {
          results: null,
          status: `ERROR occurred while fetching results: ${e}`,
          query,
        };
      }
      // default
      return {
        results: null,
        status: `Failed to fetch results`,
        query,
      };
    },
    [isGraphQL],
  );

  useEffect(rebuildQuery, [fields, rebuildQuery]);

  return (
    <QueryContext.Provider value={query}>
      <IsGraphQLContext.Provider value={isGraphQL}>
        <QueryDispatchContext.Provider value={queryDispatch}>
          <FieldsConfigContext.Provider value={fields}>
            <FieldConfigDispatchContext.Provider value={configDispatch}>
              <QueryRunnerContext.Provider value={queryRunner}>{children}</QueryRunnerContext.Provider>
            </FieldConfigDispatchContext.Provider>
          </FieldsConfigContext.Provider>
        </QueryDispatchContext.Provider>
      </IsGraphQLContext.Provider>
    </QueryContext.Provider>
  );
}

export function useQuery() {
  return useContext(QueryContext);
}

export function useQueryDispatch() {
  return useContext(QueryDispatchContext);
}

export function useFields() {
  return useContext(FieldsConfigContext);
}

export function useFieldDispatch() {
  return useContext(FieldConfigDispatchContext);
}

export function useQueryRunner() {
  return useContext(QueryRunnerContext);
}

export function useIsGraphQL() {
  return useContext(IsGraphQLContext);
}

/**
 * Query Actions???
 * 1. Update Statement
 * 2. Update Language (which replaces Query with defaultQuery based on language)
 * 3. Update Status
 * 4. Update API
 * @param query
 * @param action
 */
function queryReducer(query: Query, action: QueryAction): Query {
  switch (action.type) {
    case 'statementChange': {
      // 1
      return {
        ...query,
        statement: action.statement as Statement,
      };
    }
    case 'replaceQuery': {
      // 2
      return {
        ...(action as Query),
      };
    }
    case 'statusChange': {
      // 3
      return {
        ...query,
        status: action.status as string,
      };
    }
    case 'apiChange': {
      // 4
      const api = action.api as API;
      return {
        ...query,
        api: api,
        url: buildGraphQLURL(api.endpoint),
      };
    }
    default: {
      throw Error(`Unknown Query Action ${action.type}`);
    }
  }
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
const generateQuery = (fields: FieldsConfig): string => {
  let propCounter = 1;
  return Object.values(fields)
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
