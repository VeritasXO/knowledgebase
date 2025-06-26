import { EmailTemplates } from "@server/services/email-templates";
import { GoogleService } from "@server/services/google";
import { storage } from "@server/storage";
import { UserSelect } from "@shared/schemas/db";
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
        logger: true,
        debug: true,
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
    attachments?: any[];
    [key: string]: any;
  }) {
    try {
      if (process.env.NODE_ENV === "development") {
        mailOptions.to = process.env.TEST_RECIPIENT_CHANGE_EMAIL;
        console.log(
          "Test mode enabled, changing recipiment email to",
          mailOptions.to,
        );
      }

      const freshTransporter = await this.createTransporter();
      const settings = await storage.settings.getSettings();

      mailOptions.from = `"${settings.websiteTitle}" <${settings.googleAccountEmail}>`;

      // Send the email
      const info = await freshTransporter.sendMail(mailOptions);

      console.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  }

  /**
   * Send a password reset email
   * @param user The user requesting password reset
   * @param token The password reset token
   */
  static async sendPasswordReset(
    user: UserSelect,
    token: string,
  ): Promise<void> {
    const settings = await storage.settings.getSettings();

    // Ensure the token format matches the URL route pattern
    const resetUrl = `${process.env.APP_URL}/admin/password-forgot/${token}`;

    const subject = "Password Reset Request";
    const html = EmailTemplates.renderEmail("password-forgot.html", {
      resetUrl,
    });

    try {
      // Use the new transporter with fresh tokens
      const info = await this.sendEmail({
        to: user.email,
        subject,
        html,
      });
      console.log("Password forgot email sent:", info.messageId);
    } catch (error) {
      console.error("Failed to send password forgot email:", error);
      throw error;
    }
  }

  /**
   * Send a password changed confirmation email
   * @param user The user who changed their password
   */
  static async sendPasswordChangedConfirm(user: UserSelect): Promise<void> {
    const settings = await storage.settings.getSettings();

    const subject = "Your Password Has Been Changed";
    const html = EmailTemplates.renderEmail("password-changed.html", {});

    try {
      const info = await this.sendEmail({
        to: user.email,
        subject,
        html,
      });
      console.log("Password changed confirmation email sent:", info.messageId);
    } catch (error) {
      console.error(
        "Failed to send password changed confirmation email:",
        error,
      );
      throw error;
    }
  }

  static async sendEmailChanged(
    oldEmail: string,
    updatedUser: UserSelect,
  ): Promise<void> {
    const settings = await storage.settings.getSettings();

    const subject = "Your Email Address Has Been Updated";
    const html = EmailTemplates.renderEmail("email-changed.html", {
      newEmail: updatedUser.email,
      oldEmail: oldEmail,
    });

    try {
      const sentNew = await EmailService.sendEmail({
        to: updatedUser.email,
        subject,
        html,
      });
      const sentOld = await EmailService.sendEmail({
        to: oldEmail,
        subject,
        html,
      });
      console.log(
        "Email changed notifications sent:",
        sentNew.messageId,
        sentOld.messageId,
      );
    } catch (error) {
      console.error("Failed to send email changed notification:", error);
      throw error;
    }
  }
}
