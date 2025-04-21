// WelcomeAnimation.jsx - Welcome animation using framer-motion
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, FileCheck, Database, LineChart } from 'lucide-react';

const WelcomeAnimation = ({ onComplete, skipAnimation = false }) => {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(!skipAnimation);
  
  // Animation steps sequence
  useEffect(() => {
    if (skipAnimation) {
      setVisible(false);
      return;
    }
    
    if (step === 0) {
      // Start the animation sequence
      const timer = setTimeout(() => setStep(1), 800);
      return () => clearTimeout(timer);
    } else if (step < 5) {
      // Move through steps 1-4
      const timer = setTimeout(() => setStep(step + 1), 1200);
      return () => clearTimeout(timer);
    } else if (step === 5) {
      // Final step, fade out after delay
      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, skipAnimation, onComplete]);
  
  if (skipAnimation) {
    return null;
  }
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-blue-800 to-blue-900 z-50 text-white"
        >
          <div className="w-full max-w-2xl px-6 text-center">
            {step >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <h1 className="text-4xl font-bold mb-4">Welcome to TrialSage</h1>
                <p className="text-xl text-blue-200">The Clinical Intelligence System That Thinks Like a Biotech Founder</p>
              </motion.div>
            )}
            
            {step >= 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center space-x-8 mb-10"
              >
                <div className="flex flex-col items-center">
                  <div className="bg-blue-600 p-4 rounded-full mb-3">
                    <FileCheck size={28} />
                  </div>
                  <p className="text-sm">2× faster INDs</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-blue-600 p-4 rounded-full mb-3">
                    <Database size={28} />
                  </div>
                  <p className="text-sm">90% less manual work</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-blue-600 p-4 rounded-full mb-3">
                    <LineChart size={28} />
                  </div>
                  <p className="text-sm">Save $2M per trial</p>
                </div>
              </motion.div>
            )}
            
            {step >= 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <p className="text-blue-100 mb-6">
                  Our platform streamlines multi-regional regulatory research with intelligent document validation and compliance mechanisms.
                </p>
              </motion.div>
            )}
            
            {step >= 4 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center"
              >
                <button 
                  className="flex items-center px-6 py-3 bg-white text-blue-800 rounded-full font-medium hover:bg-blue-50 transition-colors"
                  onClick={() => {
                    setStep(5);
                  }}
                >
                  <Play size={18} className="mr-2" />
                  Get Started
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeAnimation;