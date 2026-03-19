import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';
import './styles.css';

// Detect dark mode
const updateTheme = () => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', isDark);
};

updateTheme();
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);