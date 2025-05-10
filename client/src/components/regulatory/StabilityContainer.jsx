/**
 * Regulatory Module Stability Container
 * 
 * This is a specialized error boundary specifically for the regulatory submission components
 * which have been causing application crashes. It acts as a stability container
 * that prevents component failures from affecting the rest of the application.
 * 
 * CRITICAL STABILITY COMPONENT - DO NOT MODIFY WITHOUT THOROUGH TESTING
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

class RegulatoryStabilityContainer extends React.Component {
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
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("RegulatoryStabilityContainer caught error:", error);
    console.error(errorInfo);
    
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
      lastErrorTime: new Date().toISOString()
    }));
    
    // Store error information in localStorage for diagnostics
    try {
      const errorLog = {
        component: 'RegulatoryModule',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        componentStack: errorInfo.componentStack
      };
      const existingLogs = JSON.parse(localStorage.getItem('regulatory_errors') || '[]');
      existingLogs.push(errorLog);
      // Keep only the last 10 errors
      if (existingLogs.length > 10) {
        existingLogs.shift();
      }
      localStorage.setItem('regulatory_errors', JSON.stringify(existingLogs));
    } catch (e) {
      // Ignore storage errors
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white p-6 rounded-lg border border-red-100 shadow-sm">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-500 mr-3" />
            <h2 className="text-lg font-semibold text-gray-800">Regulatory Module Error</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            The regulatory submissions module has encountered an error. This error has been contained and
            will not affect other parts of the application.
          </p>
          
          <div className="bg-amber-50 border border-amber-100 rounded p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Technical Note:</strong> The regulatory module has been isolated to maintain application stability.
              You can continue using other application features without interruption.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={this.resetError}
              className="flex-1 flex items-center justify-center"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Regulatory Module
            </Button>
            
            <Button 
              onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center"
              variant="outline"
            >
              Refresh Page
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/'}
              className="flex-1 flex items-center justify-center"
              variant="ghost"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>
          </div>
          
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="mt-6 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-32 border border-gray-200">
              <div className="text-red-600 font-mono">{this.state.error.toString()}</div>
              {this.state.errorInfo && (
                <pre className="text-gray-700 mt-2 text-xs">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default RegulatoryStabilityContainer;