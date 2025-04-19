import React from "react";
import {
  FDA, EMA, MHRA, PMDA, NMPA, HealthCanada, TGA, MFDS,
  CE, WHO, HIPAA, GDPR, ISO,
  ASCO, NIH, ESMO, CDC, EPA, HHS, ICH
} from './RegulatoryLogosInlineComponents';

const regulatory = [FDA, EMA, MHRA, PMDA, NMPA, HealthCanada, TGA, MFDS];
const compliance = [CE, WHO, HIPAA, GDPR, ISO];
const compatible = [ASCO, NIH, ESMO, CDC, EPA, HHS, ICH];

export default function RegulatoryConfidenceStrip() {
  return (
    <div className="bg-gray-50 dark:bg-slate-800 py-3 overflow-hidden border-t border-gray-200 dark:border-slate-700 mt-0">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-3">
          Mastering global regulatory standards
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
          <div className="border-r border-gray-200 dark:border-gray-700 pr-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">Regulatory Agencies</div>
            <div className="flex flex-wrap justify-center gap-3">
              {regulatory.map((Logo, i) => <Logo key={`reg-${i}`} />)}
            </div>
          </div>
          
          <div className="pl-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">Compliance Standards</div>
            <div className="flex flex-wrap justify-center gap-3">
              {compliance.map((Logo, i) => <Logo key={`com-${i}`} />)}
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">Compatible With Standards From</div>
          <div className="flex flex-wrap justify-center gap-3">
            {compatible.map((Logo, i) => <Logo key={`comp-${i}`} />)}
          </div>
        </div>
      </div>
    </div>
  );
}