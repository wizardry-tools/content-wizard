import {
  useState,
  createContext,
  useContext,
  PropsWithChildren,
  Dispatch
} from "react";
import {Results} from "../Results";


const ResultsContext = createContext<Results>([] as Results);
const ResultsDispatchContext = createContext<Dispatch<Results>>(null!);


export function ResultsProvider({ children }:PropsWithChildren) {
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