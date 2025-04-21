import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const WelcomeAnimation = ({ onComplete, skipAnimation }) => {
  const [show, setShow] = useState(!skipAnimation);
  
  useEffect(() => {
    if (!skipAnimation) {
      // Auto-hide the animation after 5 seconds
      const timer = setTimeout(() => {
        handleComplete();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [skipAnimation]);
  
  const handleComplete = () => {
    setShow(false);
    // Small delay to allow exit animation to complete
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 500);
  };
  
  if (skipAnimation) {
    return null;
  }
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              transition: { delay: 0.2, duration: 0.5 }
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl"
          >
            <motion.div
              initial={{ rotate: -180, scale: 0.2 }}
              animate={{ 
                rotate: 0, 
                scale: 1,
                transition: { 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.3
                }
              }}
              className="mx-auto mb-6 w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-12 h-12 text-blue-600" />
            </motion.div>
            
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: 1,
                transition: { delay: 0.5, duration: 0.4 }
              }}
              className="text-3xl font-bold mb-4 text-gray-900"
            >
              Welcome to TrialSage
            </motion.h1>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: 1,
                transition: { delay: 0.7, duration: 0.4 }
              }}
              className="text-gray-600 mb-6"
            >
              Your intelligent clinical regulatory platform for accelerated submissions
            </motion.p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: 1,
                transition: { delay: 0.9, duration: 0.4 }
              }}
            >
              <Button 
                onClick={handleComplete}
                className="bg-blue-600 hover:bg-blue-700 transition-colors"
                size="lg"
              >
                Get Started
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeAnimation;