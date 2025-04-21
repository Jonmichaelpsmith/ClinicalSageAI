// App.tsx – simplified version for debugging
import React from 'react';
import { Route, Switch } from 'wouter';
import HomeLandingEnhanced from './pages/HomeLandingEnhanced';
import ErrorBoundary from './ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Switch>
        <Route path="/">
          <ErrorBoundary>
            <HomeLandingEnhanced />
          </ErrorBoundary>
        </Route>
        <Route>
          <ErrorBoundary>
            <HomeLandingEnhanced />
          </ErrorBoundary>
        </Route>
      </Switch>
    </ErrorBoundary>
  );
}