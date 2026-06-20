import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import './index.css'
import App from './App.jsx'

// Global Error Handler (moved from inline script for CSP compliance)
window.onerror = function (message, source, lineno, colno, error) {
  if (message && message.includes('Script error')) return;
  console.error("APPLICATION CRASH:", message, error);
  
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; background: #fff5f5; color: #c53030; font-family: sans-serif; border: 1px solid #fed7d7; margin: 20px; border-radius: 8px; max-width: 600px; margin: 40px auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h1 style="font-size: 20px; margin-top: 0; border-bottom: 1px solid #fed7d7; padding-bottom: 10px;">Application Crash</h1>
        <p style="margin: 10px 0;"><strong>Error:</strong> ${message}</p>
        <p style="margin: 10px 0; font-size: 14px; color: #742a2a;"><strong>Source:</strong> ${source || 'unknown'} (Line ${lineno || '?'}, Col ${colno || '?'})</p>
        ${error && error.stack ? `<pre style="background: #fff; padding: 12px; border: 1px solid #e2e8f0; overflow: auto; max-height: 250px; font-family: monospace; font-size: 12px; border-radius: 4px; color: #4a5568;">${error.stack}</pre>` : ''}
        <button onclick="window.location.reload()" style="margin-top: 15px; padding: 8px 16px; background: #c53030; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">Reload Page</button>
      </div>
    `;
  }
};

window.onunhandledrejection = function (event) {
  console.error("UNHANDLED REJECTION:", event.reason);
  const root = document.getElementById('root');
  if (root) {
    const errorMsg = event.reason?.message || String(event.reason);
    const errorStack = event.reason?.stack || '';
    root.innerHTML = `
      <div style="padding: 20px; background: #fff5f5; color: #c53030; font-family: sans-serif; border: 1px solid #fed7d7; margin: 20px; border-radius: 8px; max-width: 600px; margin: 40px auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h1 style="font-size: 20px; margin-top: 0; border-bottom: 1px solid #fed7d7; padding-bottom: 10px;">Unhandled Rejection</h1>
        <p style="margin: 10px 0;"><strong>Reason:</strong> ${errorMsg}</p>
        ${errorStack ? `<pre style="background: #fff; padding: 12px; border: 1px solid #e2e8f0; overflow: auto; max-height: 250px; font-family: monospace; font-size: 12px; border-radius: 4px; color: #4a5568;">${errorStack}</pre>` : ''}
        <button onclick="window.location.reload()" style="margin-top: 15px; padding: 8px 16px; background: #c53030; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">Reload Page</button>
      </div>
    `;
  }
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
