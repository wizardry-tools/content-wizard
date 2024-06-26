import ContentWizard from "./components/ContentWizard/ContentWizard";
import {AppProvider} from "./components/QueryWizard/providers/AppProvider";

export default function App() {

  return(
    <AppProvider>
      <ContentWizard />
    </AppProvider>
  );
}





