import { memo } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import type { QueryLanguageSelectorProps } from '@/types';
import { useRenderCount } from '@/utility';
import { useLogger } from '@/providers';
import { FormGrid } from '@/components/QueryWizard/Components';
import { QUERY_LANGUAGES } from '@/components';

/**
 * This is a render function for the actual Dropdown field.
 */
export const QueryLanguageSelector = memo(({ language, onLanguageChange }: QueryLanguageSelectorProps) => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `QueryLanguageSelector[${renderCount}] render()` });
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
          {Object.entries(QUERY_LANGUAGES).map(([lang, label]) => (
            <MenuItem key={lang} value={lang}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </FormGrid>
  );
});
