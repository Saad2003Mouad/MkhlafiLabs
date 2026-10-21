import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './tokens.css';
import './styles/system.css';
import './styles/site.css';
import './styles/app.css';
import './styles/admin.css';
import './styles/sections-home.css';
import './styles/pages-public.css';
import './styles/auth.css';
import './styles/views-a.css';
import './styles/views-b.css';
import './styles/views-c.css';
import './styles/admin-page.css';
import './styles/motion.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
