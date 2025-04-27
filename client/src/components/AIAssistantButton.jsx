/**
 * AI Assistant Button
 * 
 * This component provides a floating button to access the AI assistant.
 * It appears in the bottom-right corner of the application.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X } from 'lucide-react';

const AIAssistantButton = ({ isOpen, onClick }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.button
        key={isOpen ? 'close' : 'open'}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:shadow-xl focus:outline-none"
        onClick={onClick}
        aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <>
            <Bot size={24} />
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </>
        )}
      </motion.button>
    </AnimatePresence>
  );
};

export default AIAssistantButton;