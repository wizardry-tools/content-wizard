import {useCallback, useEffect, useMemo, useState} from "react";
import {DYNAMIC_HEADERS} from "src/utility";
import {useAlertDispatcher} from "src/providers";
import {Box, CircularProgress, Paper, Stack} from "@mui/material";
import {Tooltip, ResultExplorerEditor} from "src/components/IDE/core/src";
import * as prettier from "prettier";
import prettierPluginBabel from "prettier/plugins/babel";
import prettierPluginEstree from "prettier/plugins/estree";



export type ResultExplorerProps = {
  path: string;
}
export type ResultData = string
export const ResultExplorer = (props: ResultExplorerProps) => {
  const {path} = props;
  const [data, setData] = useState<ResultData>('');
  const [isFetching, setIsFetching] = useState(false);
  const alertDispatcher = useAlertDispatcher();

  const loadData = useCallback(() => {
    async function fetchData (): Promise<ResultData> {
      setIsFetching(true);
      if (path) {
        try {
          let response = await fetch(`${path}.-1.json`, DYNAMIC_HEADERS);
          if (response.ok) {
            return await response.json();
          }
        } catch (e) {
          console.error(e);
          alertDispatcher({
            message: `Error: could not load data for the result ${path}`,
            severity: 'error'
          })
        }
      }
      return '';
    }

    fetchData()
      .then((responseData)=>{
        if (responseData) {
          const json = JSON.stringify(responseData, null, ' ');
          prettier.format(json, {parser: 'json', plugins: [prettierPluginBabel, prettierPluginEstree]})
            .then((formattedJson)=>{
              setData(formattedJson);
            })
            .catch((error)=>{
              console.error(error);
              alertDispatcher({
                message: `Error: exception occurred while formatting data result for ${path}`,
                severity: 'error'
              })
            });
        } else {
          setData('') // revert to default
        }

      })
      .catch((error) => {
        console.error(error);
        alertDispatcher({
          message: `Error: exception occurred while fetching data for ${path}`,
          severity: 'error'
        })
      });

    setIsFetching(false);

  },[alertDispatcher, path]);

  useEffect(()=>{
    if (isFetching) {
      return;
    }
    loadData();
  },[isFetching, loadData]);

  const ExplorerWindow = useMemo(() => {
      return (
        <Paper elevation={3} className="explorer-paper">
          <Tooltip.Provider>
            <Stack
              className={`result-explorer-stack`}
              direction="row"
              spacing={1}
            >
              <ResultExplorerEditor
                editorTheme="wizard"
                keyMap="sublime"
                className="result-explorer-data"
                data={data}
              />
            </Stack>
          </Tooltip.Provider>
        </Paper>
      );
  }, [data]);

  return (
    <div className="result-explorer">
      <Box
        className={`${data ? 'hide' : 'show'}`}
        sx={{
          position: 'absolute',
          left: '50%',
          right: '50%',
          display: 'none',
          '&.show': {
            display: 'block'
          }
        }}
      >
        <CircularProgress/>
      </Box>
      <Stack
        className={`result-explorer-stack ${!data ? 'hide' : 'show'}`}
        sx={{
          '&.hide': {
            display: 'none'
          }
        }}
      >{ExplorerWindow}</Stack>
    </div>
  );
}