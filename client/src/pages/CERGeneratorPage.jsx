import React from 'react';
import CERGenerator from "@/components/CERGenerator";

/**
 * Clinical Evaluation Report (CER) Generator Page
 */
const CERGeneratorPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Clinical Evaluation Report Generator
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        Generate comprehensive Clinical Evaluation Reports from FDA MAUDE, EUDAMED, and FAERS data sources
      </p>
      
      <CERGenerator />
    </div>
  );
};

export default CERGeneratorPage;