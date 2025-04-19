import React from "react";

const agencies = [
  { name: "FDA", src: "/logos/fda-gray.svg", alt: "FDA (U.S.)" },
  { name: "EMA", src: "/logos/ema-gray.svg", alt: "EMA (Europe)" },
  { name: "MHRA", src: "/logos/mhra-gray.svg", alt: "MHRA (UK)" },
  { name: "PMDA", src: "/logos/pmda-gray.svg", alt: "PMDA (Japan)" },
  { name: "NMPA", src: "/logos/nmpa-gray.svg", alt: "NMPA (China)" },
  { name: "Health Canada", src: "/logos/healthcanada-gray.svg", alt: "Health Canada" },
  { name: "TGA", src: "/logos/tga-gray.svg", alt: "TGA (Australia)" },
  { name: "MFDS", src: "/logos/mfds-gray.svg", alt: "MFDS (Korea)" },
];

export default function RegulatoryConfidenceStrip() {
  return (
    <div className="bg-gray-50 dark:bg-slate-800 py-6 overflow-hidden border-t border-gray-200 dark:border-slate-700">
      <div className="max-w-6xl mx-auto">
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-4">
          Mastering global regulatory standards across every jurisdiction
        </div>
        <div className="flex items-center gap-12 animate-scroll-slow whitespace-nowrap px-6">
          {[...agencies, ...agencies].map((agency, i) => (
            <img
              key={i}
              src={agency.src}
              alt={agency.alt}
              className="h-9 grayscale opacity-70 hover:opacity-90 transition-all duration-200"
              loading="lazy"
              draggable="false"
            />
          ))}
        </div>
      </div>
    </div>
  );
}