/**
 * Structured Logging Utility
 * 
 * This module provides standardized logging with structured metadata
 * to improve observability and debugging capabilities.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Request, Response } from 'express';

// Log levels enum for type safety
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Interface for structured log entries
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  service: string;
  hostname: string;
  pid: number;
  [key: string]: any;
}

// Configurable log settings
const LOG_SETTINGS = {
  serviceName: 'trialsage',
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  logToConsole: true,
  logToFile: true,
  logDirectory: path.join(process.cwd(), 'logs'),
  maxFileSize: 10 * 1024 * 1024, // 10 MB
  maxFiles: 10
};

// Ensure log directory exists
if (LOG_SETTINGS.logToFile) {
  if (!fs.existsSync(LOG_SETTINGS.logDirectory)) {
    try {
      fs.mkdirSync(LOG_SETTINGS.logDirectory, { recursive: true });
    } catch (err) {
      console.error(`Failed to create log directory: ${err}`);
      LOG_SETTINGS.logToFile = false;
    }
  }
}

// Hostname for distributed tracing
const hostname = os.hostname();

/**
 * Format log entry as JSON string
 */
function formatLogEntry(level: LogLevel, message: string, context?: Record<string, any>): string {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: context || {},
    service: LOG_SETTINGS.serviceName,
    hostname,
    pid: process.pid
  };
  
  return JSON.stringify(logEntry);
}

/**
 * Write log to file with rotation
 */
function writeToFile(formattedLog: string): void {
  if (!LOG_SETTINGS.logToFile) return;
  
  const today = new Date().toISOString().split('T')[0];
  const logFile = path.join(LOG_SETTINGS.logDirectory, `trialsage-${today}.log`);
  
  try {
    // Check if file exists and needs rotation
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      if (stats.size >= LOG_SETTINGS.maxFileSize) {
        // Rotate file by adding timestamp to filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        fs.renameSync(logFile, `${logFile}.${timestamp}`);
        
        // Clean up old logs if exceeding maxFiles
        const logFiles = fs.readdirSync(LOG_SETTINGS.logDirectory)
          .filter(file => file.startsWith('trialsage-'))
          .sort((a, b) => {
            const statsA = fs.statSync(path.join(LOG_SETTINGS.logDirectory, a));
            const statsB = fs.statSync(path.join(LOG_SETTINGS.logDirectory, b));
            return statsB.mtime.getTime() - statsA.mtime.getTime();
          });
          
        if (logFiles.length > LOG_SETTINGS.maxFiles) {
          logFiles.slice(LOG_SETTINGS.maxFiles).forEach(file => {
            fs.unlinkSync(path.join(LOG_SETTINGS.logDirectory, file));
          });
        }
      }
    }
    
    // Append log to file
    fs.appendFileSync(logFile, formattedLog + '\n');
  } catch (err) {
    console.error(`Failed to write to log file: ${err}`);
  }
}

/**
 * Write to console with appropriate color and formatting
 */
function writeToConsole(level: LogLevel, formattedLog: string): void {
  if (!LOG_SETTINGS.logToConsole) return;
  
  const logObj = JSON.parse(formattedLog);
  const timestamp = logObj.timestamp;
  const message = logObj.message;
  const context = JSON.stringify(logObj.context);
  
  let consoleMethod: 'log' | 'info' | 'warn' | 'error';
  let prefix: string;
  
  switch (level) {
    case LogLevel.DEBUG:
      consoleMethod = 'log';
      prefix = '\x1b[34mDEBUG\x1b[0m'; // Blue
      break;
    case LogLevel.INFO:
      consoleMethod = 'info';
      prefix = '\x1b[32mINFO\x1b[0m'; // Green
      break;
    case LogLevel.WARN:
      consoleMethod = 'warn';
      prefix = '\x1b[33mWARN\x1b[0m'; // Yellow
      break;
    case LogLevel.ERROR:
    case LogLevel.CRITICAL:
      consoleMethod = 'error';
      prefix = level === LogLevel.ERROR 
        ? '\x1b[31mERROR\x1b[0m' // Red
        : '\x1b[41m\x1b[37mCRITICAL\x1b[0m'; // White on red background
      break;
    default:
      consoleMethod = 'log';
      prefix = '\x1b[37mLOG\x1b[0m'; // White
  }
  
  console[consoleMethod](`${timestamp} ${prefix} ${message}${context !== '{}' ? ` ${context}` : ''}`);
}

/**
 * Checks if the log level should be processed
 */
function shouldLog(level: LogLevel): boolean {
  const levels = Object.values(LogLevel);
  const minLevelIndex = levels.indexOf(LOG_SETTINGS.minLevel);
  const currentLevelIndex = levels.indexOf(level);
  
  return currentLevelIndex >= minLevelIndex;
}

/**
 * Main logging function
 */
function log(level: LogLevel, message: string, context?: Record<string, any>): void {
  if (!shouldLog(level)) return;
  
  const formattedLog = formatLogEntry(level, message, context);
  
  if (LOG_SETTINGS.logToConsole) {
    writeToConsole(level, formattedLog);
  }
  
  if (LOG_SETTINGS.logToFile) {
    writeToFile(formattedLog);
  }
}

// Exported logger object
export const logger = {
  debug: (message: string, context?: Record<string, any>) => log(LogLevel.DEBUG, message, context),
  info: (message: string, context?: Record<string, any>) => log(LogLevel.INFO, message, context),
  warn: (message: string, context?: Record<string, any>) => log(LogLevel.WARN, message, context),
  error: (message: string, context?: Record<string, any>) => log(LogLevel.ERROR, message, context),
  critical: (message: string, context?: Record<string, any>) => log(LogLevel.CRITICAL, message, context),
  
  // Track API requests with timing
  request: (req: Request, res: Response, startTime: number) => {
    const duration = Date.now() - startTime;
    const context = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    };
    
    // Log at different levels based on response status
    if (res.statusCode >= 500) {
      log(LogLevel.ERROR, `API Request ${req.method} ${req.path} failed with ${res.statusCode}`, context);
    } else if (res.statusCode >= 400) {
      log(LogLevel.WARN, `API Request ${req.method} ${req.path} returned ${res.statusCode}`, context);
    } else {
      log(LogLevel.INFO, `API Request ${req.method} ${req.path} completed successfully`, context);
    }
  }
};