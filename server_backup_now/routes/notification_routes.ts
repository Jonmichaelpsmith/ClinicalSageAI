import { Express, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { logExportAction, getExportLogs } from '../export_logger';

// Setup NodeMailer or similar email service here in a real implementation
// For now, we're creating a mock function
async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<boolean> {
  console.log(`[MOCK EMAIL] Sending email to ${to}`);
  console.log(`[MOCK EMAIL] Subject: ${subject}`);
  console.log(`[MOCK EMAIL] Body: ${text.substring(0, 100)}...`);
  
  // In a real implementation, we would use a service like SendGrid or NodeMailer
  // For now, just log and return success
  return true;
}

export default function registerNotificationRoutes(app: Express): void {
  /**
   * Send a weekly digest email to the user
   */
  app.post('/api/notify/send-weekly-digest', async (req: Request, res: Response) => {
    try {
      const { user_id, user_email } = req.body;
      
      if (!user_id || !user_email) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: user_id, user_email'
        });
      }
      
      // Get user preferences (or use defaults)
      const userPrefs = await getUserPreferences(user_id);
      
      // Generate digest content based on logs and preferences
      const digestContent = await generateWeeklyDigest(user_id, userPrefs);
      
      // Send the email
      const emailSuccess = await sendEmail(
        user_email,
        'Your TrialSage Weekly Digest',
        digestContent, // Plain text version
        generateHtmlDigest(digestContent) // HTML version
      );
      
      if (emailSuccess) {
        // Log the export action
        await logExportAction({
          userId: user_id.toString(),
          actionType: 'send_digest',
          objectId: new Date().toISOString(),
          objectName: 'Weekly Digest',
          objectType: 'digest',
          timestamp: new Date(),
          metadata: {
            email: user_email,
            preferences: userPrefs
          }
        });
        
        res.json({
          success: true,
          message: 'Weekly digest sent successfully'
        });
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending weekly digest:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send weekly digest'
      });
    }
  });
  
  /**
   * Get digest data for a specific user
   */
  app.post('/api/digest/get-data', async (req: Request, res: Response) => {
    try {
      const { user_id } = req.body;
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: user_id'
        });
      }
      
      // Get user preferences (or use defaults)
      const userPrefs = await getUserPreferences(user_id);
      
      // Generate digest content based on logs and preferences
      const digestContent = await generateWeeklyDigest(user_id, userPrefs);
      
      res.json({
        success: true,
        digest: digestContent,
        preferences: userPrefs
      });
    } catch (error) {
      console.error('Error getting digest data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get digest data'
      });
    }
  });
  
  /**
   * Save user preferences for weekly digest
   */
  app.post('/api/user/save-digest-prefs', async (req: Request, res: Response) => {
    try {
      const { user_id, prefs } = req.body;
      
      if (!user_id || !prefs) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: user_id, prefs'
        });
      }
      
      // Save preferences to database or file
      const saveSuccess = await saveUserPreferences(user_id, prefs);
      
      if (saveSuccess) {
        res.json({
          success: true,
          message: 'Preferences saved successfully'
        });
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving digest preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save digest preferences'
      });
    }
  });
  
  /**
   * Get user preferences for weekly digest
   */
  app.get('/api/user/preferences', async (req: Request, res: Response) => {
    try {
      const user_id = req.query.user_id as string;
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: user_id'
        });
      }
      
      // Get preferences from database or file
      const prefs = await getUserPreferences(user_id);
      
      res.json({
        success: true,
        prefs
      });
    } catch (error) {
      console.error('Error getting digest preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get digest preferences'
      });
    }
  });
  
  /**
   * Send a notification when a protocol comparison is ready
   */
  app.post('/api/notify/send-comparison-notification', async (req: Request, res: Response) => {
    try {
      const { user_id, user_email, protocol_id, version, file_path } = req.body;
      
      if (!user_id || !user_email || !protocol_id) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: user_id, user_email, protocol_id'
        });
      }
      
      // Get protocol details
      const protocol = await getProtocolDetails(protocol_id);
      
      const emailSubject = `Protocol Comparison Ready: ${protocol.title || 'New Comparison'}`;
      const emailText = `
Your protocol comparison is ready for viewing.

Protocol: ${protocol.title || 'Untitled'}
Indication: ${protocol.indication || 'N/A'}
Phase: ${protocol.phase || 'N/A'}
Version: ${version || 'N/A'}

You can view the comparison in your TrialSage dashboard or download the attached PDF.
      `.trim();
      
      // Send the email
      const emailSuccess = await sendEmail(
        user_email,
        emailSubject,
        emailText
      );
      
      if (emailSuccess) {
        // Log the export action
        await logExportAction({
          userId: user_id.toString(),
          actionType: 'send_comparison_notification',
          objectId: protocol_id.toString(),
          objectName: protocol.title || 'Protocol Comparison',
          objectType: 'notification',
          timestamp: new Date(),
          metadata: {
            email: user_email,
            protocolId: protocol_id,
            version,
            filePath: file_path
          }
        });
        
        res.json({
          success: true,
          message: 'Comparison notification sent successfully'
        });
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending comparison notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send comparison notification'
      });
    }
  });
}

// Helper functions

/**
 * Save user preferences to file or database
 */
async function saveUserPreferences(
  userId: string,
  preferences: any
): Promise<boolean> {
  try {
    const prefsDir = path.join(__dirname, '..', '..', 'data', 'user_preferences');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(prefsDir)) {
      fs.mkdirSync(prefsDir, { recursive: true });
    }
    
    const prefsFile = path.join(prefsDir, `user_${userId}_prefs.json`);
    fs.writeFileSync(prefsFile, JSON.stringify(preferences, null, 2));
    
    return true;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return false;
  }
}

/**
 * Get user preferences from file or database
 */
async function getUserPreferences(userId: string): Promise<any> {
  try {
    const prefsFile = path.join(__dirname, '..', '..', 'data', 'user_preferences', `user_${userId}_prefs.json`);
    
    if (fs.existsSync(prefsFile)) {
      const prefsData = fs.readFileSync(prefsFile, 'utf8');
      return JSON.parse(prefsData);
    }
    
    // Return default preferences if no file exists
    return {
      include_exports: true,
      include_risk_changes: true,
      include_version_changes: true,
      include_sap: false,
      risk_change_threshold: 10
    };
  } catch (error) {
    console.error('Error getting user preferences:', error);
    // Return default preferences on error
    return {
      include_exports: true,
      include_risk_changes: true,
      include_version_changes: true,
      include_sap: false,
      risk_change_threshold: 10
    };
  }
}

/**
 * Get protocol details from database
 */
async function getProtocolDetails(protocolId: string): Promise<any> {
  try {
    // In a real implementation, this would query the database
    // For now, return mock data
    return {
      id: protocolId,
      title: 'Phase 3 Study of Drug XYZ for Treatment of Condition ABC',
      indication: 'Condition ABC',
      phase: 'Phase 3',
      sponsor: 'Pharma Company Ltd.'
    };
  } catch (error) {
    console.error('Error getting protocol details:', error);
    return {
      id: protocolId,
      title: 'Unknown Protocol',
      indication: 'Unknown',
      phase: 'Unknown',
      sponsor: 'Unknown'
    };
  }
}

/**
 * Generate weekly digest content based on user activity
 */
async function generateWeeklyDigest(userId: string, preferences: any): Promise<string> {
  try {
    // Get user activity logs from the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const logs = await getExportLogs(userId, {
      since: oneWeekAgo
    });
    
    if (!logs || logs.length === 0) {
      return `
Hello TrialSage User,

You have no activity to report in your weekly digest.

As you use TrialSage to analyze protocols and generate reports, 
your activity will appear here in your weekly digest.

Best Regards,
The TrialSage Team
      `.trim();
    }
    
    // Count activities by type
    const reportExports = logs.filter(log => 
      log.actionType === 'export_pdf' && 
      preferences.include_exports
    );
    
    const protocolAnalyses = logs.filter(log => 
      log.actionType === 'upload_protocol'
    );
    
    const protocolComparisons = logs.filter(log => 
      log.actionType === 'export_comparison' && 
      preferences.include_version_changes
    );
    
    // Generate digest content
    let content = `
Hello TrialSage User,

Here's your weekly summary of activity in TrialSage:

`;
    
    if (reportExports.length > 0) {
      content += `Reports Exported: ${reportExports.length}\n\n`;
      
      for (const log of reportExports.slice(0, 5)) {
        content += `- ${log.objectName} (${new Date(log.timestamp!).toLocaleDateString()})\n`;
      }
      
      if (reportExports.length > 5) {
        content += `- And ${reportExports.length - 5} more...\n`;
      }
      
      content += '\n';
    }
    
    if (protocolAnalyses.length > 0) {
      content += `Protocols Analyzed: ${protocolAnalyses.length}\n\n`;
      
      for (const log of protocolAnalyses.slice(0, 5)) {
        content += `- ${log.objectName} (${new Date(log.timestamp!).toLocaleDateString()})\n`;
      }
      
      if (protocolAnalyses.length > 5) {
        content += `- And ${protocolAnalyses.length - 5} more...\n`;
      }
      
      content += '\n';
    }
    
    if (protocolComparisons.length > 0) {
      content += `Protocol Comparisons: ${protocolComparisons.length}\n\n`;
      
      for (const log of protocolComparisons.slice(0, 5)) {
        content += `- ${log.objectName} (${new Date(log.timestamp!).toLocaleDateString()})\n`;
      }
      
      if (protocolComparisons.length > 5) {
        content += `- And ${protocolComparisons.length - 5} more...\n`;
      }
      
      content += '\n';
    }
    
    content += `
Best Regards,
The TrialSage Team

---
You can customize your digest preferences in your TrialSage dashboard.
    `.trim();
    
    return content;
  } catch (error) {
    console.error('Error generating weekly digest:', error);
    return `
Hello TrialSage User,

We were unable to generate your weekly digest due to a technical issue.
Please try again later or contact support if the problem persists.

Best Regards,
The TrialSage Team
    `.trim();
  }
}

/**
 * Convert plain text digest to HTML
 */
function generateHtmlDigest(text: string): string {
  // Simple conversion of plain text to HTML
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>TrialSage Weekly Digest</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2563eb;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 10px;
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 10px;
    }
    ul {
      padding-left: 20px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>TrialSage Weekly Digest</h1>
  <div class="content">
    ${text
      .replace(/^Hello TrialSage User,\n\n/, '')
      .replace(/\nBest Regards,\nThe TrialSage Team\n\n---\nYou can customize.*$/, '')
      .replace(/Reports Exported: (\d+)/g, '<div class="section-title">Reports Exported: $1</div><ul>')
      .replace(/Protocols Analyzed: (\d+)/g, '</ul><div class="section-title">Protocols Analyzed: $1</div><ul>')
      .replace(/Protocol Comparisons: (\d+)/g, '</ul><div class="section-title">Protocol Comparisons: $1</div><ul>')
      .replace(/- (.*)/g, '<li>$1</li>')
      .replace(/\n\n/g, '</ul>')
      .replace(/<\/ul>\s*$/, '</ul>')
      }
  </div>
  <div class="footer">
    <p>Best Regards,<br>The TrialSage Team</p>
    <p>You can customize your digest preferences in your TrialSage dashboard.</p>
  </div>
</body>
</html>
  `.trim();
}