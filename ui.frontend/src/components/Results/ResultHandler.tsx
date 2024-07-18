import { ResultTable } from './ResultTable/ResultTable';
import { Paper } from '@mui/material';
import { QueryLanguage } from 'src/components/Query';
import { useQuery } from 'src/providers';

export function ResultHandler() {
  const query = useQuery();

  return (
    <Paper
      className={'result-handler'}
      elevation={3}
      sx={{
        padding: '2rem',
        position: 'relative',
      }}
    >
      {query.language !== QueryLanguage.GraphQL && <ResultTable />}
    </Paper>
  );
}