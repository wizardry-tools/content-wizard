import { AllowedExportType, allowedExportTypes, useResults } from '@/providers';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { FormGrid } from '@/components/QueryWizard/Components';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';

/**
 * This component contains the export configuration and button for exporting the Results.
 * @constructor
 */
export const ResultsExporter = () => {
  const { exportResults } = useResults();
  const [type, setType] = useState(allowedExportTypes.csv as AllowedExportType);
  const [fileName, setFileName] = useState('Content-Wizard-Results');
  const [selectElevation, setSelectElevation] = useState(1);
  const [inputElevation, setInputElevation] = useState(1);
  const [includeTime, setIncludeTime] = useState(true);
  const handleExport = useCallback(() => {
    const date = new Date().toISOString();
    const finalFileName = `${fileName}${includeTime ? '-' + date : ''}`;
    exportResults(finalFileName, type);
  }, [exportResults, fileName, type, includeTime]);

  const handleTypeChange = (event: SelectChangeEvent) => {
    const selectedType = event.target.value as AllowedExportType;
    if (selectedType) {
      setType(selectedType);
    }
  };

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.value);
  }, []);

  const handleCheckboxChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setIncludeTime(event.target.checked);
  }, []);

  const menuItems = useMemo(() => {
    return Object.values(allowedExportTypes).map((value: AllowedExportType, index) => {
      return (
        <MenuItem key={index} value={value}>
          {value.toUpperCase()}
        </MenuItem>
      );
    });
  }, []);

  return (
    <div className="results-exporter">
      <Stack className={`results-exporter-stack`} component={Paper} color={'secondary'}>
        <FormGrid item>
          <Paper elevation={inputElevation}>
            <TextField
              id={'results-exporter-file-name'}
              name={'results-exporter-file-name'}
              label={'File Name'}
              value={fileName}
              color={'secondary'}
              className="results-exporter-field"
              onFocus={() => {
                setInputElevation(4);
              }}
              onBlur={() => {
                setInputElevation(1);
              }}
              onChange={handleInputChange}
              required
            />
          </Paper>
        </FormGrid>
        <FormGrid item>
          <FormControl>
            <Paper elevation={selectElevation}>
              <InputLabel id={'results-exporter-type-label'} color="secondary" required>
                File Type
              </InputLabel>
              <Select
                labelId={'results-exporter-type-label'}
                id={'results-exporter-type'}
                name={'results-exporter-type'}
                label="File Type"
                value={type}
                color={'secondary'}
                onChange={handleTypeChange}
                className="results-exporter-field"
                onFocus={() => {
                  setSelectElevation(4);
                }}
                onBlur={() => {
                  setSelectElevation(1);
                }}
              >
                {menuItems}
              </Select>
            </Paper>
          </FormControl>
        </FormGrid>
        <FormGrid item>
          <FormControlLabel
            label="Include Timestamp?"
            control={
              <Checkbox
                name={'results-exporter-timestamp'}
                size={'small'}
                value={true}
                checked={includeTime}
                color="secondary"
                onChange={handleCheckboxChange}
              />
            }
          />
        </FormGrid>
        <FormGrid item>
          <Button
            onClick={handleExport}
            color={'secondary'}
            variant={'contained'}
            startIcon={<DownloadIcon />}
            disabled={!type || !fileName}
          >
            Download as {type.toUpperCase()}
          </Button>
        </FormGrid>
      </Stack>
    </div>
  );
};
