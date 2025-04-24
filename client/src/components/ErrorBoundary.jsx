import React from 'react';

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
    console.error("Component Error:", error);
    console.error("Error Details:", errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      
      // If a custom fallback is provided, use it
      if (fallback) {
        return typeof fallback === 'function' 
          ? fallback(this.state.error, this.state.errorInfo)
          : fallback;
      }
      
      // Default fallback UI
      return (
        <div className="p-4 bg-white rounded shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-[#003057] mb-2">Something went wrong</h2>
          <p className="text-sm text-[#666] mb-4">
            This component couldn't be displayed. The issue has been logged.
          </p>
          {process.env.NODE_ENV !== 'production' && (
            <details className="text-xs p-2 bg-gray-50 rounded">
              <summary className="cursor-pointer font-medium">Technical Details</summary>
              <pre className="mt-2 whitespace-pre-wrap break-words">
                {this.state.error && this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;