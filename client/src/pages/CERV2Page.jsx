import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import our core components
import CerBuilderPanel from '@/components/cer/CerBuilderPanel';
import CerPreviewPanel from '@/components/cer/CerPreviewPanel';

/**
 * Backup implementation of the CER Generator page
 * This serves as a disaster recovery version if issues arise with the main implementation
 */
function CERV2Page_backup() {
  const [title, setTitle] = useState('Clinical Evaluation Report');
  const [faers, setFaers] = useState([]);
  const [comparators, setComparators] = useState([]);
  const [sections, setSections] = useState([]);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white p-4 rounded shadow border">
        <h2 className="text-xl font-bold mb-2">🧠 How to Use the CER Generator</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Select a section type and provide context</li>
          <li>Generate and add each needed section to your report</li>
          <li>Preview and export your complete CER as PDF or DOCX</li>
        </ol>
      </div>

      <CerBuilderPanel
        title={title}
        faers={faers}
        comparators={comparators}
        sections={sections}
        onTitleChange={setTitle}
        onSectionsChange={setSections}
        onFaersChange={setFaers}
        onComparatorsChange={setComparators}
      />

      <div className="border-t pt-6">
        <CerPreviewPanel
          title={title}
          faers={faers}
          comparators={comparators}
          sections={sections}
        />
      </div>
    </div>
  );
}

/**
 * CER Generator V2 Page
 * 
 * Streamlined interface for managing Clinical Evaluation Reports with
 * AI-powered section generation and live preview.
 */
function CERV2Page() {
  const { toast } = useToast();
  const [title, setTitle] = useState('Clinical Evaluation Report');
  const [faers, setFaers] = useState([]);
  const [comparators, setComparators] = useState([]);
  const [sections, setSections] = useState([]);
  
  // Product information - in production would come from context/API
  const productData = {
    id: 'PROD-12345',
    name: 'Enzymex Forte',
    manufacturer: 'PharmaPlus Therapeutics',
    reporting_period: "January 2024 - April 2025"
  };
  
  // Handle notification when sections are added or edited
  const handleSectionChange = (newSections) => {
    setSections(newSections);
    if (newSections.length > sections.length) {
      toast({
        title: "Section Added",
        description: "New section has been added to your report"
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white p-4 rounded shadow border">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          How to Use the CER Generator
        </h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Select a section type and provide context</li>
          <li>Generate and add each needed section to your report</li>
          <li>Preview and export your complete CER as PDF or DOCX</li>
        </ol>
      </div>

      <CerBuilderPanel
        title={title}
        faers={faers}
        comparators={comparators}
        sections={sections}
        onTitleChange={setTitle}
        onSectionsChange={handleSectionChange}
        onFaersChange={setFaers}
        onComparatorsChange={setComparators}
        productData={productData}
      />

      <div className="border-t pt-6">
        <CerPreviewPanel
          title={title}
          faers={faers}
          comparators={comparators}
          sections={sections}
        />
      </div>
    </div>
  );
};

export default CERV2Page;