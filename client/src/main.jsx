import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { DialogContextProvider } from './contexts/DialogContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DialogContextProvider>
      <App />
    </DialogContextProvider>
  </React.StrictMode>
);