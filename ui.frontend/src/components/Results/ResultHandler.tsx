import { ResultTable } from "./ResultTable";
import {Paper, TextField} from "@mui/material";
import { FormGrid } from "../QueryWizard/Components";
import {QueryLanguage, QueryLanguageLookup} from "../QueryWizard/types/QueryTypes";
import {useResults, useQuery} from "../Providers";

export function ResultHandler() {
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
