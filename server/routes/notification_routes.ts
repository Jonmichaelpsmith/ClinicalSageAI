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

export default router;