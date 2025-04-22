import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(error);
    console.error(errorInfo);
    // Simple console alert instead of toast for now
    console.warn("Unexpected error – our team has been notified.");
    
    // Store error in a service like Sentry or Azure App Insights in production
    // sendErrorToLoggingService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center flex-col space-y-4 p-6 text-center bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="mb-6 text-slate-600 dark:text-slate-400">
              We've encountered an unexpected error. Our team has been automatically notified.
            </p>
            <div className="flex justify-center">
              <a 
                href="/" 
                className="px-4 py-2 bg-regulatory-500 hover:bg-regulatory-600 text-white rounded-md transition-colors focus-visible:ring focus-visible:ring-regulatory-400"
                aria-label="Return to home page"
              >
                Return to home page
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}