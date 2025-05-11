import React from 'react';

/**
 * Global Error Boundary
 * 
 * CRITICAL STABILITY COMPONENT: This error boundary prevents the entire 
 * application from crashing when rendering errors occur in React components.
 * 
 * This is a critical part of the application's stability measures and should
 * not be removed or modified without thorough testing.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log detailed error information
    console.error("Application Error:", error);
    console.error("Error Details:", errorInfo);
    
    // Update error state with additional tracking information
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
      lastErrorTime: new Date().toISOString()
    }));
    
    // Store error information in localStorage for diagnostic purposes
    try {
      const errorLog = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        componentStack: errorInfo.componentStack
      };
      localStorage.setItem('last_react_error', JSON.stringify(errorLog));
    } catch (e) {
      // Ignore storage errors to avoid recursion
    }
  }
  
  // Method to allow recovery without full page reload
  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  // Method to navigate to home safely
  navigateHome = () => {
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      // Check if we should show technical details (not in production)
      const isDevEnvironment = process.env.NODE_ENV !== 'production';
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
          <div className="max-w-md mx-auto bg-white p-8 rounded shadow-md border border-red-100">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-[#003057]">Application Error</h1>
            </div>
            
            <p className="text-[#666] mb-4">
              We encountered a problem displaying this section of the application. 
              You can try:
            </p>
            
            <ul className="list-disc pl-5 mb-6 text-[#666] space-y-1">
              <li>Refreshing the page</li>
              <li>Returning to the home page</li>
              <li>Trying the recovery option</li>
            </ul>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <button 
                onClick={() => window.location.reload()} 
                className="flex-1 bg-[#0078d4] hover:bg-[#005fa6] text-white px-3 py-2 rounded text-sm font-medium"
              >
                Refresh Page
              </button>
              <button 
                onClick={this.navigateHome}
                className="flex-1 bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#4b5563] px-3 py-2 rounded text-sm font-medium"
              >
                Go to Home
              </button>
              <button 
                onClick={this.resetError}
                className="flex-1 bg-[#4b5563] hover:bg-[#374151] text-white px-3 py-2 rounded text-sm font-medium"
              >
                Try Recovery
              </button>
            </div>
            
            {isDevEnvironment && this.state.error && (
              <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200 text-xs overflow-auto max-h-40">
                <h3 className="font-medium mb-2 text-gray-700">Error Details (Development Only):</h3>
                <div className="text-red-600 font-mono">{this.state.error.toString()}</div>
                {this.state.errorInfo && (
                  <pre className="text-gray-700 mt-2 text-xs">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export { ErrorBoundary };
export default ErrorBoundary;