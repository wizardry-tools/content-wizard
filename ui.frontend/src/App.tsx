import { ContentWizard } from 'src/components/ContentWizard';
import { AppProvider } from 'src/providers';

export default function App() {
  return (
    <AppProvider>
      <ContentWizard />
    </AppProvider>
  );
}
