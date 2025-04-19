// RegulatoryLogosInlineComponents.jsx
// React components with optional hover color effect + CE + WHO badges

const base = "h-8 transition-all duration-200 opacity-70 hover:opacity-100";

export const FDA = () => (
  <div className={base} title="FDA (U.S.)">
    <svg viewBox="0 0 120 40" className="w-full h-full fill-gray-500 hover:fill-blue-600">
      <text x="0" y="30" fontSize="30" fontFamily="Helvetica">FDA</text>
    </svg>
  </div>
);

export const EMA = () => (
  <div className={base} title="EMA (Europe)">
    <svg viewBox="0 0 160 40" className="w-full h-full fill-gray-500 hover:fill-blue-500">
      <text x="0" y="30" fontSize="30" fontFamily="Helvetica">EMA</text>
    </svg>
  </div>
);

export const MHRA = () => (
  <div className={base} title="MHRA (UK)">
    <svg viewBox="0 0 160 40" className="w-full h-full fill-gray-500 hover:fill-indigo-500">
      <text x="0" y="30" fontSize="30" fontFamily="Helvetica">MHRA</text>
    </svg>
  </div>
);

export const PMDA = () => (
  <div className={base} title="PMDA (Japan)">
    <svg viewBox="0 0 160 40" className="w-full h-full fill-gray-500 hover:fill-pink-600">
      <text x="0" y="30" fontSize="30" fontFamily="Helvetica">PMDA</text>
    </svg>
  </div>
);

export const NMPA = () => (
  <div className={base} title="NMPA (China)">
    <svg viewBox="0 0 160 40" className="w-full h-full fill-gray-500 hover:fill-red-600">
      <text x="0" y="30" fontSize="30" fontFamily="Helvetica">NMPA</text>
    </svg>
  </div>
);

export const HealthCanada = () => (
  <div className={base} title="Health Canada">
    <svg viewBox="0 0 180 40" className="w-full h-full fill-gray-500 hover:fill-red-500">
      <text x="0" y="30" fontSize="20" fontFamily="Helvetica">Health Canada</text>
    </svg>
  </div>
);

export const TGA = () => (
  <div className={base} title="TGA (Australia)">
    <svg viewBox="0 0 160 40" className="w-full h-full fill-gray-500 hover:fill-yellow-500">
      <text x="0" y="30" fontSize="30" fontFamily="Helvetica">TGA</text>
    </svg>
  </div>
);

export const MFDS = () => (
  <div className={base} title="MFDS (Korea)">
    <svg viewBox="0 0 160 40" className="w-full h-full fill-gray-500 hover:fill-sky-500">
      <text x="0" y="30" fontSize="30" fontFamily="Helvetica">MFDS</text>
    </svg>
  </div>
);

export const CE = () => (
  <div className={base} title="CE Mark (Europe)">
    <svg viewBox="0 0 120 40" className="w-full h-full fill-gray-500 hover:fill-green-600">
      <text x="0" y="30" fontSize="26" fontFamily="Helvetica">CE</text>
    </svg>
  </div>
);

export const WHO = () => (
  <div className={base} title="WHO (World Health Organization)">
    <svg viewBox="0 0 200 40" className="w-full h-full fill-gray-500 hover:fill-blue-400">
      <text x="0" y="30" fontSize="24" fontFamily="Helvetica">WHO</text>
    </svg>
  </div>
);

export const HIPAA = () => (
  <div className={base} title="HIPAA Compliance (U.S.)">
    <svg viewBox="0 0 160 40" className="w-full h-full fill-gray-500 hover:fill-purple-500">
      <text x="0" y="30" fontSize="24" fontFamily="Helvetica">HIPAA</text>
    </svg>
  </div>
);

export const GDPR = () => (
  <div className={base} title="GDPR Compliance (EU)">
    <svg viewBox="0 0 160 40" className="w-full h-full fill-gray-500 hover:fill-blue-700">
      <text x="0" y="30" fontSize="24" fontFamily="Helvetica">GDPR</text>
    </svg>
  </div>
);

export const ISO = () => (
  <div className={base} title="ISO 27001 Certification">
    <svg viewBox="0 0 120 40" className="w-full h-full fill-gray-500 hover:fill-teal-600">
      <text x="0" y="30" fontSize="24" fontFamily="Helvetica">ISO</text>
    </svg>
  </div>
);