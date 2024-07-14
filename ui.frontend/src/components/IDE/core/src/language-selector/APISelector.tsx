import { memo, useMemo, useRef } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { API } from '../api';
import { useLogger } from '../../../../../providers';

type APISelectorProps = {
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

/**
 * This component allows the user to select a configured GraphQL API from AEM.
 */
export const APISelector = memo((props: APISelectorProps) => {
  const logger = useLogger();
  const renderCount = useRef(0);
  logger.debug({ message: `APISelector[${++renderCount.current}] render()` });
  const { APIs, endpoint = '', onAPIChange = () => {} } = props;

  const menuItems = useMemo(() => {
    return APIs?.length
      ? APIs.map((api, index) => (
          <MenuItem key={index} value={api.endpoint}>
            {api.endpoint}
          </MenuItem>
        ))
      : null;
  }, [APIs]);

  return (
    <FormControl variant="filled" color="secondary" className="wizard-language-selector-api-selector">
      <InputLabel id={'graphql-select-label'} required>
        GraphQL API
      </InputLabel>
      <Select
        labelId={'graphql-select-label'}
        id={'graphql-select'}
        name={'graphql-select'}
        value={endpoint}
        color="secondary"
        label={'GraphQL API'}
        onChange={onAPIChange}
        required
      >
        {menuItems}
      </Select>
    </FormControl>
  );
});
