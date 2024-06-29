import {useCallback, useMemo, useState} from 'react';

import Box from '@mui/material/Box';
import {QueryProvider, useQuery} from "./providers/QueryProvider";
import {ResultsProvider, useResultsDispatch} from "./providers/ResultsProvider";
import QueryWizardBar from "./QueryWizardBar";
import QueryWizardViews from "./QueryWizardViews";
import {IDEProvider} from "./providers/IDEProvider";
import {Results} from "./types/ResultType";
import {Fetcher} from "@graphiql/toolkit/src/create-fetcher/types";
import {createCustomFetcher} from "../utility/createFetcher";

import './QueryWizard.scss';

export default function QueryWizard() {

  return (
    <QueryProvider>
      <ResultsProvider>
          <QueryWizardInterface/>
      </ResultsProvider>
    </QueryProvider>
  )

}

function QueryWizardInterface() {
  const [tabValue, setTabValue] = useState(0);
  const resultsDispatch = useResultsDispatch();
  const query = useQuery();

  const onResults = useCallback((data: any) => {
    const results:Results = data.hits || data.results || JSON.stringify(data);
    resultsDispatch(results);
  },[resultsDispatch]);

  const fetcher:Fetcher = useMemo(()=>createCustomFetcher(query, onResults),[query,onResults]);

  const onTabSelect = (_event: any, value: any) => {
    setTabValue(value);
  }

  const onTabPanelSelect = (index: number) => {
    setTabValue(index);
  }

  return (
    <IDEProvider
      fetcher={fetcher}
      query={query.statement}>
      <Box className="query-wizard-content-wrapper">
        <QueryWizardBar
          tabValue={tabValue}
          onTabSelect={onTabSelect}
        />
        <QueryWizardViews
          tabValue={tabValue}
          onTabPanelSelect={onTabPanelSelect}
        />
      </Box>
    </IDEProvider>
  )
}
