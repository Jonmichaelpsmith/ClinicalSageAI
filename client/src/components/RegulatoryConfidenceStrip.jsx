import React from "react";
import {
  FDA, EMA, MHRA, PMDA, NMPA, HealthCanada, TGA, MFDS, CE, WHO
} from './RegulatoryLogosInlineComponents';

const logos = [FDA, EMA, MHRA, PMDA, NMPA, HealthCanada, TGA, MFDS, CE, WHO];

export default function RegulatoryConfidenceStrip() {
  return (
    <div className="bg-gray-50 dark:bg-slate-800 py-6 overflow-hidden border-t border-gray-200 dark:border-slate-700">
      <div className="max-w-6xl mx-auto">
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-4">
          Mastering global regulatory standards across every jurisdiction
        </div>
        <div className="flex items-center gap-12 animate-scroll-slow whitespace-nowrap px-6">
          {[...logos, ...logos].map((Logo, i) => (
            <Logo key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}