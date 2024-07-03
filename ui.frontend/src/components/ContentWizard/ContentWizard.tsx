import {
  ContentWizardProvider,
  useResultsDispatch,
  useQuery,
  IDEProvider,
} from "../Providers";
import {Box} from "@mui/material";
import {GlobalNav} from "../GlobalNav";
import {useCallback, useMemo, useState} from "react";
import { Bar, Views } from ".";

import {Results} from "../Results";
import {Fetcher} from "@graphiql/toolkit/src/create-fetcher/types";
import {createCustomFetcher} from "../utility";

import "./ContentWizard.scss";


export function ContentWizard() {

  return (
    <ContentWizardProvider>
      <ContentWizardInterface/>
    </ContentWizardProvider>
  );
}


function ContentWizardInterface() {
  const resultsDispatch = useResultsDispatch();
  const query = useQuery();

  const [tabValue, setTabValue] = useState(0);
  const onTabSelect = (_event: any, value: any) => {
    setTabValue(value);

  }
  const onTabPanelSelect = (index: number) => {
    setTabValue(index);

  }
  const onResults = useCallback((data: any) => {
    const results:Results = data.hits || data.results || JSON.stringify(data);
    resultsDispatch(results);
  },[resultsDispatch]);

  const fetcher:Fetcher = useMemo(()=>createCustomFetcher(query, onResults),[query,onResults]);



  /*
    IDEProvider can't be included in the ContentWizardProvider, since ContentWizardProvider contains the
    initialization of other Providers that IDEProvider relies on.
   */
  return (
    <IDEProvider
      fetcher={fetcher}
      query={query.statement}>
      <Box className="content-wizard-main">
        <GlobalNav pageTitle="Content Wizard" />
        <Box className="content-wizard-content-wrapper">
          <Bar
            tabValue={tabValue}
            onTabSelect={onTabSelect}
          />
          <Views
            tabValue={tabValue}
            onTabPanelSelect={onTabPanelSelect}
          />
        </Box>
      </Box>
    </IDEProvider>
  )
}
