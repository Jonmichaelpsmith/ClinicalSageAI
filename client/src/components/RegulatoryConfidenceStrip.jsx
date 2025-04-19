import React from 'react';
import { useTranslation } from '../i18n';

const RegulatoryConfidenceStrip = () => {
  const { t } = useTranslation();
  
  // Array of regulatory agency logos
  const agencies = [
    { id: 'fda', name: 'FDA', logo: '/logos/fda-gray.svg' },
    { id: 'ema', name: 'EMA', logo: '/logos/ema-gray.svg' },
    { id: 'mhra', name: 'MHRA', logo: '/logos/mhra-gray.svg' },
    { id: 'pmda', name: 'PMDA', logo: '/logos/pmda-gray.svg' },
    { id: 'nmpa', name: 'NMPA', logo: '/logos/nmpa-gray.svg' },
    { id: 'healthcanada', name: 'Health Canada', logo: '/logos/healthcanada-gray.svg' },
    { id: 'tga', name: 'TGA', logo: '/logos/tga-gray.svg' },
    { id: 'mfds', name: 'MFDS', logo: '/logos/mfds-gray.svg' },
  ];
  
  return (
    <section className="py-10 bg-gray-50 dark:bg-slate-900/30 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {t('Regulatory Confidence Worldwide')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {t('Our platform is compliant with global regulatory standards and regularly validated against requirements from these agencies.')}
        </p>
      </div>
      
      {/* Double-strip technique for infinite scrolling */}
      <div className="relative flex overflow-x-hidden">
        <div className="flex animate-scroll-slow whitespace-nowrap">
          {agencies.map(agency => (
            <div key={agency.id} className="flex items-center justify-center mx-8 h-20">
              <img 
                src={agency.logo} 
                alt={`${agency.name} logo`} 
                className="h-12 opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>
        
        {/* Duplicate set for seamless looping */}
        <div className="flex animate-scroll-slow whitespace-nowrap">
          {agencies.map(agency => (
            <div key={`${agency.id}-dup`} className="flex items-center justify-center mx-8 h-20">
              <img 
                src={agency.logo} 
                alt={`${agency.name} logo`} 
                className="h-12 opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RegulatoryConfidenceStrip;