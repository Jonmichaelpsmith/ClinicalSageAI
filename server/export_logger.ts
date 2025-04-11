import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'data/logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const LOG_PATH = path.join(logsDir, 'export_actions.jsonl');

/**
 * Log an export action to the export_actions.jsonl file
 */
export const logExportAction = (
  action: {
    user_id: string; 
    protocol_id: string;
    report_type: string;
    report_details?: any;
    success_rate?: number;
    version?: string;
    file_path?: string;
  }
) => {
  try {
    const logEntry = {
      ...action,
      timestamp: new Date().toISOString()
    };
    
    // Append to log file
    fs.appendFileSync(LOG_PATH, JSON.stringify(logEntry) + '\n');
    
    return true;
  } catch (error) {
    console.error('Error logging export action:', error);
    return false;
  }
};

/**
 * Get export logs for specific user or all users within a time range
 */
export const getExportLogs = (
  options: {
    user_id?: string;
    since?: Date;
    until?: Date;
    limit?: number;
  } = {}
) => {
  try {
    if (!fs.existsSync(LOG_PATH)) {
      return [];
    }
    
    const { user_id, since, until, limit } = options;
    const now = new Date();
    const sinceDate = since || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago
    const untilDate = until || now;
    
    const logs = fs.readFileSync(LOG_PATH, 'utf8')
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => JSON.parse(line))
      .filter(log => {
        const logTime = new Date(log.timestamp);
        return (
          logTime >= sinceDate && 
          logTime <= untilDate && 
          (!user_id || log.user_id === user_id)
        );
      });
    
    if (limit && logs.length > limit) {
      return logs.slice(0, limit);
    }
    
    return logs;
  } catch (error) {
    console.error('Error reading export logs:', error);
    return [];
  }
};