import { ResultTable } from './ResultTable/ResultTable';
import { Paper } from '@mui/material';
import { useQuery } from '@/providers';

export const ResultHandler = () => {
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
      {query.language !== 'GraphQL' && <ResultTable />}
    </Paper>
  );
};
