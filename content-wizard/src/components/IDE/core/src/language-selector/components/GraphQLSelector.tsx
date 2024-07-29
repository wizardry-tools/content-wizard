import { GraphQLSelectorProps } from '@/types';
import { useRenderCount } from '@/utility';
import { useLogger } from '@/providers';
import { FormGrid } from '@/components/QueryWizard/Components';
import { APISelector } from './APISelector';
import { PersistedQuerySelector } from './PersistedQuerySelector';

export const GraphQLSelector = ({ api, APIs, onAPIChange, onStatementChange = () => ({}) }: GraphQLSelectorProps) => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `GraphQLSelector[${renderCount}] render()` });
  return (
    <FormGrid item xs={12} md={6}>
      <APISelector endpoint={api?.endpoint} APIs={APIs} onAPIChange={onAPIChange} />
      {api?.endpoint && api.persistedQueries.length > 0 && (
        <PersistedQuerySelector api={api} onStatementChange={onStatementChange} />
      )}
    </FormGrid>
  );
};
