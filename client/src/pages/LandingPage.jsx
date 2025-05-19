import React, { useEffect } from 'react';
import { Link } from 'wouter';

// This component displays the exact green-to-pink gradient landing page
export default function LandingPage() {
  useEffect(() => {
    // Redirect to the static landing page
    window.location.href = '/landing.html';
  }, []);

  return (
    <div>
      <p>Loading landing page...</p>
    </div>
  );
}