import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const stored = localStorage.getItem('swap-theme');
const theme =
  stored === 'light' || stored === 'dark'
    ? stored
    : window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
document.documentElement.setAttribute('data-theme', theme);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
