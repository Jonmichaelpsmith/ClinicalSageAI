import React from 'react';

/**
 * Global error boundary to prevent app-wide crashes
 * Catches JavaScript errors in children components and displays a fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("Application Error:", error);
    console.error("Error Details:", errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
          <div className="max-w-md mx-auto bg-white p-8 rounded shadow-md border border-gray-200">
            <h1 className="text-xl font-semibold text-[#003057] mb-4 text-center">Application Error</h1>
            <p className="text-[#666] mb-6 text-center">
              Something went wrong. Please refresh the page or try again later.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => window.location.reload()} 
                className="bg-[#0078d4] hover:bg-[#005fa6] text-white px-5 py-2.5 rounded text-sm font-medium"
              >
                Refresh Application
              </button>
            </div>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="mt-6 p-4 bg-gray-50 rounded text-xs overflow-auto">
                <h3 className="font-medium mb-2">Error Details (Development Only):</h3>
                <pre>{this.state.error.toString()}</pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;