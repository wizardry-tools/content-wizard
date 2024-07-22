import { Tab, Tabs } from '@mui/material';
import { WandIcon, CodeIcon, TableIcon } from 'src/icons';
import { a11yProps } from 'src/utils';

export type FeaturesBarProps = {
  tabValue: number;
  onTabSelect: (_event: any, value: any) => void;
};

const tabCssProps = {
  fontSize: {
    xs: '.75rem',
    sm: '1rem',
    md: '1.5rem',
  },
  svg: {
    fontSize: {
      xs: '1.5rem',
      sm: '1.75rem',
    },
  },
};

export const FeaturesBar = ({ tabValue, onTabSelect }: FeaturesBarProps) => {
  return (
    <Tabs
      value={tabValue}
      onChange={onTabSelect}
      indicatorColor="primary"
      textColor="primary"
      variant="fullWidth"
      sx={{
        width: '100%',
      }}
      className="bar-tabs"
    >
      <Tab
        label="Query Wizard"
        {...a11yProps(0, 'features-tab-')}
        icon={<WandIcon />}
        iconPosition="start"
        className="bar-tab query-wizard-tab"
        sx={tabCssProps}
      />
      <Tab
        label="Query IDE"
        {...a11yProps(1)}
        icon={<CodeIcon />}
        iconPosition="start"
        className="bar-tab ide-tab"
        sx={tabCssProps}
      />
      <Tab
        label="Results"
        {...a11yProps(2)}
        icon={<TableIcon />}
        iconPosition="start"
        className="bar-tab results-tab"
        sx={tabCssProps}
      />
    </Tabs>
  );
};
