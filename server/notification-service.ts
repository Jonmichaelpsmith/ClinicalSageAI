import sgMail from '@sendgrid/mail';
import axios from 'axios';

// Configure SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailNotificationOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface SlackNotificationOptions {
  text: string;
  blocks?: any[];
}

export class NotificationService {
  /**
   * Send an email notification using SendGrid
   */
  async sendEmailNotification(options: EmailNotificationOptions): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured. Email notification skipped.');
      return false;
    }

    try {
      const msg = {
        to: options.to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@trialsage.ai',
        subject: options.subject,
        text: options.text,
        html: options.html || options.text
      };

      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  /**
   * Send a notification to a Slack channel using webhooks
   */
  async sendSlackNotification(options: SlackNotificationOptions): Promise<boolean> {
    if (!process.env.SLACK_BOT_TOKEN || !process.env.SLACK_CHANNEL_ID) {
      console.warn('Slack credentials not configured. Slack notification skipped.');
      return false;
    }

    try {
      const message: any = {
        channel: process.env.SLACK_CHANNEL_ID,
        text: options.text
      };

      if (options.blocks) {
        message.blocks = options.blocks;
      }

      await axios.post('https://slack.com/api/chat.postMessage', message, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`
        }
      });

      return true;
    } catch (error) {
      console.error('Error sending Slack notification:', error);
      return false;
    }
  }

  /**
   * Send a strategic report notification via all configured channels
   */
  async sendStrategicReportNotification(
    protocolId: string,
    reportUrl: string,
    recipientEmail?: string
  ): Promise<{email: boolean, slack: boolean}> {
    const results = {
      email: false,
      slack: false
    };

    // Email notification
    if (recipientEmail) {
      const emailOptions: EmailNotificationOptions = {
        to: recipientEmail,
        subject: `TrialSage Strategic Report Ready for Review`,
        text: `Your full strategic intelligence report for protocol [${protocolId}] is ready.

Download here:
${reportUrl}

Includes:
- Protocol benchmarking
- Endpoint success rates
- AI-powered design suggestions

Best,
TrialSage`,
        html: `<p>Your full strategic intelligence report for protocol <strong>${protocolId}</strong> is ready.</p>
<p><a href="${reportUrl}">Download Report</a></p>
<p>Includes:</p>
<ul>
  <li>Protocol benchmarking</li>
  <li>Endpoint success rates</li>
  <li>AI-powered design suggestions</li>
</ul>
<p>Best,<br>TrialSage</p>`
      };

      results.email = await this.sendEmailNotification(emailOptions);
    }

    // Slack notification
    const slackOptions: SlackNotificationOptions = {
      text: `📄 New Strategic Report Ready — ${protocolId}`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `📄 New Strategic Report Ready — ${protocolId}`,
            emoji: true
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `A new strategic intelligence report has been generated and is ready for review.`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*<${reportUrl}|View Report>*`
          }
        }
      ]
    };

    results.slack = await this.sendSlackNotification(slackOptions);

    return results;
  }
}

// Export a singleton instance
export const notificationService = new NotificationService();