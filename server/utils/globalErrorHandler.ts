/**
 * Global Error Handler
 * 
 * Sets up process-level error handlers to prevent the entire application
 * from crashing due to unhandled exceptions or promise rejections.
 * 
 * CRITICAL STABILITY COMPONENT - DO NOT MODIFY WITHOUT THOROUGH TESTING
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize global error handlers
 */
export function setupGlobalErrorHandlers() {
  // Ensure error logs directory exists
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const errorLogFile = path.join(logsDir, 'uncaught_errors.log');

  // Handler for uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    const timestamp = new Date().toISOString();
    const errorMessage = `[${timestamp}] UNCAUGHT EXCEPTION: ${error.message}\n${error.stack}\n\n`;
    
    console.error('\x1b[31m%s\x1b[0m', errorMessage);
    
    // Write to log file
    fs.appendFileSync(errorLogFile, errorMessage);
    
    // Don't exit the process in production to keep the application running
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

  // Handler for unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    const timestamp = new Date().toISOString();
    const errorMessage = `[${timestamp}] UNHANDLED REJECTION: ${reason instanceof Error ? reason.stack : JSON.stringify(reason)}\n\n`;
    
    console.error('\x1b[31m%s\x1b[0m', errorMessage);
    
    // Write to log file
    fs.appendFileSync(errorLogFile, errorMessage);
    
    // Don't exit the process in production to keep the application running
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

  // Log startup with timestamp
  const startupMessage = `[${new Date().toISOString()}] Global error handlers initialized\n`;
  fs.appendFileSync(errorLogFile, startupMessage);
  
  console.log('Global error handlers initialized');
}

export default setupGlobalErrorHandlers;