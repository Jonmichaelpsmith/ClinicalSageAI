import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WelcomeAnimation({ onComplete, skipAnimation = false }) {
  const [isVisible, setIsVisible] = useState(!skipAnimation);
  
  useEffect(() => {
    if (!skipAnimation) {
      // Automatically hide the animation after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [skipAnimation, onComplete]);
  
  if (skipAnimation) return null;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-blue-900 flex items-center justify-center z-50"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              TrialSage
            </h1>
            <motion.p 
              className="text-xl text-blue-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              The Clinical Intelligence System That Thinks Like a Biotech Founder
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}