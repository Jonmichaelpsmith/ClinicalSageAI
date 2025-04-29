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
const ComparabilityStudiesStubPage = () => {
  // Sample data for comparability studies
  const studies = [
    {
      id: 'comp-1',
      name: 'Method Transfer for HPLC Assay - Site A to Site B',
      description: 'Method transfer of HPLC assay for Product X from Development Lab (Site A) to QC Lab (Site B)',
      methodName: 'HPLC Assay for API X',
      type: 'Method Transfer',
      status: 'Complete',
      startDate: '2025-01-15'
    },
    {
      id: 'comp-2',
      name: 'Product Comparability - Formulation Change',
      description: 'Comparability study for Product Y Cream - New excipient supplier',
      referenceBatch: 'BATCH-2025-002',
      type: 'Product Comparability',
      status: 'In Progress',
      startDate: '2025-03-10'
    },
    {
      id: 'comp-3',
      name: 'Site Transfer - Product Z Manufacturing',
      description: 'Process comparability for transfer of Product Z manufacturing from Site A to Site B',
      referenceBatch: 'BATCH-2024-157',
      type: 'Site Transfer',
      status: 'Draft',
      startDate: null
    }
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comparability Studies</h1>
          <p className="text-muted-foreground">
            Track method transfers and product comparability assessments
          </p>
        </div>
        <Button asChild>
          <Link href="/comparability/new-study">
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Study
          </Link>
        </Button>
      </div>
      
      <Separator className="my-6" />
      
      <Card>
        <CardHeader>
          <CardTitle>Comparability Studies</CardTitle>
          <CardDescription>
            Showing {studies.length} studies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Method/Product</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Start Date</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {studies.map((study) => (
                  <tr key={study.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{study.name}</td>
                    <td className="py-3 px-4">{study.type}</td>
                    <td className="py-3 px-4">{study.methodName || study.referenceBatch || "N/A"}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        study.status === 'Complete' ? 'bg-green-100 text-green-800' : 
                        study.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        study.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {study.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        {study.startDate || "Not started"}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button variant="ghost" asChild>
                        <Link href={`/comparability/studies/${study.id}`}>View</Link>
                      </Button>
                      {study.status === 'Complete' && (
                        <Button variant="outline" asChild>
                          <Link href={`/comparability/studies/${study.id}/report`}>Report</Link>
                        </Button>
                      )}
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

export default ComparabilityStudiesStubPage;