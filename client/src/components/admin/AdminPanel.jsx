import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Database, Download, BarChart, Settings } from 'lucide-react';

export default function AdminPanel() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Advanced Administration Tools</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5 text-blue-600" />
              Database Management
            </CardTitle>
            <CardDescription>
              Perform database maintenance and optimization tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Database Configuration
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="mr-2 h-4 w-4" />
              Backup Database
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="mr-2 h-5 w-5 text-purple-600" />
              System Analytics
            </CardTitle>
            <CardDescription>
              Monitor system performance and usage metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <BarChart className="mr-2 h-4 w-4" />
              View System Metrics
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <AlertCircle className="mr-2 h-4 w-4" />
              Error Logs
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">
          <AlertCircle className="inline-block mr-2 h-4 w-4" />
          Advanced administration tools require careful usage and can affect system stability.
        </p>
      </div>
    </div>
  );
}