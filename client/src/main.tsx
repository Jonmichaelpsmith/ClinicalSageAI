import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Render the app with React 18 createRoot API
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);