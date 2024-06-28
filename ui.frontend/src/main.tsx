// ContentWizard, copyright (c) by Darrin Johnson and Content Wizard Contributors
// Distributed under an MIT license: https://github.com/wizardry-tools/content-wizard/blob/main/LICENSE

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';

ReactDOM.createRoot(document.getElementById('app-root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
