import './App.css';
import LandingPage from './routes/LandingPage';
import { AppProvider } from './providers/AppProvider';

function App() {
  return (
    <AppProvider>
      <LandingPage />
    </AppProvider>
  );
}

export default App;
