import { Request, Response, Router } from 'express';
import nodemailer from 'nodemailer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Create the router
const router = Router();

// Environment variables for email credentials
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@trialsage.ai';

// Configure email transporter
const getTransporter = () => {
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('Email credentials not configured. Emails will not be sent.');
    return null;
  }
  
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

// Send email notification for protocol comparison
router.post('/notify/send-comparison-email', async (req: Request, res: Response) => {
  try {
    const { to_email, download_url, protocol_id } = req.body;
    
    if (!to_email || !download_url || !protocol_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: to_email, download_url, and protocol_id are required"
      });
    }
    
    const transporter = getTransporter();
    
    if (!transporter) {
      return res.status(503).json({
        success: false,
        message: "Email service not configured"
      });
    }
    
    const now = new Date();
    
    const mailOptions = {
      from: FROM_EMAIL,
      to: to_email,
      subject: `TrialSage – Protocol Comparison Report for ${protocol_id}`,
      text: `Hello,

A new protocol version comparison report has been generated.

📄 Download your report:
${download_url}

Generated: ${now.toISOString()} UTC

– TrialSage`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2563eb;">TrialSage Protocol Comparison</h2>
        </div>
        <p>Hello,</p>
        <p>A new protocol version comparison report has been generated for <strong>${protocol_id}</strong>.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="margin: 0;"><strong>📄 Download your report:</strong></p>
          <p style="margin: 10px 0;">
            <a href="${download_url}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">Download Report</a>
          </p>
        </div>
        <p style="font-size: 12px; color: #64748b;">Generated: ${now.toISOString()} UTC</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">– TrialSage</p>
      </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    // Log the email notification
    console.log(`Email notification sent to ${to_email} for protocol ${protocol_id}`);
    
    res.json({
      success: true,
      message: "Email notification sent successfully"
    });
  } catch (error) {
    console.error('Error sending email notification:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to send email notification"
    });
  }
});

// Send alert for new protocol version
router.post('/alert/new-version', async (req: Request, res: Response) => {
  try {
    const { 
      protocol_id, 
      version, 
      previous_version,
      changes = [],
      previous_success,
      current_success,
      notification_emails = [],
      webhook_url
    } = req.body;
    
    if (!protocol_id || !version) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: protocol_id and version are required"
      });
    }
    
    // Format changes as string
    const changesText = changes.length > 0 
      ? `Differences detected in: ${changes.join(', ')}.` 
      : 'No significant differences detected.';
    
    // Format success probability change if available
    let successText = '';
    if (typeof previous_success === 'number' && typeof current_success === 'number') {
      const delta = (current_success - previous_success) * 100;
      const direction = delta > 0 ? 'increased' : 'decreased';
      successText = `Success probability ${direction} from ${(previous_success * 100).toFixed(1)}% to ${(current_success * 100).toFixed(1)}% (${delta > 0 ? '+' : ''}${delta.toFixed(1)}%).`;
    }
    
    // Build alert message
    const alertMessage = `⚠️ Protocol ${version} was just saved.${previous_version ? ` Previous version: ${previous_version}.` : ''} ${changesText} ${successText}`;
    
    // Send email alerts
    if (notification_emails.length > 0) {
      const transporter = getTransporter();
      
      if (transporter) {
        const mailOptions = {
          from: FROM_EMAIL,
          to: notification_emails.join(', '),
          subject: `TrialSage Alert: New Protocol Version - ${protocol_id}`,
          text: `${alertMessage}

TrialSage`,
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #dc2626;">TrialSage Alert</h2>
            </div>
            <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #dc2626;">
              <p style="margin: 0;"><strong>⚠️ Protocol ${version} was just saved</strong></p>
              ${previous_version ? `<p style="margin: 10px 0;">Previous version: ${previous_version}</p>` : ''}
              <p style="margin: 10px 0;">${changesText}</p>
              ${successText ? `<p style="margin: 10px 0;">${successText}</p>` : ''}
            </div>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b; text-align: center;">– TrialSage</p>
          </div>
          `
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`Email alert sent to ${notification_emails.join(', ')} for protocol ${protocol_id}`);
      }
    }
    
    // Send webhook alert
    if (webhook_url) {
      try {
        const webhookResponse = await fetch(webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: alertMessage,
            protocol_id,
            version,
            previous_version,
            changes,
            success_change: {
              previous: previous_success,
              current: current_success,
              delta: previous_success && current_success ? (current_success - previous_success) * 100 : null
            },
            timestamp: new Date().toISOString()
          })
        });
        
        if (!webhookResponse.ok) {
          console.error(`Webhook alert failed: ${webhookResponse.status} ${webhookResponse.statusText}`);
        } else {
          console.log(`Webhook alert sent for protocol ${protocol_id}`);
        }
      } catch (webhookError) {
        console.error('Error sending webhook alert:', webhookError);
      }
    }
    
    res.json({
      success: true,
      message: "Alert notifications sent successfully"
    });
  } catch (error) {
    console.error('Error sending alert notifications:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to send alert notifications"
    });
  }
});

// Save user preferences for digest
router.post('/user/save-digest-prefs', async (req: Request, res: Response) => {
  try {
    const { user_id, prefs } = req.body;
    
    if (!user_id || !prefs) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: user_id and prefs are required"
      });
    }
    
    // Create user preferences directory if it doesn't exist
    const prefsDir = path.join(process.cwd(), 'data/users');
    if (!fs.existsSync(prefsDir)) {
      fs.mkdirSync(prefsDir, { recursive: true });
    }
    
    // Validate preferences structure
    const validPrefs = {
      include_exports: Boolean(prefs.include_exports),
      include_risk_changes: Boolean(prefs.include_risk_changes),
      include_version_changes: Boolean(prefs.include_version_changes),
      include_sap: Boolean(prefs.include_sap),
      risk_change_threshold: Number(prefs.risk_change_threshold) || 10
    };
    
    // Save preferences to file
    const prefsPath = path.join(prefsDir, `${user_id}_prefs.json`);
    fs.writeFileSync(prefsPath, JSON.stringify(validPrefs, null, 2));
    
    res.json({
      success: true,
      message: "Digest preferences saved successfully"
    });
  } catch (error) {
    console.error('Error saving digest preferences:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to save digest preferences"
    });
  }
});

// Send weekly digest to user
router.post('/notify/send-weekly-digest', async (req: Request, res: Response) => {
  try {
    const { user_email, user_id, days = 7 } = req.body;
    
    if (!user_email || !user_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: user_email and user_id are required"
      });
    }
    
    // Generate digest using Python script
    const pythonProcess = spawn('python3', [
      'scripts/generate_weekly_digest.py',
      user_id,
      days.toString()
    ]);
    
    let digestText = '';
    let errorText = '';
    
    pythonProcess.stdout.on('data', (data) => {
      digestText += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorText += data.toString();
      console.error(`Weekly digest generation error: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0 || errorText.trim()) {
        return res.status(500).json({
          success: false,
          message: `Weekly digest generation failed: ${errorText}`
        });
      }
      
      if (!digestText.trim() || digestText.includes("No logs found")) {
        return res.json({
          success: true,
          message: "No digest entries this week."
        });
      }
      
      const transporter = getTransporter();
      
      if (!transporter) {
        return res.status(503).json({
          success: false,
          message: "Email service not configured"
        });
      }
      
      // Generate HTML version of the digest
      const htmlProcess = spawn('python3', [
        '-c', 
        `from scripts.generate_weekly_digest import generate_html_digest; \
        print(generate_html_digest("${user_id}", ${days}))`
      ]);
      
      let htmlContent = '';
      let htmlError = '';
      
      htmlProcess.stdout.on('data', (data) => {
        htmlContent += data.toString();
      });
      
      htmlProcess.stderr.on('data', (data) => {
        htmlError += data.toString();
        console.error(`HTML digest generation error: ${data}`);
      });
      
      htmlProcess.on('close', async (htmlCode) => {
        // Fall back to text version if HTML generation fails
        if (htmlCode !== 0 || !htmlContent.trim()) {
          htmlContent = `<pre>${digestText}</pre>`;
        }
        
        // Send email with digest
        const mailOptions = {
          from: FROM_EMAIL,
          to: user_email,
          subject: `🧠 Your TrialSage Weekly Protocol Digest - ${new Date().toLocaleDateString()}`,
          text: digestText,
          html: htmlContent
        };
        
        try {
          await transporter.sendMail(mailOptions);
          console.log(`Weekly digest sent to ${user_email}`);
          
          res.json({
            success: true,
            message: "Weekly digest sent successfully",
            digest: digestText
          });
        } catch (emailError) {
          console.error('Error sending digest email:', emailError);
          res.status(500).json({
            success: false,
            message: `Error sending digest email: ${emailError instanceof Error ? emailError.message : "Unknown error"}`,
            digest: digestText
          });
        }
      });
    });
  } catch (error) {
    console.error('Error in weekly digest generation:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred during digest generation"
    });
  }
});

// Get weekly digest data (for displaying in dashboard)
router.post('/digest/get-data', async (req: Request, res: Response) => {
  try {
    const { user_id, days = 7 } = req.body;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: user_id is required"
      });
    }
    
    // Generate digest using Python script
    const pythonProcess = spawn('python3', [
      'scripts/generate_weekly_digest.py',
      user_id,
      days.toString()
    ]);
    
    let digestText = '';
    let errorText = '';
    
    pythonProcess.stdout.on('data', (data) => {
      digestText += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorText += data.toString();
      console.error(`Weekly digest data generation error: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0 || errorText.trim()) {
        return res.status(500).json({
          success: false,
          message: `Weekly digest data generation failed: ${errorText}`
        });
      }
      
      if (!digestText.trim() || digestText.includes("No logs found")) {
        return res.json({
          success: true,
          message: "No digest entries this week.",
          digest: ""
        });
      }
      
      res.json({
        success: true,
        digest: digestText
      });
    });
  } catch (error) {
    console.error('Error in weekly digest data generation:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred during digest data generation"
    });
  }
});

export default router;