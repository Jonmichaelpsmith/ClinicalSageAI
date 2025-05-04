import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('Study Architect Error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
          <Alert variant="destructive" className="max-w-2xl mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong in the Study Architect module</AlertTitle>
            <AlertDescription>
              {this.state.error && this.state.error.toString()}
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-4 mt-6">
            <Button 
              onClick={this.handleReset}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/client-portal'}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;