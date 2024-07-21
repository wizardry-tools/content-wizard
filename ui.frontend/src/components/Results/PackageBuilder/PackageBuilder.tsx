import { ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
import { useLogger, usePackagingContext } from 'src/providers';
import { Autocomplete, Button, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ConstructionIcon from '@mui/icons-material/Construction';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import { FormGrid } from 'src/components/QueryWizard/Components';
import { useRenderCount } from 'src/utility';

import './PackageBuilder.scss';

/**
 * This component controls all Packaging logic.
 *
 * Sequence:
 *    1. Create Package
 *    2. Define Package Filters
 *    3. Build Package
 *    4. Download Package
 *
 * @constructor
 */
export const PackageBuilder = () => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `PackageBuilder[${renderCount}] render()` });
  const { create, build, groups, isCreating, isBuilding, packageState, setPackageName, setGroupName } =
    usePackagingContext();
  const initialPackageState = useRef(packageState);
  const [name, setName] = useState(initialPackageState.current.packageName);
  const [group, setGroup] = useState(initialPackageState.current.groupName);
  const [focusTarget, setFocusTarget] = useState('');

  // simple callback that handles user input for packageName
  const handleNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setName(value);
      setPackageName(value);
    },
    [setPackageName],
  );

  // simple callback that handles user input for groupName
  const handleGroupChange = useCallback(
    (_event: any, newValue: string | null) => {
      if (newValue) {
        setGroup(newValue);
        setGroupName(newValue);
      }
    },
    [setGroupName],
  );

  const disableAll = useMemo(() => isCreating || isBuilding, [isCreating, isBuilding]);

  return (
    <div className="package-builder">
      <Stack className={`package-builder-stack`} component={Paper} color={'secondary'}>
        <FormGrid item>
          <Paper elevation={focusTarget === 'packageName' ? 4 : 1}>
            <TextField
              id={'package-builder-package-name'}
              name={'package-builder-package-name'}
              label={'Package Name'}
              value={name}
              color={'secondary'}
              fullWidth
              className="package-builder-field"
              onFocus={() => setFocusTarget('packageName')}
              onBlur={() => setFocusTarget('')}
              onChange={handleNameChange}
              required
              disabled={disableAll}
            />
          </Paper>
        </FormGrid>
        <FormGrid item>
          <Paper elevation={focusTarget === 'groupName' ? 4 : 1}>
            <Autocomplete
              id={'package-builder-package-group'}
              value={group}
              onChange={handleGroupChange}
              fullWidth
              clearOnEscape
              freeSolo
              autoHighlight
              autoSelect
              disabled={disableAll}
              renderInput={(params) => (
                <TextField
                  name={'package-builder-package-group'}
                  label={'Package Group'}
                  color={'secondary'}
                  className="package-builder-field"
                  onFocus={() => setFocusTarget('groupName')}
                  onBlur={() => setFocusTarget('')}
                  required
                  {...params}
                />
              )}
              options={groups}
            />
          </Paper>
        </FormGrid>
        {packageState.packagePath && !packageState.isReady && !disableAll && (
          <FormGrid item>
            <Typography>Package has been Created. Ready to build.</Typography>
          </FormGrid>
        )}
        {packageState.packagePath && packageState.isReady && !disableAll && (
          <FormGrid item>
            <Typography>Package has been Built. Ready to download.</Typography>
          </FormGrid>
        )}
        {disableAll && (
          <FormGrid item alignItems={'center'}>
            <CircularProgress />
          </FormGrid>
        )}
        <FormGrid item>
          {!packageState.packagePath && (
            <FormGrid mt={1}>
              <Button
                onClick={create}
                color={'secondary'}
                startIcon={<AddBoxIcon />}
                variant={'contained'}
                disabled={disableAll || !packageState.packageName}
              >
                Create Package Definition
              </Button>
            </FormGrid>
          )}
          {packageState.packagePath && !packageState.isReady && (
            <FormGrid mt={1}>
              <Button
                onClick={build}
                color={'secondary'}
                startIcon={<ConstructionIcon />}
                variant={'contained'}
                disabled={disableAll}
              >
                Build Package
              </Button>
            </FormGrid>
          )}
          {packageState.packageUrl && (
            <FormGrid mt={1}>
              <Button
                href={packageState.packageUrl}
                target="_blank"
                color={'secondary'}
                startIcon={<VisibilityIcon />}
                variant={'contained'}
                disabled={disableAll}
              >
                View Package Definition
              </Button>
            </FormGrid>
          )}
          {packageState.downloadUrl && packageState.isReady && (
            <FormGrid mt={1}>
              <Button
                href={packageState.downloadUrl}
                download
                color={'secondary'}
                startIcon={<DownloadIcon />}
                variant={'contained'}
                disabled={disableAll}
              >
                Download Package Now
              </Button>
            </FormGrid>
          )}
        </FormGrid>
      </Stack>
    </div>
  );
};
