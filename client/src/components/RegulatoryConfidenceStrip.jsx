import React from "react";
import {
  FDA, EMA, MHRA, PMDA, NMPA, HealthCanada, TGA, MFDS,
  CE, WHO, HIPAA, GDPR, ISO
} from './RegulatoryLogosInlineComponents';

const regulatory = [FDA, EMA, MHRA, PMDA, NMPA, HealthCanada, TGA, MFDS];
const compliance = [CE, WHO, HIPAA, GDPR, ISO];

export default function RegulatoryConfidenceStrip() {
  return (
    <div className="bg-gray-50 dark:bg-slate-800 py-6 overflow-hidden border-t border-gray-200 dark:border-slate-700">
      <div className="max-w-6xl mx-auto">
        <div className="text-center text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-6">
          Mastering global regulatory standards across every jurisdiction
        </div>
        
        <div className="flex flex-col items-center space-y-8 px-6 pb-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Regulatory Agencies</div>
          <div className="flex gap-10 flex-wrap justify-center">
            {regulatory.map((Logo, i) => <Logo key={`reg-${i}`} />)}
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-6">Global Compliance Standards</div>
          <div className="flex gap-10 flex-wrap justify-center">
            {compliance.map((Logo, i) => <Logo key={`com-${i}`} />)}
          </div>
        </div>
      </div>
    </div>
  );
}