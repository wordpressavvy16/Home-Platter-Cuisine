import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './providers/AuthProvider';
import { CartProvider } from './providers/CartProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { ChatbotProvider } from './providers/ChatbotProvider';
import { register } from './registerServiceWorker';
import ErrorBoundary from './components/ErrorBoundary';

const main = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Critical Error: Could not find root element. The DOM may not have loaded correctly.");
    document.body.innerHTML = '<div style="text-align: center; padding: 40px;"><h1>Critical Error</h1><p>Application could not start: Root element not found.</p></div>';
    return;
  }

  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <ChatbotProvider>
                <App />
              </ChatbotProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );

  // Register the service worker to enable PWA capabilities
  register();
};

main();