import { Express } from "express";
import fs from "fs";
import path from "path";
import { logExportAction, getExportLogs } from "../export_logger";

// Mock email functionality since we couldn't install nodemailer
// In a production environment, this would use a real email service
const mockSendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
  
  // Log the email to a file for debugging
  const emailsDir = path.join(__dirname, "..", "..", "logs");
  
  // Create logs directory if it doesn't exist
  if (!fs.existsSync(emailsDir)) {
    fs.mkdirSync(emailsDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const emailPath = path.join(emailsDir, `email-${timestamp}.html`);
  
  fs.writeFileSync(emailPath, `
    To: ${to}
    Subject: ${subject}
    Date: ${new Date().toISOString()}
    
    ${html}
  `);
  
  return true;
};

export default function registerNotificationRoutes(app: Express): void {
  // Get user digest preferences
  app.get("/api/user/preferences", async (req, res) => {
    try {
      const userId = req.query.user_id;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // In a real implementation, this would fetch from the database
      // For now, we'll return default preferences
      return res.json({
        prefs: {
          include_exports: true,
          include_risk_changes: true,
          include_version_changes: true,
          include_sap: false,
          risk_change_threshold: 10
        }
      });
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });
  
  // Save user digest preferences
  app.post("/api/user/save-digest-prefs", async (req, res) => {
    try {
      const { user_id, prefs } = req.body;
      
      if (!user_id || !prefs) {
        return res.status(400).json({ message: "User ID and preferences are required" });
      }
      
      // In a real implementation, this would save to the database
      // For now, we'll just log it and return success
      console.log(`Saved preferences for user ${user_id}:`, prefs);
      
      return res.json({ success: true });
    } catch (error) {
      console.error("Error saving user preferences:", error);
      res.status(500).json({ message: "Failed to save user preferences" });
    }
  });
  
  // Get weekly digest data
  app.post("/api/digest/get-data", async (req, res) => {
    try {
      const { user_id } = req.body;
      
      if (!user_id) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Get user's export logs for the past week
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const logs = await getExportLogs(user_id, {
        since: weekAgo,
        until: now
      });
      
      if (!logs || logs.length === 0) {
        return res.json({ 
          message: "No activity in the past week.",
          digest: "📊 Weekly TrialSage Digest\n\nNo activity was recorded for your account in the past week." 
        });
      }
      
      // Group logs by type
      const reportExports = logs.filter(log => log.actionType === 'export_pdf');
      const protocolUploads = logs.filter(log => log.actionType === 'upload_protocol');
      const comparisonExports = logs.filter(log => log.actionType === 'export_comparison');
      
      // Generate digest text
      let digest = "📊 Weekly TrialSage Digest\n\n";
      
      if (reportExports.length > 0) {
        digest += `Reports Exported: ${reportExports.length}\n`;
        reportExports.forEach(log => {
          digest += `- ${log.timestamp.toISOString().split('T')[0]}: ${log.objectName || 'Unnamed report'}\n`;
        });
        digest += "\n";
      }
      
      if (protocolUploads.length > 0) {
        digest += `Protocols Analyzed: ${protocolUploads.length}\n`;
        protocolUploads.forEach(log => {
          digest += `- ${log.timestamp.toISOString().split('T')[0]}: ${log.objectName || 'Unnamed protocol'}\n`;
        });
        digest += "\n";
      }
      
      if (comparisonExports.length > 0) {
        digest += `Protocol Comparisons: ${comparisonExports.length}\n`;
        comparisonExports.forEach(log => {
          digest += `- ${log.timestamp.toISOString().split('T')[0]}: ${log.objectName || 'Unnamed comparison'}\n`;
        });
        digest += "\n";
      }
      
      digest += "Thank you for using TrialSage for your clinical trial intelligence needs.";
      
      return res.json({ digest });
    } catch (error) {
      console.error("Error generating digest:", error);
      res.status(500).json({ message: "Failed to generate weekly digest" });
    }
  });
  
  // Send weekly digest email
  app.post("/api/notify/send-weekly-digest", async (req, res) => {
    try {
      const { user_id, user_email } = req.body;
      
      if (!user_id || !user_email) {
        return res.status(400).json({ message: "User ID and email are required" });
      }
      
      // Get digest data
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const logs = await getExportLogs(user_id, {
        since: weekAgo,
        until: now
      });
      
      // Format digest HTML
      let digestHtml = `
        <h1 style="color: #2563eb;">Weekly TrialSage Digest</h1>
        <p>Here's a summary of your activity from ${weekAgo.toLocaleDateString()} to ${now.toLocaleDateString()}:</p>
      `;
      
      if (!logs || logs.length === 0) {
        digestHtml += `<p>No activity was recorded for your account in the past week.</p>`;
      } else {
        // Group logs by type
        const reportExports = logs.filter(log => log.actionType === 'export_pdf');
        const protocolUploads = logs.filter(log => log.actionType === 'upload_protocol');
        const comparisonExports = logs.filter(log => log.actionType === 'export_comparison');
        
        if (reportExports.length > 0) {
          digestHtml += `
            <h2 style="color: #4b5563;">Reports Exported (${reportExports.length})</h2>
            <ul>
          `;
          reportExports.forEach(log => {
            digestHtml += `<li>${log.timestamp.toISOString().split('T')[0]}: ${log.objectName || 'Unnamed report'}</li>`;
          });
          digestHtml += `</ul>`;
        }
        
        if (protocolUploads.length > 0) {
          digestHtml += `
            <h2 style="color: #4b5563;">Protocols Analyzed (${protocolUploads.length})</h2>
            <ul>
          `;
          protocolUploads.forEach(log => {
            digestHtml += `<li>${log.timestamp.toISOString().split('T')[0]}: ${log.objectName || 'Unnamed protocol'}</li>`;
          });
          digestHtml += `</ul>`;
        }
        
        if (comparisonExports.length > 0) {
          digestHtml += `
            <h2 style="color: #4b5563;">Protocol Comparisons (${comparisonExports.length})</h2>
            <ul>
          `;
          comparisonExports.forEach(log => {
            digestHtml += `<li>${log.timestamp.toISOString().split('T')[0]}: ${log.objectName || 'Unnamed comparison'}</li>`;
          });
          digestHtml += `</ul>`;
        }
      }
      
      digestHtml += `
        <p>Thank you for using TrialSage for your clinical trial intelligence needs.</p>
        <p style="color: #6b7280; font-size: 0.875rem;">
          This is an automated message. Please do not reply to this email.
        </p>
      `;
      
      // Send digest email (mock)
      const sent = await mockSendEmail(
        user_email,
        "Your Weekly TrialSage Digest",
        digestHtml
      );
      
      if (sent) {
        // Log the digest email
        await logExportAction({
          userId: user_id.toString(),
          actionType: 'send_digest',
          objectId: 'weekly-digest',
          objectName: `Weekly Digest ${now.toISOString().split('T')[0]}`,
          objectType: 'digest',
          metadata: { recipient: user_email }
        });
        
        return res.json({ success: true });
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending digest email:", error);
      res.status(500).json({ message: "Failed to send weekly digest email" });
    }
  });
  
  // Send protocol comparison notification
  app.post("/api/notify/protocol-comparison", async (req, res) => {
    try {
      const { user_id, user_email, protocol_id, comparison_id, version1, version2 } = req.body;
      
      if (!user_id || !user_email || !protocol_id || !comparison_id) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Format email HTML
      const emailHtml = `
        <h1 style="color: #2563eb;">Protocol Comparison Ready</h1>
        <p>Your protocol comparison is ready to view:</p>
        <ul>
          <li><strong>Protocol ID:</strong> ${protocol_id}</li>
          <li><strong>Comparison ID:</strong> ${comparison_id}</li>
          ${version1 ? `<li><strong>Version 1:</strong> ${version1}</li>` : ''}
          ${version2 ? `<li><strong>Version 2:</strong> ${version2}</li>` : ''}
        </ul>
        <p>
          <a 
            href="#" 
            style="background-color: #2563eb; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;"
          >
            View Comparison
          </a>
        </p>
        <p style="color: #6b7280; font-size: 0.875rem;">
          This is an automated message. Please do not reply to this email.
        </p>
      `;
      
      // Send email (mock)
      const sent = await mockSendEmail(
        user_email,
        "Protocol Comparison Ready",
        emailHtml
      );
      
      if (sent) {
        // Log the notification
        await logExportAction({
          userId: user_id.toString(),
          actionType: 'send_comparison_notification',
          objectId: comparison_id,
          objectName: `Protocol Comparison ${protocol_id}`,
          objectType: 'notification',
          metadata: { 
            recipient: user_email,
            protocol_id,
            version1,
            version2
          }
        });
        
        return res.json({ success: true });
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending protocol comparison notification:", error);
      res.status(500).json({ message: "Failed to send protocol comparison notification" });
    }
  });
}