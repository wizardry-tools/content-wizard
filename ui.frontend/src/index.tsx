// ContentWizard, copyright (c) by Darrin Johnson and Content QueryWizard Contributors
// Distributed under an MIT license: https://github.com/wizardry-tools/content-wizard/blob/main/LICENSE

import 'react-app-polyfill/stable';
import 'react-app-polyfill/ie9';
import 'custom-event-polyfill';

import {StrictMode} from 'react';
import App from './App';
import './index.css';


import {Container, createRoot} from 'react-dom/client';
const root = createRoot(document.getElementById('app-root') as Container);

root.render(
  <StrictMode>
    <App/>
  </StrictMode>
)