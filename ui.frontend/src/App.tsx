import { ContentWizard } from "./components/ContentWizard";
import { AppProvider } from "./components/Providers/AppProvider";

export default function App() {

  return(
    <AppProvider>
      <ContentWizard />
    </AppProvider>
  );
}





