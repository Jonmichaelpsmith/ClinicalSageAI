import React, { Component } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Error Boundary Component
 * 
 * This component catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 * 
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
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
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });

    // If an onError callback is provided, call it
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetErrorBoundary = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });

    // If an onReset callback is provided, call it
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      // You can render any custom fallback UI
      if (fallback) {
        return typeof fallback === 'function' 
          ? fallback({ error, resetErrorBoundary: this.resetErrorBoundary })
          : fallback;
      }

      return (
        <Card className="w-full shadow-md border-destructive/20">
          <CardHeader className="bg-destructive/10">
            <CardTitle className="text-destructive flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-muted-foreground">
              {error?.message ? (
                <p className="mb-4">{error.message}</p>
              ) : (
                <p className="mb-4">An unexpected error occurred. Please try again.</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={this.resetErrorBoundary} className="flex items-center">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return children;
  }
}

export default ErrorBoundary;