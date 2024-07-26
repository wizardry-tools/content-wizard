import { AppBar, Tabs, Tab } from '@mui/material';
import { a11yProps } from '@/utility';
import { useResults } from '@/providers';
import { MagicWand, ProgrammingCode, TableIcon } from '@/icons';

import './Bar.scss';

type QueryWizardBarProps = {
  tabValue: number;
  onTabSelect: (_event: any, value: any) => void;
};

const tabCssProps = {
  fontSize: {
    xs: '.75rem',
    sm: '1rem',
    md: '1.5rem',
  },
};

export const Bar = ({ tabValue, onTabSelect }: QueryWizardBarProps) => {
  const { results } = useResults();

  return (
    <AppBar className="content-wizard-bar">
      <Tabs
        value={tabValue}
        onChange={onTabSelect}
        indicatorColor="secondary"
        textColor="secondary"
        variant="fullWidth"
        className="content-wizard-bar-tabs"
      >
        <Tab
          label="Query Wizard"
          {...a11yProps(0)}
          icon={<MagicWand />}
          iconPosition="start"
          className="content-wizard-bar-tab query-wizard-tab"
          sx={tabCssProps}
        />
        <Tab
          label="Query IDE"
          {...a11yProps(1)}
          icon={<ProgrammingCode />}
          iconPosition="start"
          className="content-wizard-bar-tab ide-tab"
          sx={tabCssProps}
        />
        <Tab
          label="Results"
          {...a11yProps(2)}
          icon={<TableIcon />}
          iconPosition="start"
          disabled={!results || results.length < 1}
          className="content-wizard-bar-tab results-tab"
          sx={tabCssProps}
        />
      </Tabs>
    </AppBar>
  );
};
