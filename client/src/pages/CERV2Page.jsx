import React, { useState } from 'react';
import CerBuilderPanel from '@/components/cer/CerBuilderPanel';

// Global compliance threshold constants
const COMPLIANCE_THRESHOLDS = {
  OVERALL_THRESHOLD: 0.8, // 80% overall compliance required to pass
  FLAG_THRESHOLD: 0.7,    // 70% section threshold for flagging issues
};

export default function CERV2Page() {
  const [title, setTitle] = useState('Clinical Evaluation Report');
  const [faers, setFaers] = useState([]);
  const [comparators, setComparators] = useState([]);
  const [sections, setSections] = useState([]);
  
  return (
    <div className="p-4">
      <CerBuilderPanel
        title={title}
        faers={faers}
        comparators={comparators}
        sections={sections}
        onTitleChange={setTitle}
        onSectionsChange={setSections}
        onFaersChange={setFaers}
        onComparatorsChange={setComparators}
        complianceThresholds={COMPLIANCE_THRESHOLDS}
      />
    </div>
  );
}