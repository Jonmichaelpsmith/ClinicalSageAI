import React from 'react';
import { useNavigate } from 'wouter';
import CoauthorModule from '../components/coauthor/CoauthorModule';

export default function CoauthorPage() {
  const navigate = useNavigate();
  return <CoauthorModule />;
}