import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";

// This is a simplified stub version that doesn't depend on API endpoints
const AnalyticalMethodsStubPage = () => {
  // Sample data for analytical methods
  const methods = [
    {
      id: 'method-1',
      code: 'HPLC-001',
      name: 'HPLC Assay for API X',
      category: 'Assay',
      technique: 'HPLC',
      status: 'Approved',
      validation: { status: 'Complete' },
      version: '1.2'
    },
    {
      id: 'method-2',
      code: 'DISS-002',
      name: 'Dissolution Test for Product Y Tablets',
      category: 'Dissolution',
      technique: 'UV Spectroscopy',
      status: 'Approved',
      validation: { status: 'Complete' },
      version: '1.0'
    },
    {
      id: 'method-3',
      code: 'KFT-003',
      name: 'Karl Fischer Titration for Water Content',
      category: 'Water Content',
      technique: 'Titration',
      status: 'In Development',
      validation: { status: 'In Progress' },
      version: '0.2'
    }
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytical Method Repository</h1>
          <p className="text-muted-foreground">
            Manage and track analytical methods, validation status, and transfer activities
          </p>
        </div>
        <Button asChild>
          <Link href="/analytical/new-method">
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Method
          </Link>
        </Button>
      </div>
      
      <Separator className="my-6" />
      
      <Card>
        <CardHeader>
          <CardTitle>Analytical Methods</CardTitle>
          <CardDescription>
            Showing {methods.length} methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Code</th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Technique</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Validation</th>
                  <th className="text-left py-3 px-4">Version</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {methods.map((method) => (
                  <tr key={method.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono">{method.code}</td>
                    <td className="py-3 px-4 font-medium">{method.name}</td>
                    <td className="py-3 px-4">{method.category}</td>
                    <td className="py-3 px-4">{method.technique}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        method.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                        method.status === 'In Development' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {method.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        method.validation.status === 'Complete' ? 'bg-green-100 text-green-800' :
                        method.validation.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {method.validation.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">v{method.version}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" asChild>
                        <Link href={`/analytical/methods/${method.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticalMethodsStubPage;