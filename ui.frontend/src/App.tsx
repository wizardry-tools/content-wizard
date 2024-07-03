import { ContentWizard } from "./components/ContentWizard";
import { AppProvider } from "./components/Providers";

export default function App() {

  return(
    <AppProvider>
      <ContentWizard />
    </AppProvider>
  );
}





