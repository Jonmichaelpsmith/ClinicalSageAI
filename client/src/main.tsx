import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import SimpleApp from './SimpleApp';

// Render the app with React 18 createRoot API
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>
);