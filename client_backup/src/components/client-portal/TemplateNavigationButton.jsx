/**
 * Template Navigation Button Component
 * 
 * This component provides a navigation button for accessing the
 * client-specific template library from the client portal.
 */
import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { LayoutTemplate, ChevronRight } from 'lucide-react';

export default function TemplateNavigationButton() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start">
        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
          <LayoutTemplate className="h-6 w-6 text-indigo-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-indigo-800 flex items-center">
            Document Templates
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">New</span>
          </h2>
          <p className="text-gray-600 text-sm mt-1 mb-3">
            Create, manage, and use personalized templates for your regulatory submissions
          </p>
          <Button
            size="sm"
            onClick={() => setLocation('/client-portal/templates')}
            className="flex items-center text-sm"
          >
            Access Templates
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}