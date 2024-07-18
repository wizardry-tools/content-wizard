import { memo, useRef } from 'react';
import { FormGrid } from 'src/components/QueryWizard/Components';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { QueryLanguage, QueryLanguageKey, QueryLanguageLabels } from 'src/components/Query';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { useLogger } from 'src/providers';

export type QueryLanguageSelectorProps = {
  language: QueryLanguageKey;
  onLanguageChange: (event: SelectChangeEvent) => void;
};
/**
 * This is a render function for the actual Dropdown field.
 */
export const QueryLanguageSelector = memo(({ language, onLanguageChange }: QueryLanguageSelectorProps) => {
  const logger = useLogger();
  const renderCount = useRef(0);
  logger.debug({ message: `QueryLanguageSelector[${++renderCount.current}] render()` });
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
