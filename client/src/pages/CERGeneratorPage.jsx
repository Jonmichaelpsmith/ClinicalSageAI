import React from 'react';
import CERGenerator from '../components/CERGenerator';
import { Card } from '@/components/ui/card';

const CERGeneratorPage = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
        Clinical Evaluation Report (CER) Generator
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8">
          <Card className="p-6">
            <CERGenerator />
          </Card>
        </div>
        
        <div className="md:col-span-4">
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-3">About CER</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Clinical Evaluation Reports (CERs) are structured documents that summarize and 
              analyze adverse event and safety data from the FDA's FAERS database.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Enter an NDC code in the generator to automatically produce a comprehensive 
              CER that analyzes the safety profile and clinical significance of the product.
            </p>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-3">Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Enter a valid NDC (National Drug Code) for a pharmaceutical product</li>
              <li>Click "Generate CER" to retrieve and analyze FAERS data</li>
              <li>Review the generated report or request a PDF version</li>
              <li>Export or save the report as needed</li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CERGeneratorPage;