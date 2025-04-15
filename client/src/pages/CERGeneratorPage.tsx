import React from 'react';
import CERGenerator from '../components/CERGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CERGeneratorPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">FDA FAERS Integration</h1>
        <p className="text-lg text-muted-foreground">
          Generate Clinical Evaluation Reports from FDA Adverse Event Reporting System data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CERGenerator />
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>About FDA FAERS Integration</CardTitle>
              <CardDescription>
                Understanding the FDA Adverse Event Reporting System
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">What is FAERS?</h3>
                <p className="text-sm text-muted-foreground">
                  The FDA Adverse Event Reporting System (FAERS) is a database that contains information on adverse 
                  event and medication error reports submitted to FDA for drugs and therapeutic biological products.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">How to Use This Tool</h3>
                <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-2">
                  <li>Enter a valid NDC (National Drug Code) in the input field</li>
                  <li>Click "Generate CER" to retrieve and analyze FAERS data</li>
                  <li>Review the generated Clinical Evaluation Report</li>
                  <li>The report follows MEDDEV 2.7/1 Rev. 4 guidelines</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">NDC Code Format</h3>
                <p className="text-sm text-muted-foreground">
                  NDC codes are 10-digit or 11-digit numbers that identify the labeler, product, and package size, 
                  typically in one of these formats: XXXX-XXXX-XX or XXXXX-XXX-XX.
                </p>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> This tool uses OpenAI's GPT-4 model to generate report narratives based on actual 
                  FDA FAERS data. The generated reports should be reviewed by qualified personnel before use in 
                  regulatory submissions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CERGeneratorPage;