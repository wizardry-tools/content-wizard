import { memo, useCallback, useMemo, useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Statement } from 'src/components/Query';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { API } from '../../api';
import { useLogger } from 'src/providers';
import { useRenderCount } from 'src/utility';

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
export const PersistedQuerySelector = memo(({ api, onStatementChange }: PersistedQuerySelectorProps) => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `PersistedQuerySelector[${renderCount}] render()` });

  const { persistedQueries } = api;
  const [selectedQuery, setSelectedQuery] = useState('');

  const onChange = useCallback(
    (event: SelectChangeEvent) => {
      const queryName = event.target.value;
      setSelectedQuery(queryName);
      let foundQuery = persistedQueries.find((pq) => {
        return pq?.path?.shortForm === queryName;
      });
      if (foundQuery?.data?.query) {
        onStatementChange(foundQuery.data.query);
      }
    },
    [persistedQueries, onStatementChange],
  );

  const persistedQueryMenuItems = useMemo(() => {
    return persistedQueries?.map((option, index) => {
      //example:  /we-retail/AllStores
      const parts = option.path.shortForm.split('/');
      const name = parts[2] || parts[1];
      return (
        <MenuItem key={index} value={option.path.shortForm}>
          {name}
        </MenuItem>
      );
    });
  }, [persistedQueries]);

  return (
    <FormControl variant="filled" color="secondary" className="wizard-language-selector-persisted-query-selector">
      <InputLabel id={'persisted-query-select-label'}>Load Persisted Query</InputLabel>
      <Select
        labelId={'persisted-query-select-label'}
        id={'persisted-query-select'}
        name={'persisted-query-select'}
        label={'Persisted Queries'}
        color="secondary"
        value={selectedQuery}
        onChange={onChange}
      >
        {persistedQueryMenuItems}
      </Select>
    </FormControl>
  );
});
