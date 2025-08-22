import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import config from './config/environment';

// Log environment info for debugging (non-production only)
if (!config.isProduction) {
  console.log('BookerHQ Environment:', config.environment);
  console.log('Table Prefix:', config.api.tablePrefix);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
