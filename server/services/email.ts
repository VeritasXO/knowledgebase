import { GoogleService } from "@server/services/google";
import { storage } from "@server/storage";
import nodemailer from "nodemailer";

/**
 * Service for handling email sending and notifications
 */
export class EmailService {
  /**
   * Create a configured email transporter with fresh OAuth tokens
   * @returns Configured nodemailer transporter
   */
  private static async createTransporter() {
    try {
      const oauthToken = await GoogleService.refreshToken();

      if (!GoogleService.googleOAuthAvailable) {
        throw new Error("Google OAuth credentials not set.");
      }

      const settings = await storage.settings.getSettings();

      if (!settings.googleAccountEmail) {
        throw new Error("Google account email not set.");
      }

      return nodemailer.createTransport({
        logger: process.env.NODE_ENV === "development",
        debug: process.env.NODE_ENV === "development",
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: settings.googleAccountEmail,
          clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
          clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
          refreshToken: oauthToken.refreshToken,
          accessToken: oauthToken.accessToken,
          expires: oauthToken.expires,
        },
      });
    } catch (error) {
      console.error("Failed to create email transporter:", error);
      throw error;
    }
  }

  /**
   * Send an email with automatic token refresh
   * @param mailOptions The nodemailer mail options (from, to, subject, html, etc.)
   * @returns Promise with the send info
   */
  static async sendEmail(mailOptions: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
  }) {
    try {
      if (process.env.TEST_RECIPIENT_CHANGE_EMAIL) {
        mailOptions.to = process.env.TEST_RECIPIENT_CHANGE_EMAIL;
        console.log(
          "Test mode enabled, changing recipiment email to",
          mailOptions.to,
        );
      }

      const freshTransporter = await this.createTransporter();
      const settings = await storage.settings.getSettings();
      const from = `"${settings.websiteTitle}" <${settings.googleAccountEmail}>`;

      // Send the email
      const info = await freshTransporter.sendMail({ ...mailOptions, from });

      console.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  }
}
