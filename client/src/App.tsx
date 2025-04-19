// App.tsx – routing update to use buyer‑centric HomeLanding
import React from 'react';
// Using stub instead of react-router-dom until dependencies are fixed
import { BrowserRouter as Router, Routes, Route } from './stub-router-dom';

// Import pages
import HomeLanding from './pages/HomeLanding';
import ChatAssistant from './pages/ChatAssistant';

// Toaster component for notifications
import { Toaster } from "@/components/ui/toaster";

// Import blank pages for navigation testing
const NotFound = () => <div>404 - Page Not Found</div>;
const CERDashboard = () => <div>CER Dashboard</div>;
const IndAutomationPage = () => <div>IND Automation</div>;
const CSRLibrary = () => <div>CSR Library</div>;
const DemoPage = () => <div>Demo Page</div>;
const ROICalculator = () => <div>ROI Calculator</div>;

export default function App() {
  return (
    <Router>
      <Routes>
        {/* === Main landing page route === */}
        <Route path="/" element={<HomeLanding />} />

        {/* === Placeholder routes === */}
        <Route path="/cer-dashboard" element={<CERDashboard />} />
        <Route path="/ind-automation" element={<IndAutomationPage />} />
        <Route path="/csr-library" element={<CSRLibrary />} />
        <Route path="/chat-assistant" element={<ChatAssistant />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/roi" element={<ROICalculator />} />

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}