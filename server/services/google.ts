import { storage } from "@server/storage";
import { google } from "googleapis";

/**
 * Service for handling Google API operations including OAuth authentication
 */
export class GoogleService {
  static googleOAuthAvailable =
    process.env.GOOGLE_OAUTH_CLIENT_ID !== undefined &&
    process.env.GOOGLE_OAUTH_CLIENT_SECRET !== undefined;

  /**
   * Checks and refreshes OAuth tokens if needed
   * @returns Promise with token information (accessToken, expires, refreshToken)
   */
  static async refreshToken() {
    try {
      // Check if we have a token in the database
      const storedToken = await storage.google.getTokens();

      // If we have a token and it's not expired, use it
      if (
        storedToken &&
        storedToken.tokenExpiry &&
        new Date(storedToken.tokenExpiry) > new Date()
      ) {
        console.log("Using existing OAuth token from database");
        return {
          accessToken: storedToken.accessToken,
          expires: new Date(storedToken.tokenExpiry).getTime(),
          refreshToken: storedToken.refreshToken,
        };
      }

      // If no token in database or token is expired, refresh using the environment variable
      console.log("Refreshing Google OAuth token...");

      const oauth2Client = await this.getOAuth2Client();

      // Use refresh token from environment variable
      if (!storedToken?.refreshToken) {
        throw new Error("No refresh token available.");
      }

      oauth2Client.setCredentials({
        refresh_token: storedToken.refreshToken,
      });

      // Get a new access token
      const tokenResponse = await oauth2Client.getAccessToken();

      if (!tokenResponse.token) {
        throw new Error("Failed to get access token from Google");
      }

      // Calculate expiry time (tokens typically last 1 hour)
      const expiryDate = new Date();
      expiryDate.setSeconds(
        expiryDate.getSeconds() + (tokenResponse.res?.data?.expires_in || 3600),
      );

      // Store the new token in the database
      await storage.google.saveTokens(
        tokenResponse.token,
        storedToken.refreshToken,
        expiryDate,
      );

      console.log("OAuth token refreshed successfully");
      return {
        accessToken: tokenResponse.token,
        expires: expiryDate.getTime(),
        refreshToken: storedToken.refreshToken,
      };
    } catch (error) {
      console.error("Error refreshing OAuth token:", error);
      throw error;
    }
  }

  /**
   * Generates a URL for Google OAuth authentication
   * @returns URL for the Google OAuth authentication process
   */
  static async generateOAuthURL() {
    try {
      const oauth2Client = await this.getOAuth2Client();

      const scopes = [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://mail.google.com/",
      ];

      const redirectUri = `${process.env.APP_URL}/api/integrations/google/callback`;

      const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        prompt: "consent",
        redirect_uri: redirectUri,
      });

      return url;
    } catch (error) {
      console.error("Error generating OAuth URL:", error);
      throw error;
    }
  }

  /**
   * Gets a configured Google API OAuth client
   * @returns Configured OAuth2Client
   */
  static async getOAuth2Client() {
    if (!this.googleOAuthAvailable) {
      throw new Error("Google OAuth is not available.");
    }

    return new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    );
  }
}
