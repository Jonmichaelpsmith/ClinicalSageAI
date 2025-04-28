// /client/src/components/ind-wizard/Module3NextButton.jsx

import { useLocation } from 'wouter';

export default function Module3NextButton({ formStatus, onValidationFail }) {
  const [location, navigate] = useLocation();

  const validateForm = () => {
    const requiredFields = [
      'drugSubstanceUploaded',
      'drugProductUploaded',
      'appendicesUploaded',
      'regionalInfoUploaded'
    ];
    
    const missingFields = requiredFields.filter(field => !formStatus[field]);
    
    if (missingFields.length > 0) {
      const fieldLabels = {
        drugSubstanceUploaded: 'Drug Substance Documentation',
        drugProductUploaded: 'Drug Product Documentation',
        appendicesUploaded: 'Appendices (GMP, Validation Reports)',
        regionalInfoUploaded: 'Regional Information'
      };
      
      const missingLabels = missingFields.map(field => fieldLabels[field]);
      onValidationFail(`Please complete the following sections before proceeding: ${missingLabels.join(', ')}`);
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      // Save form data if needed (optional)
      // Navigate to the next module
      navigate('/ind-wizard/module-4');
    }
  };

  return (
    <div className="flex justify-end mt-8">
      <button
        onClick={handleNext}
        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Next: Module 4 (Nonclinical) →
      </button>
    </div>
  );
}