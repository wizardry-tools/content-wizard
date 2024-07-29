import { ContentWizard } from '@/components';
import { AppProvider } from '@/providers';

export default function App() {
  return (
    <AppProvider>
      <ContentWizard />
    </AppProvider>
  );
}
