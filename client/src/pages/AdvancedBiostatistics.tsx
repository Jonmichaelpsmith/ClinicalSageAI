import React from 'react';
import AdvancedBiostatisticsPanel from '@/components/biostatistics/AdvancedBiostatisticsPanel';
import AppLayout from '@/components/layout/AppLayout';

const AdvancedBiostatistics: React.FC = () => {
  return (
    <AppLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <AdvancedBiostatisticsPanel />
      </div>
    </AppLayout>
  );
};

export default AdvancedBiostatistics;