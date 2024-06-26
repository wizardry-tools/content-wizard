import FormGrid from "../../../../QueryWizard/FormElements/FormGrid";
import {
  API,
  QueryLanguage,
  QueryLanguageKey,
  QueryLanguageLookup,
  Statement
} from "../../../../QueryWizard/types/QueryTypes";
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {defaultAdvancedQueries} from "../../../../QueryWizard/defaults";
import GraphQLSelect from "./GraphQLSelect";
import {useQuery, useQueryDispatch} from "../../../../QueryWizard/providers/QueryProvider";

import "./language-selector.scss";

export default function LanguageSelector() {

  const {language} = useQuery();
  const queryDispatch = useQueryDispatch();

  function handleStatementChange (statement: Statement) {
    queryDispatch({
      type: 'statementChange',
      statement
    });
  }

  function handleLanguageChange (language: QueryLanguageKey) {
    // reset the entire query on language change
    queryDispatch({
      ...(defaultAdvancedQueries[language]),
      type: 'replaceQuery',
    });
  }

  function handleAPIChange (api: API) {
    queryDispatch({
      type: 'apiChange',
      api
    });
  }

  const onTypeChange = (e: {target: {value: string}}) => {
    const selectedLanguage = e.target.value as typeof language;
    handleLanguageChange(selectedLanguage);
  }

  const onStatementChange = (e: {target: {value: string}}) => {
    const statement = e.target.value;
    handleStatementChange(statement);
  }

  const queryLanguageSelector = () => {
    const items = [];
    for (const key in QueryLanguage) {
      const lang = QueryLanguage[key as QueryLanguageKey];
      items.push(
        <MenuItem key={key} value={key} >{lang}</MenuItem>
      )
    }

    return (
      <>
        <FormControl variant="filled" color="secondary" className="wizard-language-selector">
          <InputLabel id="query-language-label" required>Query Language</InputLabel>
          <Select
            labelId="query-language-label"
            id="query-language"
            name="queryLanguage"
            value={language}
            label="Query Language"
            color="secondary"
            onChange={onTypeChange}
            required
          >
            {items}
          </Select>
        </FormControl>
      </>
    );
  }

  const graphQLSelect = (
    <>
      <FormGrid item xs={12} md={6}>
        <GraphQLSelect
          onApiChange={handleAPIChange}
          onPersistedQuerySelect={onStatementChange}
        />
      </FormGrid>
    </>
  );


  return (
    <section
      className="wizard-language-selector"
      aria-label="Language Selector"
    >
      <div className="wizard-language-selector-header">
        <div className="wizard-language-selector-header-content">
          <div className="wizard-language-selector-title">
            Language Selector
          </div>
        </div>
      </div>
      <div className="wizard-language-selector-content">

      <FormGrid item xs={12} md={12}>
        {queryLanguageSelector()}
      </FormGrid>
      {language === QueryLanguageLookup[QueryLanguage.GraphQL] && (
        graphQLSelect
      )}
      </div>
    </section>
  );
}