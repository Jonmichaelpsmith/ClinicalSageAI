import React, { useState } from 'react';
import CerBuilderPanel from '@/components/cer/CerBuilderPanel';
import CerPreviewPanel from '@/components/cer/CerPreviewPanel';
import QAChecklistButton from '@/components/cer/QAChecklistButton';

export default function CERV2Page() {
  const [title, setTitle] = useState('Clinical Evaluation Report');
  const [faers, setFaers] = useState([]);
  const [comparators, setComparators] = useState([]);
  const [sections, setSections] = useState([]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">CER Generator</h1>
        <QAChecklistButton variant="outline" />
      </div>
      
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