import { useCallback } from 'react';
import type { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import type { API, QueryLanguage, Statement } from '@/types';
import { useRenderCount } from '@/utility';
import { useLogger, useQuery, useQueryDispatcher } from '@/providers';
import { defaultAdvancedQueries } from '@/components/Query';
import { useAPIContext } from '../ide-providers';
import { GraphQLSelector, LanguageSelectorHeader, QueryLanguageSelector } from './components';
import './language-selector.scss';

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
  const renderCount = useRenderCount();
  logger.debug({ message: `LanguageSelector[${renderCount}] render()` });
  const { language, api } = useQuery();
  const queryDispatcher = useQueryDispatcher();
  const { APIs } = useAPIContext({
    nonNull: true,
    caller: LanguageSelector,
  });

  const handleStatementChange = useCallback(
    (statement: Statement) => {
      logger.debug({ message: `LanguageSelector statementChange()` });
      queryDispatcher({
        type: 'statementChange',
        statement,
      });
    },
    [logger, queryDispatcher],
  );

  const handleLanguageChange = useCallback(
    (language: QueryLanguage) => {
      // reset the entire query on language change
      logger.debug({ message: `LanguageSelector[] replaceQuery()` });
      queryDispatcher({
        ...defaultAdvancedQueries[language],
        type: 'replaceQuery',
      });
    },
    [logger, queryDispatcher],
  );

  const handleAPIChange = useCallback(
    (newAPI: API) => {
      logger.debug({ message: `LanguageSelector apiChange() api`, newAPI });
      queryDispatcher({
        type: 'apiChange',
        api: newAPI,
      });
    },
    [logger, queryDispatcher],
  );

  const onAPIChange = useCallback(
    (event: SelectChangeEvent) => {
      const selectedEndpoint = event.target.value;
      // API was selected
      const foundAPI = APIs.find((api) => {
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

  /**
   * This is the render block for the "Plugin Container"
   */
  return (
    <section className="wizard-language-selector" aria-label="Language Selector">
      <LanguageSelectorHeader />
      <div className="wizard-language-selector-content">
        <QueryLanguageSelector language={language} onLanguageChange={onLanguageChange} />
        {language === 'GraphQL' && (
          <GraphQLSelector APIs={APIs} onAPIChange={onAPIChange} api={api} onStatementChange={handleStatementChange} />
        )}
      </div>
    </section>
  );
};
