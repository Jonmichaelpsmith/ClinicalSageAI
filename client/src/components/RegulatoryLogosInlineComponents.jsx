// RegulatoryLogosInlineComponents.jsx
// React components with actual SVG logos + hover effect

const base = "inline-block transition-all duration-200 opacity-70 hover:opacity-100 m-0.5";
const logoStyle = "h-6 w-auto filter grayscale hover:grayscale-0 transition-all";

export const FDA = () => (
  <div className={base} title="FDA (U.S.)">
    <img src="/logos/fda.svg" alt="FDA" className={logoStyle + " hover:filter-none"} />
  </div>
);

export const EMA = () => (
  <div className={base} title="EMA (Europe)">
    <img src="/logos/ema.svg" alt="EMA" className={logoStyle} />
  </div>
);

export const MHRA = () => (
  <div className={base} title="MHRA (UK)">
    <img src="/logos/mhra.svg" alt="MHRA" className={logoStyle} />
  </div>
);

export const PMDA = () => (
  <div className={base} title="PMDA (Japan)">
    <img src="/logos/pmda.svg" alt="PMDA" className={logoStyle} />
  </div>
);

export const NMPA = () => (
  <div className={base} title="NMPA (China)">
    <img src="/logos/nmpa.svg" alt="NMPA" className={logoStyle} />
  </div>
);

export const HealthCanada = () => (
  <div className={base} title="Health Canada">
    <img src="/logos/healthcanada.svg" alt="Health Canada" className={logoStyle} />
  </div>
);

export const TGA = () => (
  <div className={base} title="TGA (Australia)">
    <img src="/logos/tga.svg" alt="TGA" className={logoStyle} />
  </div>
);

export const MFDS = () => (
  <div className={base} title="MFDS (Korea)">
    <img src="/logos/mfds.svg" alt="MFDS" className={logoStyle} />
  </div>
);

export const CE = () => (
  <div className={base} title="CE Mark (Europe)">
    <img src="/logos/ce.svg" alt="CE" className={logoStyle} />
  </div>
);

export const WHO = () => (
  <div className={base} title="WHO (World Health Organization)">
    <img src="/logos/who.svg" alt="WHO" className={logoStyle} />
  </div>
);

export const HIPAA = () => (
  <div className={base} title="HIPAA Compliance (U.S.)">
    <img src="/logos/hipaa.svg" alt="HIPAA" className={logoStyle} />
  </div>
);

export const GDPR = () => (
  <div className={base} title="GDPR Compliance (EU)">
    <img src="/logos/gdpr.svg" alt="GDPR" className={logoStyle} />
  </div>
);

export const ISO = () => (
  <div className={base} title="ISO 27001 Certification">
    <img src="/logos/iso.svg" alt="ISO" className={logoStyle} />
  </div>
);