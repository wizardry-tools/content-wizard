import {AppBar, Tabs, Tab} from "@mui/material";
import {a11yProps} from "../utility/ui";
import {useResults} from "./providers/ResultsProvider";
import {MagicWand, ProgrammingCode, TableIcon} from "../IDE/core/src";
import Header from "../Header/Header";

type QueryWizardBarProps = {
  tabValue: number;
  onTabSelect: (_event: any, value: any)=>void;
}

const tabCssProps = {
  fontSize: {
    xs: '.8rem',
    sm: '1rem',
    md: '1.5rem'
  }
};

const QueryWizardBar = ({tabValue, onTabSelect}: QueryWizardBarProps) => {
  const results = useResults();

  return(
    <AppBar className="query-wizard-header">
      <Header pageTitle="Content Wizard" />
        <Tabs
          value={tabValue}
          onChange={onTabSelect}
          indicatorColor="secondary"
          textColor="secondary"
          variant="fullWidth"
          className="query-wizard-header-tabs"
        >
          <Tab
            label="Query Wizard"
            {...a11yProps(0)}
            icon={<MagicWand/>}
            iconPosition="start"
            className="query-wizard-header-tab query-builder-tab"
            sx={tabCssProps}
          />
          <Tab
            label="Query IDE"
            {...a11yProps(1)}
            icon={<ProgrammingCode/>}
            iconPosition="start"
            className="query-wizard-header-tab ide-tab"
            sx={tabCssProps}
          />
          <Tab
            label="Results"
            {...a11yProps(2)}
            icon={<TableIcon/>}
            iconPosition="start"
            disabled={!results || results.length<1}
            className="query-wizard-header-tab results-tab"
            sx={tabCssProps}
          />
        </Tabs>
    </AppBar>
  );
}

export default QueryWizardBar;