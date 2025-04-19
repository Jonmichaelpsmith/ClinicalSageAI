// RegulatoryLogosInlineComponents.jsx
// React components with actual SVG logos + hover effect
import fdaLogo from '../assets/logos/fda.svg';
import emaLogo from '../assets/logos/ema.svg';
import mhraLogo from '../assets/logos/mhra.svg';
import pmdaLogo from '../assets/logos/pmda.svg';
import nmpaLogo from '../assets/logos/nmpa.svg';
import healthCanadaLogo from '../assets/logos/healthcanada.svg';
import tgaLogo from '../assets/logos/tga.svg';
import mfdsLogo from '../assets/logos/mfds.svg';
import ceLogo from '../assets/logos/ce.svg';
import whoLogo from '../assets/logos/who.svg';
import hipaaLogo from '../assets/logos/hipaa.svg';
import gdprLogo from '../assets/logos/gdpr.svg';
import isoLogo from '../assets/logos/iso.svg';

const base = "inline-block transition-all duration-200 opacity-70 hover:opacity-100 m-0.5";
const logoStyle = "h-6 w-auto filter grayscale hover:grayscale-0 transition-all";

export const FDA = () => (
  <div className={base} title="FDA (U.S.)">
    <img src={fdaLogo} alt="FDA" className={logoStyle} />
  </div>
);

export const EMA = () => (
  <div className={base} title="EMA (Europe)">
    <img src={emaLogo} alt="EMA" className={logoStyle} />
  </div>
);

export const MHRA = () => (
  <div className={base} title="MHRA (UK)">
    <img src={mhraLogo} alt="MHRA" className={logoStyle} />
  </div>
);

export const PMDA = () => (
  <div className={base} title="PMDA (Japan)">
    <img src={pmdaLogo} alt="PMDA" className={logoStyle} />
  </div>
);

export const NMPA = () => (
  <div className={base} title="NMPA (China)">
    <img src={nmpaLogo} alt="NMPA" className={logoStyle} />
  </div>
);

export const HealthCanada = () => (
  <div className={base} title="Health Canada">
    <img src={healthCanadaLogo} alt="Health Canada" className={logoStyle} />
  </div>
);

export const TGA = () => (
  <div className={base} title="TGA (Australia)">
    <img src={tgaLogo} alt="TGA" className={logoStyle} />
  </div>
);

export const MFDS = () => (
  <div className={base} title="MFDS (Korea)">
    <img src={mfdsLogo} alt="MFDS" className={logoStyle} />
  </div>
);

export const CE = () => (
  <div className={base} title="CE Mark (Europe)">
    <img src={ceLogo} alt="CE" className={logoStyle} />
  </div>
);

export const WHO = () => (
  <div className={base} title="WHO (World Health Organization)">
    <img src={whoLogo} alt="WHO" className={logoStyle} />
  </div>
);

export const HIPAA = () => (
  <div className={base} title="HIPAA Compliance (U.S.)">
    <img src={hipaaLogo} alt="HIPAA" className={logoStyle} />
  </div>
);

export const GDPR = () => (
  <div className={base} title="GDPR Compliance (EU)">
    <img src={gdprLogo} alt="GDPR" className={logoStyle} />
  </div>
);

export const ISO = () => (
  <div className={base} title="ISO 27001 Certification">
    <img src={isoLogo} alt="ISO" className={logoStyle} />
  </div>
);