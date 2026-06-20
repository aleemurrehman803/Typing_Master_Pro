import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import './index.css'
import App from './App.jsx'

// Global Error Handler (moved from inline script for CSP compliance)
window.onerror = function (message, source, lineno, colno, error) {
  if (message.length && message.includes('Script error')) return;
  console.error("APPLICATION CRASH:", message, error);
};


/**
 * Main Entry Point
 * Renders the React application into the root DOM element.
 * Wrapped in StrictMode for additional development checks.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
