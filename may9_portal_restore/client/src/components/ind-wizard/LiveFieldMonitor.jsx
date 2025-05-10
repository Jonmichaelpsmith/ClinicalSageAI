// /client/src/components/ind-wizard/LiveFieldMonitor.jsx

import { useEffect, useState, useCallback, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import GuidanceModal from './GuidanceModal';

// Simulated API response data based on user input
const simulateApiResponse = (formData) => {
  // This is a simplified simulation - in a real app, this would be an API call
  const recommendations = [];
  let confidenceScore = 100;
  
  // Check sponsor name
  if (!formData.sponsorName) {
    recommendations.push({
      type: 'error',
      message: 'Sponsor name is missing. Required per 21 CFR 312.23(a)(1)(i).',
      link: 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-D/part-312'
    });
    confidenceScore -= 15;
  }
  
  // Check address
  if (!formData.address) {
    recommendations.push({
      type: 'warning',
      message: 'Sponsor address is missing. Required per 21 CFR 312.23(a)(1)(i).',
      link: 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-D/part-312'
    });
    confidenceScore -= 10;
  }
  
  // Check FDA forms
  if (!formData.fdaFormsUploaded) {
    recommendations.push({
      type: 'error',
      message: 'FDA Forms 1571/3674 not uploaded. Filing incomplete under IND regulations.',
      link: 'https://www.fda.gov/media/78118/download'
    });
    confidenceScore -= 20;
  }
  
  // Check Investigator Brochure
  if (!formData.ibUploaded) {
    recommendations.push({
      type: 'warning',
      message: 'Investigator Brochure not uploaded. Required per 21 CFR 312.23(a)(5).',
      link: 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-D/part-312#312.23'
    });
    confidenceScore -= 10;
  }
  
  // If non-US company, check US Agent info
  if (formData.isNonUSCompany && !formData.usAgentInfo) {
    recommendations.push({
      type: 'error',
      message: 'U.S. Agent information is required for non-U.S. sponsors. See 21 CFR 312.23(a)(1)(iv).',
      link: 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-D/part-312#312.23'
    });
    confidenceScore -= 15;
  }
  
  // Ensure score doesn't go below 0
  confidenceScore = Math.max(0, confidenceScore);
  
  return {
    confidenceScore,
    recommendations
  };
};

export default function LiveFieldMonitor({ formData }) {
  const [guidanceData, setGuidanceData] = useState({
    recommendations: [],
    confidenceScore: 0
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const requestTimeoutRef = useRef(null);
  const { toast } = useToast();
  
  // Debounce function to prevent too many API calls
  const debouncedCheckRegulatory = useCallback((currentFormData) => {
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }
    
    requestTimeoutRef.current = setTimeout(async () => {
      try {
        // In a real app, this would be an API call to the backend
        // const response = await apiRequest('POST', '/api/ind-wizard/check-regulatory-compliance', {
        //   module: 'Module 1 - Sponsor Information',
        //   fields: currentFormData
        // });
        // const data = await response.json();
        
        // Instead, we're using a simulated response
        const data = simulateApiResponse(currentFormData);
        
        setGuidanceData(data);
      } catch (error) {
        console.error('Error assessing section:', error);
        toast({
          title: 'Assessment Failed',
          description: 'Unable to analyze this section. Please try again.',
          variant: 'destructive'
        });
      }
    }, 1000); // 1-second debounce
  }, [toast]);
  
  // Trigger regulatory check when form data changes
  useEffect(() => {
    if (formData) {
      debouncedCheckRegulatory(formData);
    }
    
    // Clean up timeout on unmount
    return () => {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
    };
  }, [formData, debouncedCheckRegulatory]);
  
  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <GuidanceModal
      recommendations={guidanceData.recommendations}
      confidenceScore={guidanceData.confidenceScore}
      minimized={isMinimized}
      onToggleMinimize={handleToggleMinimize}
    />
  );
}