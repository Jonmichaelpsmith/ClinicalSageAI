import React, { useState, useEffect } from 'react';

export default function DebugInfo() {
  const [info, setInfo] = useState({
    route: window.location.pathname,
    time: new Date().toISOString(),
    screen: `${window.innerWidth}x${window.innerHeight}`,
    userAgent: navigator.userAgent,
    isConnected: navigator.onLine
  });
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setInfo(prev => ({
        ...prev,
        time: new Date().toISOString(),
        isConnected: navigator.onLine
      }));
    }, 1000);
    
    // Clean up
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  // Style for debug panel
  const style = {
    position: 'fixed',
    bottom: '10px',
    left: '10px',
    padding: '10px',
    background: 'rgba(0, 0, 0, 0.7)',
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: '12px',
    zIndex: 9999,
    borderRadius: '4px',
    maxWidth: '400px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
  };
  
  return (
    <div style={style}>
      <div><strong>Debug Info</strong></div>
      <div>Route: {info.route}</div>
      <div>Time: {info.time}</div>
      <div>Screen: {info.screen}</div>
      <div>Connected: {info.isConnected ? 'Yes' : 'No'}</div>
      <div style={{ fontSize: '10px', marginTop: '5px' }}>TrialSage/Concept2Cures.AI</div>
    </div>
  );
}