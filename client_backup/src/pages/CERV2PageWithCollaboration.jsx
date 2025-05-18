import React from 'react';
import OptimizedCollaborationLayout from '@/components/layout/OptimizedCollaborationLayout';
import CERV2Page from './CERV2Page';

/**
 * CERV2PageWithCollaboration
 * 
 * This component wraps the existing CERV2Page with the optimized collaboration layout,
 * providing collaborative features without impacting the performance of the large
 * component.
 */
const CERV2PageWithCollaboration = () => {
  return (
    <OptimizedCollaborationLayout>
      <CERV2Page />
    </OptimizedCollaborationLayout>
  );
};

export default CERV2PageWithCollaboration;