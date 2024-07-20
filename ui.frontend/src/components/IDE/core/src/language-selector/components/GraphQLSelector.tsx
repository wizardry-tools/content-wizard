import { FormGrid } from 'src/components/QueryWizard/Components';
import { APISelector, APISelectorProps } from './APISelector';
import { PersistedQuerySelector, PersistedQuerySelectorProps } from './PersistedQuerySelector';
import { useLogger } from 'src/providers';
import { useRenderCount } from 'src/utility';

export type GraphQLSelectorProps = Omit<APISelectorProps, 'endpoint'> & Partial<PersistedQuerySelectorProps>;

export const GraphQLSelector = ({ api, APIs, onAPIChange, onStatementChange = () => {} }: GraphQLSelectorProps) => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `GraphQLSelector[${renderCount}] render()` });
  return (
    <FormGrid item xs={12} md={6}>
      <APISelector endpoint={api?.endpoint} APIs={APIs} onAPIChange={onAPIChange} />
      {api && api.endpoint && api.persistedQueries?.length > 0 && (
        <PersistedQuerySelector api={api} onStatementChange={onStatementChange} />
      )}
    </FormGrid>
  );
};
