/**
 * 510(k) Compliance Checker Component
 * 
 * This component provides an automated pre-submission quality check
 * to verify that a 510(k) submission complies with FDA regulations and
 * contains all required information.
 * 
 * This is a wrapper component that uses the ComplianceCheckerPanel component
 * for the actual implementation.
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ComplianceCheckerPanel from './ComplianceCheckerPanel';

/**
 * ComplianceChecker component
 * 
 * This is a wrapper around the ComplianceCheckerPanel component that handles
 * 510(k) submission compliance checking.
 * 
 * @param {Object} props - Component props
 * @param {string} props.projectId - The ID of the 510(k) project
 * @returns {JSX.Element} - Rendered component
 */
const ComplianceChecker = ({ projectId }) => {
  return (
    <Card>
      <CardContent className="p-0">
        <ComplianceCheckerPanel projectId={projectId} />
      </CardContent>
    </Card>
  );
};

export default ComplianceChecker;