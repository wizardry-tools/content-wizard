import { FormGrid } from 'src/components/QueryWizard/Components';
import {
  defaultAdvancedQueries,
  QueryLanguage,
  QueryLanguageKey,
  QueryLanguageLabels,
  Statement,
} from 'src/components/Query';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useLogger, useQuery, useQueryDispatcher } from 'src/providers';
import { memo, useCallback, useRef } from 'react';
import './language-selector.scss';
import { APISelector } from './APISelector';
import { API, useAPIContext } from '../api';
import { PersistedQuerySelector } from './PersistedQuerySelector';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';

/**
 * This is a custom Plugin for the Query IDE.
 * It's built similar to the DocExplorer and History Plugins.
 * It provides the IDE with the choice of 5 AEM supported languages.
 * When the user selects the GraphQL Language, the APISelect component
 * will render additional options for GraphQL.
 *
 * The {LanguageSelector} will unmount when the Plugin view is collapsed.
 * @constructor
 */
export const LanguageSelector = () => {
  const logger = useLogger();
  const renderCount = useRef(0);
  logger.debug({ message: `LanguageSelector[${++renderCount.current}] render()` });
  const { language, api } = useQuery();
  const queryDispatcher = useQueryDispatcher();
  const { APIs } = useAPIContext({
    nonNull: true,
    caller: LanguageSelector,
  });

  const handleStatementChange = useCallback(
    (statement: Statement) => {
      logger.debug({ message: `LanguageSelector[${renderCount.current}] statementChange()` });
      queryDispatcher({
        type: 'statementChange',
        statement,
        caller: LanguageSelector,
      });
    },
    [logger, queryDispatcher],
  );

  const handleLanguageChange = useCallback(
    (language: QueryLanguageKey) => {
      // reset the entire query on language change
      logger.debug({ message: `LanguageSelector[${renderCount.current}] replaceQuery()` });
      queryDispatcher({
        ...defaultAdvancedQueries[language],
        type: 'replaceQuery',
        caller: LanguageSelector,
      });
    },
    [logger, queryDispatcher],
  );

  const handleAPIChange = useCallback(
    (newAPI: API) => {
      logger.debug({ message: `LanguageSelector[${renderCount.current}] apiChange()` });
      queryDispatcher({
        type: 'apiChange',
        api: newAPI,
        caller: LanguageSelector,
      });
    },
    [logger, queryDispatcher],
  );

  const onAPIChange = useCallback(
    (event: SelectChangeEvent) => {
      const selectedEndpoint = event.target.value;
      // API was selected
      let foundAPI = APIs.find((api) => {
        return api.endpoint === selectedEndpoint;
      });
      if (foundAPI) {
        handleAPIChange(foundAPI);
      }
    },
    [APIs, handleAPIChange],
  );

  const onLanguageChange = useCallback(
    (event: SelectChangeEvent) => {
      const selectedLanguage = event.target.value as typeof language;
      handleLanguageChange(selectedLanguage);
    },
    [handleLanguageChange],
  );

  const LanguageSelectorHeader = memo(() => (
    <div className="wizard-language-selector-header">
      <div className="wizard-language-selector-header-content">
        <div className="wizard-language-selector-title">Language Selector</div>
      </div>
    </div>
  ));

  /**
   * This is a render function for the actual Dropdown field.
   */
  const QueryLanguageSelector = memo(() => {
    return (
      <FormGrid item xs={12} md={12}>
        <FormControl variant="filled" color="secondary" className="wizard-language-selector">
          <InputLabel id="query-language-label" required>
            Query Language
          </InputLabel>
          <Select
            labelId="query-language-label"
            id="query-language"
            name="queryLanguage"
            value={language}
            label="Query Language"
            color="secondary"
            onChange={onLanguageChange}
            required
          >
            {Object.values(QueryLanguage).map((lang) => (
              <MenuItem key={QueryLanguage[lang]} value={QueryLanguage[lang]}>
                {QueryLanguageLabels[lang]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </FormGrid>
    );
  });

  const GraphQLForm = () => {
    return (
      <FormGrid item xs={12} md={6}>
        <APISelector endpoint={api?.endpoint} APIs={APIs} onAPIChange={onAPIChange} />
        {api && <PersistedQuerySelector api={api} onStatementChange={handleStatementChange} />}
      </FormGrid>
    );
  };

  /**
   * This is the render block for the "Plugin Container"
   */
  return (
    <section className="wizard-language-selector" aria-label="Language Selector">
      <LanguageSelectorHeader />
      <div className="wizard-language-selector-content">
        <QueryLanguageSelector />
        {language === QueryLanguage.GraphQL && <GraphQLForm />}
      </div>
    </section>
  );
};
