import {
  useState,
  useEffect
} from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import {GraphQLAPI, API, PersistedQuery} from "../../../../Query";
import {getHeadlessClient} from "../../../../utility/AEMHeadlessClient";

type GraphQLSelectProps = {
  onApiChange: (api: API) => void;
  onPersistedQuerySelect: (e:{target:{value: string}}) => void;
}

//TODO Refactor this to utilize the fetcher logic, rather than the AEMHeadless framework.
export const GraphQLSelect = ({onApiChange,onPersistedQuerySelect}: GraphQLSelectProps) => {

  const [APIs, setAPIs] = useState([] as GraphQLAPI[]);
  const [selectedAPI, setSelectedAPI] = useState<GraphQLAPI>({endpoint:'', persistedQueries: []});
  const [selectedPersistedQuery, setSelectedPersistedQuery] = useState({path: {shortForm:''}, data:{query:''}} as PersistedQuery);

  useEffect(() => {
    (async () => {
      try {
        const aemHeadlessClient = getHeadlessClient({});
        const data:GraphQLAPI[] = await aemHeadlessClient.getGraphQLAPIs();
        if (data && data.length>0) {
          setAPIs(data);
        }
      } catch (e) {
        console.error(e);
      }
    })();
    // this gets all endpoint names and persisted queries, should only be called once per module init
  },[]);

  const changeApi = (e: {target: {value: string}}) => {
    // API was selected
    let api = APIs.find((api)=>{
      return api.endpoint === e.target.value
    });
    if (api) {
      setSelectedAPI(api);
      onApiChange(api);
    }
  }

  const changePersistedQuery = (e: {target: {value: string}}) => {
    let selectedPersistedQuery = selectedAPI.persistedQueries.find((pq)=> {
      return pq?.path?.shortForm === e.target.value;
    })
    if (selectedPersistedQuery?.data?.query) {
      setSelectedPersistedQuery(selectedPersistedQuery);
      onPersistedQuerySelect({
        target:{
          value: selectedPersistedQuery.data.query
        }
      });
    }
  }

  const apiMenuItems = () => {
    return (APIs?.length) ?
      APIs.map((api,index) =>
        <MenuItem key={index} value={api.endpoint} >{api.endpoint}</MenuItem>
      ) : null;
  }

  const persistedQueryMenuItems = () => {
    return (selectedAPI?.persistedQueries) ?
      selectedAPI.persistedQueries.map((option,index) => {
        // /we-retail/AllStores
        const parts = option.path.shortForm.split("/")
        const name = parts[2] || parts[1];
        return <MenuItem key={index} value={option.path.shortForm} >{name}</MenuItem>;
      }) : null;
  }

  return(
    <>
      <FormControl
        variant="filled"
        color="secondary"
        className="wizard-language-selector-api-selector"
      >
        <InputLabel id={'graphql-select-label'} required>GraphQL API</InputLabel>
        <Select
          labelId={'graphql-select-label'}
          id={'graphql-select'}
          name={'graphql-select'}
          value={selectedAPI.endpoint}
          color="secondary"
          label={'GraphQL API'}
          onChange={changeApi}
          required
        >
          {apiMenuItems()}
        </Select>
      </FormControl>
      {selectedAPI?.endpoint && selectedAPI?.persistedQueries?.length > 0 && (
        <FormControl
          variant="filled"
          color="secondary"
          className="wizard-language-selector-persisted-query-selector"
        >
          <InputLabel id={'persisted-query-select-label'}>Persisted Queries</InputLabel>
          <Select
            labelId={'persisted-query-select-label'}
            id={'persisted-query-select'}
            name={'persisted-query-select'}
            label={'Persisted Queries'}
            color="secondary"
            value={selectedPersistedQuery.path.shortForm}
            onChange={changePersistedQuery}
          >
            {persistedQueryMenuItems()}
          </Select>
        </FormControl>
      )}
    </>
  );
}