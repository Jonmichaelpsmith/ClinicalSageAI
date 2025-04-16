import React from 'react';
import CERGenerator from '@/components/CERGenerator';
import { Separator } from '@/components/ui/separator';

/**
 * Clinical Evaluation Report (CER) Generator Page
 * 
 * This page provides a user interface for generating Clinical Evaluation Reports
 * based on FAERS (FDA Adverse Event Reporting System) data.
 */
const CERGeneratorPage = () => {
  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Clinical Evaluation Report Generator</h1>
        <p className="text-muted-foreground">
          Generate comprehensive Clinical Evaluation Reports (CERs) based on real-world data
          from the FDA Adverse Event Reporting System (FAERS). CERs help evaluate medical
          products, assess safety profiles, and maintain regulatory compliance.
        </p>
      </div>
      
      <Separator className="my-6" />
      
      <div className="mx-auto max-w-5xl">
        <CERGenerator />
      </div>
      
      <Separator className="my-8" />
      
      <div className="mx-auto max-w-5xl space-y-6 px-4">
        <h2 className="text-2xl font-semibold">About Clinical Evaluation Reports</h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">What is a CER?</h3>
            <p className="text-muted-foreground">
              A Clinical Evaluation Report (CER) is a document that collects and analyzes
              clinical data related to a medical device or pharmaceutical product. It is a critical
              component of regulatory compliance, particularly for medical devices under EU MDR
              and MEDDEV 2.7/1 Rev 4 regulations.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">What is FAERS?</h3>
            <p className="text-muted-foreground">
              The FDA Adverse Event Reporting System (FAERS) is a database that contains
              information on adverse events and medication error reports submitted to the FDA.
              This system is a vital tool for FDA's post-marketing safety surveillance of drug
              and biological products.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">How to Use the Generator</h3>
            <p className="text-muted-foreground">
              Enter a valid National Drug Code (NDC) and choose between Enhanced or Basic mode. 
              Enhanced mode uses AI to generate a comprehensive, professionally formatted report,
              while Basic mode provides a simpler output. You can then export the report as a PDF
              for documentation or regulatory submission purposes. Previous reports are saved for future reference.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Data Sources and Limitations</h3>
            <p className="text-muted-foreground">
              The generated reports use real-world data from FAERS. While comprehensive,
              this data may have limitations including reporting biases, varying quality of reports,
              and the voluntary nature of adverse event reporting. CERs should be interpreted
              within their full clinical context.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CERGeneratorPage;