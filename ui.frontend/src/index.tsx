import 'react-app-polyfill/stable';
import 'react-app-polyfill/ie9';
import 'custom-event-polyfill';

import {StrictMode} from 'react';
import { BrowserRouter} from 'react-router-dom';
import App from './App';
import './index.css';


import {Container, createRoot} from 'react-dom/client';
const root = createRoot(document.getElementById('app-root') as Container);

root.render(
  <StrictMode>
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  </StrictMode>
)