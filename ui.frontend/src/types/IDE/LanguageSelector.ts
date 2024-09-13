import type { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import type { API, QueryLanguage, Statement } from '@/types';

export type PersistedQuerySelectorProps = {
  /**
   * This is the AEM GraphQL API that has been selected.
   */
  api: API;
  /**
   * This callback will be called after a Persisted Query has been selected.
   * A string containing a Query statement will be passed to the callback.
   * @param statement string
   */
  onStatementChange: (statement: Statement) => void;
};

export type APISelectorProps = {
  /**
   * The list of APIs available to select from
   */
  APIs: API[];
  /**
   * If an API has already been selected, pass the Endpoint string
   * so that the selector can pre-populate
   */
  endpoint?: string;
  /**
   * Callback for when the user selects a new API.
   */
  onAPIChange: (event: SelectChangeEvent) => void;
};

export type GraphQLSelectorProps = Omit<APISelectorProps, 'endpoint'> & Partial<PersistedQuerySelectorProps>;

export type QueryLanguageSelectorProps = {
  language: QueryLanguage;
  onLanguageChange: (event: SelectChangeEvent) => void;
};
