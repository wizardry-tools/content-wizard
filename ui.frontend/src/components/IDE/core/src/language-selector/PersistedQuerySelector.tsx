import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Statement } from 'src/components/Query';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { API } from '../api';
import { useLogger } from 'src/providers';

type PersistedQuerySelectorProps = {
  api: API;
  onStatementChange: (statement: Statement) => void;
};
export const PersistedQuerySelector = memo(({ api, onStatementChange }: PersistedQuerySelectorProps) => {
  const logger = useLogger();
  const renderCount = useRef(0);
  logger.debug({ message: `PersistedQuerySelector[${++renderCount.current}] render()` });

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
    return persistedQueries
      ? persistedQueries.map((option, index) => {
          // /we-retail/AllStores
          const parts = option.path.shortForm.split('/');
          const name = parts[2] || parts[1];
          return (
            <MenuItem key={index} value={option.path.shortForm}>
              {name}
            </MenuItem>
          );
        })
      : null;
  }, [persistedQueries]);

  if (api.endpoint && api.persistedQueries?.length > 0) {
    return (
      <FormControl variant="filled" color="secondary" className="wizard-language-selector-persisted-query-selector">
        <InputLabel id={'persisted-query-select-label'}>Persisted Queries</InputLabel>
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
  } else {
    return null;
  }
});
