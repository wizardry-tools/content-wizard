import React, {useState, createContext, useContext} from "react";
import {WithChildren} from "../types/StandardTypes";
import {Results} from "../types/ResultType";


const ResultsContext = createContext<Results>([] as Results);
const ResultsDispatchContext = createContext<React.Dispatch<Results>>(null!);


export function ResultsProvider({ children }:WithChildren) {
  const [results , setResults] = useState([] as Results)

  const updateResults = (results: Results) => {
    setResults(results);
  }

  return (
    <ResultsContext.Provider value={results}>
      <ResultsDispatchContext.Provider value={updateResults}>
        {children}
      </ResultsDispatchContext.Provider>
    </ResultsContext.Provider>
  )
}

export function useResults() {
  return useContext(ResultsContext);
}

export function useResultsDispatch() {
  return useContext(ResultsDispatchContext);
}