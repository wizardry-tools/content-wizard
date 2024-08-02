import { memo, useMemo } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import type { APISelectorProps } from '@/types';
import { useRenderCount } from '@/utility';
import { useLogger } from '@/providers';

/**
 * This component allows the user to select a configured GraphQL API from AEM.
 */
export const APISelector = memo((props: APISelectorProps) => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `APISelector[${renderCount}] render()` });
  const { APIs, endpoint = '', onAPIChange = () => ({}) } = props;

  const menuItems = useMemo(() => {
    return APIs.map((api, index) => (
      <MenuItem key={index} value={api.endpoint}>
        {api.endpoint}
      </MenuItem>
    ));
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
