import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Health Monitor Hook
 * 
 * This hook manages the connection to the health monitoring worker and handles
 * responding to application health events.
 */
export default function useHealthMonitor() {
  const [alarmActive, setAlarmActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const workerRef = useRef(null);

  // Initialize health monitor worker
  useEffect(() => {
    try {
      // Create a new worker
      const worker = new Worker('/src/workers/healthMonitor.worker.js', { type: 'module' });
      workerRef.current = worker;
      
      // Set up message handler
      worker.addEventListener('message', handleWorkerMessage);
      
      console.log('Connected to health monitor shared worker');
      
      // Clean up on unmount
      return () => {
        worker.removeEventListener('message', handleWorkerMessage);
        worker.terminate();
        workerRef.current = null;
      };
    } catch (error) {
      console.error('Failed to initialize health monitor worker:', error);
    }
  }, []);

  // Handle messages from the worker
  const handleWorkerMessage = useCallback((event) => {
    const { type, message, timestamp } = event.data;
    
    switch (type) {
      case 'ALARM_ACTIVATED':
        console.error(`🚨 APPLICATION ALARM ACTIVATED: ${message}`);
        setAlarmActive(true);
        setErrorMessage(message || 'The application is experiencing technical difficulties.');
        break;
        
      case 'ALARM_DEACTIVATED':
        console.log('Application alarm deactivated');
        setAlarmActive(false);
        setErrorMessage('');
        break;
        
      default:
        // Ignore unknown message types
        break;
    }
  }, []);

  // Request an immediate health check
  const checkHealth = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'CHECK_NOW' });
    }
  }, []);

  // Reset the alarm state
  const resetAlarm = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'RESET_ALARM' });
    }
    setAlarmActive(false);
    setErrorMessage('');
  }, []);

  // Restart the application server
  const restartServer = useCallback(() => {
    // Show a loading indicator
    setErrorMessage('Attempting to restart the server...');
    
    // Make a request to restart the server
    fetch('/api/restart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ force: true })
    })
    .then(response => {
      if (response.ok) {
        // Wait a moment and then reset the alarm
        setTimeout(() => {
          resetAlarm();
          checkHealth();
        }, 5000);
      } else {
        setErrorMessage('Failed to restart the server. Manual intervention required.');
      }
    })
    .catch(error => {
      console.error('Failed to restart server:', error);
      setErrorMessage('Failed to restart the server. Network error occurred.');
    });
  }, [resetAlarm, checkHealth]);

  return {
    alarmActive,
    errorMessage,
    checkHealth,
    resetAlarm,
    restartServer
  };
}