// RegulatoryLogosInlineComponents.jsx
// React components with optional hover color effect + CE + WHO badges

const base = "inline-block transition-all duration-200 opacity-70 hover:opacity-100 m-0.5";

const badgeStyle = "bg-gray-500 hover:bg-blue-600 text-white text-[10px] font-medium py-0.5 px-1.5 rounded-sm transition-colors";

export const FDA = () => (
  <div className={base} title="FDA (U.S.)">
    <div className={badgeStyle.replace("blue-600", "blue-600")}>FDA</div>
  </div>
);

export const EMA = () => (
  <div className={base} title="EMA (Europe)">
    <div className={badgeStyle.replace("blue-600", "blue-500")}>EMA</div>
  </div>
);

export const MHRA = () => (
  <div className={base} title="MHRA (UK)">
    <div className={badgeStyle.replace("blue-600", "indigo-500")}>MHRA</div>
  </div>
);

export const PMDA = () => (
  <div className={base} title="PMDA (Japan)">
    <div className={badgeStyle.replace("blue-600", "pink-600")}>PMDA</div>
  </div>
);

export const NMPA = () => (
  <div className={base} title="NMPA (China)">
    <div className={badgeStyle.replace("blue-600", "red-600")}>NMPA</div>
  </div>
);

export const HealthCanada = () => (
  <div className={base} title="Health Canada">
    <div className={badgeStyle.replace("blue-600", "red-500")}>HC</div>
  </div>
);

export const TGA = () => (
  <div className={base} title="TGA (Australia)">
    <div className={badgeStyle.replace("blue-600", "yellow-500")}>TGA</div>
  </div>
);

export const MFDS = () => (
  <div className={base} title="MFDS (Korea)">
    <div className={badgeStyle.replace("blue-600", "sky-500")}>MFDS</div>
  </div>
);

export const CE = () => (
  <div className={base} title="CE Mark (Europe)">
    <div className={badgeStyle.replace("blue-600", "green-600")}>CE</div>
  </div>
);

export const WHO = () => (
  <div className={base} title="WHO (World Health Organization)">
    <div className={badgeStyle.replace("blue-600", "blue-400")}>WHO</div>
  </div>
);

export const HIPAA = () => (
  <div className={base} title="HIPAA Compliance (U.S.)">
    <div className={badgeStyle.replace("blue-600", "purple-500")}>HIPAA</div>
  </div>
);

export const GDPR = () => (
  <div className={base} title="GDPR Compliance (EU)">
    <div className={badgeStyle.replace("blue-600", "blue-700")}>GDPR</div>
  </div>
);

export const ISO = () => (
  <div className={base} title="ISO 27001 Certification">
    <div className={badgeStyle.replace("blue-600", "teal-600")}>ISO</div>
  </div>
);