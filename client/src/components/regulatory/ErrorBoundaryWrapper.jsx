import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

/**
 * Error Boundary Component for Regulatory Modules
 * 
 * Catches errors in child components to prevent the entire application from crashing.
 * Provides a fallback UI with an option to recover.
 */
class RegulatoryErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error("RegulatoryErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
    
    // Send to error tracking service if available
    if (window.errorTrackingService) {
      window.errorTrackingService.logError({
        component: 'RegulatoryModule',
        error,
        errorInfo
      });
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI for when an error occurs
      return (
        <div className="p-6 border rounded-lg bg-background">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Component Error</AlertTitle>
            <AlertDescription>
              A component in the regulatory module encountered an error.
            </AlertDescription>
          </Alert>
          
          <div className="bg-gray-50 p-4 rounded-md mb-4 max-h-[200px] overflow-auto">
            <p className="font-mono text-sm">
              {this.state.error && this.state.error.toString()}
            </p>
            {this.state.errorInfo && (
              <pre className="font-mono text-xs mt-2 text-gray-700">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
            <Button
              onClick={this.resetErrorBoundary}
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper component that adds error boundary protection
 * to any component in the regulatory module.
 */
export const withErrorBoundary = (Component) => {
  return (props) => (
    <RegulatoryErrorBoundary>
      <Component {...props} />
    </RegulatoryErrorBoundary>
  );
};

export default RegulatoryErrorBoundary;