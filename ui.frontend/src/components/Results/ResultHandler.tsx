import { ResultTable } from './ResultTable/ResultTable';
import { Paper } from '@mui/material';
import { QueryLanguage } from 'src/components/Query';
import { useResults, useQuery } from 'src/providers';

export function ResultHandler() {
  const results = useResults();
  const query = useQuery();

  const resultTable = () => {
    if (results) {
      if (query.language !== QueryLanguage.GraphQL) {
        return <ResultTable />;
      }
    }
  };

  return (
    <Paper
      className={'result-handler'}
      elevation={3}
      sx={{
        overflow: 'auto',
        padding: '2rem',
      }}
    >
      {resultTable()}
    </Paper>
  );
}
