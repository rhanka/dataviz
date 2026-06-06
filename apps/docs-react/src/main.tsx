import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@sentropic/design-system-themes/css/sent-tech.css';
import { App } from './App.js';

const target = document.getElementById('app');
if (!target) throw new Error('#app introuvable');

createRoot(target).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
