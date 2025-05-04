import React from 'react';
import { useLocation } from 'wouter';

// Import the original working Study Architect module
import StudyArchitect from '../modules/StudyArchitect';

// This component serves as a wrapper around Study Architect module
export default function StudyArchitectPage() {
  return <StudyArchitect />;
}