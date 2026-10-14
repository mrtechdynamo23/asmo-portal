import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Initialize theme: Default to LIGHT mode initially per user requirement
try {
  // Clear legacy auto-dark preference if first time on v2
  if (localStorage.getItem('asmo_theme_v2') === null) {
    localStorage.removeItem('asmo_theme');
    localStorage.setItem('asmo_theme_v2', 'light');
  }
  const savedTheme = localStorage.getItem('asmo_theme_v2') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
} catch {
  document.documentElement.setAttribute('data-theme', 'light');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
