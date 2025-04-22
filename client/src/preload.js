// preload.js - Will be injected into the document head before anything else loads
// This prevents flashing by forcing a stable UI before React even mounts

(function() {
  // Force documents to render with stable styles before React loads
  const style = document.createElement('style');
  style.id = 'anti-flash-styles';
  style.textContent = `
    /* Anti-flash layer - covers entire viewport */
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #fff;
      z-index: 99999;
      pointer-events: none;
      opacity: 1;
      transition: opacity 0.5s ease-in-out;
    }
    
    /* Only remove the anti-flash layer when CSS class is added */
    body.app-loaded::before {
      opacity: 0;
    }

    /* Completely disable all animations and transitions to prevent flashing */
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
    }
    
    /* Force scrollbar to always appear to prevent layout shifts */
    html {
      overflow-y: scroll !important;
    }
    
    /* Prevent Vite HMR flashing */
    .vite-error-overlay, #vite-overlay {
      display: none !important;
    }
  `;
  
  // Check if document exists (client-side)
  if (typeof document !== 'undefined') {
    // Insert at the very beginning of the head to ensure it loads first
    if (document.head) {
      document.head.insertBefore(style, document.head.firstChild);
    } else {
      // If head doesn't exist yet, wait for DOMContentLoaded and insert
      window.addEventListener('DOMContentLoaded', () => {
        document.head.insertBefore(style, document.head.firstChild);
      });
    }
    
    // Intercept Vite's WebSocket connection to prevent HMR from causing flashing
    const originalWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols) {
      if (url && url.includes('vite')) {
        // Create a mock WebSocket that doesn't actually connect
        return {
          send: () => {},
          close: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          readyState: 3, // CLOSED
          CONNECTING: 0,
          OPEN: 1,
          CLOSING: 2,
          CLOSED: 3
        };
      }
      // Allow non-Vite WebSockets to connect normally
      return new originalWebSocket(url, protocols);
    };
    
    // Inform the app that preload is complete
    window.__PRELOAD_COMPLETE__ = true;
  }
})();