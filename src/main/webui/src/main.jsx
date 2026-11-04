import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import './responsive.css';
import { AuthProvider } from './store/AuthContext.jsx';
import { getLegacyRoute } from './utils/routing.js';

const legacyRoute = getLegacyRoute(window.location.href);
if (legacyRoute) window.history.replaceState(window.history.state, '', legacyRoute);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
