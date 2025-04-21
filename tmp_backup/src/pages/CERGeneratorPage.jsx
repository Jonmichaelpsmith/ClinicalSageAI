import React from 'react';
import CERGenerator from '@/components/CERGenerator';

const CERGeneratorPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Clinical Evaluation Report Generator
        </h1>
        <p className="text-muted-foreground">
          Generate regulatory-compliant reports by connecting to FDA MAUDE, FDA FAERS, and EU EUDAMED databases
        </p>
      </div>
      
      <div className="grid grid-cols-1">
        <CERGenerator />
      </div>
      
      <div className="mt-8 bg-muted/30 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">About Clinical Evaluation Reports</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Clinical Evaluation Reports (CERs) are essential documents for medical device manufacturers 
            to demonstrate compliance with regulatory requirements. They compile and analyze clinical data 
            to evaluate the safety and performance of medical devices.
          </p>
          <p>
            Our CER Generator automatically collects data from three key regulatory databases:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>FDA MAUDE (Manufacturer and User Facility Device Experience) - Tracks device adverse events</li>
            <li>FDA FAERS (FDA Adverse Event Reporting System) - Monitors drug adverse events</li>
            <li>EU EUDAMED (European Database on Medical Devices) - European vigilance data</li>
          </ul>
          <p>
            The generated reports include integrated data analysis, trend identification, and risk assessments
            in regulatory-compliant formats suitable for submission.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CERGeneratorPage;