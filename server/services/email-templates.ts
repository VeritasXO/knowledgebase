import { serverRoot } from "@server/index";
import { readFileSync } from "fs";
import path from "path";

/**
 * Service for rendering email templates with dynamic data
 */
export class EmailTemplates {
  // Cache for email templates to avoid repeated disk reads
  private static templateCache: Record<string, string> = {};
  private static templateDir = "email-templates";

  /**
   * Render an email template file with variable substitutions
   */
  static renderEmail(
    templateName: string,
    variables: Record<string, string | undefined> = {},
  ): string {
    // Determine the correct path based on whether we're in production or development
    let templatePath;
    // Check if we're running from the dist directory (production)
    if (process.env.NODE_ENV === "production") {
      // In production, templates are in the dist directory
      templatePath = path.join(
        process.cwd(),
        "dist",
        "server",
        this.templateDir,
        templateName,
      );

      console.log("templatePath", templatePath);
    } else {
      // In development, use the server root
      templatePath = path.join(serverRoot, this.templateDir, templateName);
    }

    if (!this.templateCache[templateName]) {
      try {
        this.templateCache[templateName] = readFileSync(templatePath, "utf8");
      } catch (error) {
        console.error(`Failed to load template: ${templatePath}`, error);
        return `Error loading template ${templateName}`;
      }
    }

    let html = this.templateCache[templateName];
    for (const [key, value] of Object.entries(variables)) {
      html = html.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), value ?? "");
    }

    return html;
  }

  /**
   * Format a time string from 24h to 12h format
   */
  static formatTime(time24h: string): string {
    if (!time24h) return "";

    const [hours, minutes] = time24h.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;

    return `${hour12}:${minutes} ${ampm}`;
  }
}
