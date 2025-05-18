import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';

/**
 * Error Boundary Component
 * 
 * This component catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 * 
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
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
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to application monitoring service if available
    if (window.appMonitor && typeof window.appMonitor.logError === 'function') {
      window.appMonitor.logError(error, errorInfo);
    }
  }
  
  /**
   * Reset the error boundary state
   */
  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Call onReset callback if provided
    if (this.props.onReset && typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
  };

  render() {
    const { fallback, title, description, showHomeButton } = this.props;
    
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (fallback) {
        return typeof fallback === 'function' 
          ? fallback({ 
              error: this.state.error, 
              resetErrorBoundary: this.resetErrorBoundary 
            }) 
          : fallback;
      }
      
      // Default error UI
      return (
        <Card className="border-destructive/20 my-4">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" />
              {title || 'Something went wrong'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground text-sm">
              {description || 'An unexpected error occurred in this component.'}
            </p>
            
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="p-2 bg-muted/50 rounded text-xs font-mono overflow-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={this.resetErrorBoundary}
              className="text-xs"
            >
              <RotateCw className="mr-1 h-3.5 w-3.5" />
              Try Again
            </Button>
            
            {showHomeButton && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.href = '/'}
                className="text-xs"
              >
                Go Home
              </Button>
            )}
          </CardFooter>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;