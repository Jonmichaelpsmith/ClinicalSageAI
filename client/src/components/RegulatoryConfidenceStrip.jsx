import React from 'react';
import { useTranslation } from "../i18n";

const agencies = [
  { name: 'FDA', src: '/logos/fda-gray.svg', alt: 'FDA (U.S.)' },
  { name: 'EMA', src: '/logos/ema-gray.svg', alt: 'EMA (Europe)' },
  { name: 'MHRA', src: '/logos/mhra-gray.svg', alt: 'MHRA (UK)' },
  { name: 'PMDA', src: '/logos/pmda-gray.svg', alt: 'PMDA (Japan)' },
  { name: 'NMPA', src: '/logos/nmpa-gray.svg', alt: 'NMPA (China)' },
  { name: 'Health Canada', src: '/logos/healthcanada-gray.svg', alt: 'Health Canada' },
  { name: 'TGA', src: '/logos/tga-gray.svg', alt: 'TGA (Australia)' },
  { name: 'MFDS', src: '/logos/mfds-gray.svg', alt: 'MFDS (Korea)' },
];

export default function RegulatoryConfidenceStrip() {
  const { t } = useTranslation();
  
  return (
    <div className="bg-gray-50 dark:bg-slate-800 py-6 overflow-hidden border-t border-gray-200 dark:border-slate-700">
      <div className="max-w-6xl mx-auto">
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-4">
          {t('Trusted by global regulatory agencies')}
        </div>
        <div className="whitespace-nowrap flex animate-scroll-slow items-center gap-12 px-6">
          {agencies.concat(agencies).map((agency, i) => (
            <img
              key={i}
              src={agency.src}
              alt={agency.alt}
              className="h-8 opacity-70 grayscale hover:opacity-90 transition"
              draggable="false"
            />
          ))}
        </div>
      </div>
    </div>
  );
}