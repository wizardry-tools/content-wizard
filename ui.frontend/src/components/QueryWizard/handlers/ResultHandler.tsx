import ResultTable from "../elements/ResultTable";
import {Paper, TextField} from "@mui/material";
import FormGrid from "../FormElements/FormGrid";
import {QueryLanguage, QueryLanguageLookup} from "../types/QueryTypes";
import {useResults} from "../providers/ResultsProvider";
import {useQuery} from "../providers/QueryProvider";

export default function ResultHandler() {
  const results = useResults();
  const query = useQuery();

  const resultTable = () => {
    if (results) {
      if (typeof results !== 'string' && query.language !== QueryLanguageLookup[QueryLanguage.GraphQL]) {
        return (
          <ResultTable/>
        );
      } else {
        return (
          <FormGrid item xs={12} md={12}>
            <TextField
              id="results"
              name="results"
              label="Results"
              type="text"
              multiline
              variant="filled"
              defaultValue={results as string}
              disabled={true}
            />
          </FormGrid>
        )
      }
    }
  }

  return(
    <Paper
      className={"result-handler"}
      elevation={3}
      sx={{
        overflow: "auto",
        padding: "2rem"
      }}
    >
      {resultTable()}
    </Paper>
  );
}

