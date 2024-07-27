import { AppProvider } from '@/providers';
import { LandingPage } from '@/routes';
import './App.css';

function App() {
  return (
    <AppProvider>
      <LandingPage />
    </AppProvider>
  );
}

export default App;
