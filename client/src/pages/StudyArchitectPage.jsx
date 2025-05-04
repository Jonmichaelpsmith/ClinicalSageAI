import React from 'react';
import { useLocation } from 'wouter';

// Import our centralized Study Architect implementation
import StudyArchitect from '../features/study-architect';

// This component now serves as a wrapper/redirect to the centralized implementation
export default function StudyArchitectPage() {
  return <StudyArchitect />;
}