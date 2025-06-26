import { GoogleService } from "@server/services/google";
import { storage } from "@server/storage";
import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";

export function createGoogleRoutes() {
  const router = Router();

  // Get OAuth URL for authentication
  router.get("/url", async (req: Request, res: Response) => {
    try {
      return res.status(StatusCodes.OK).json({
        authUrl: await GoogleService.generateOAuthURL(),
      });
    } catch (error) {
      console.error("Error generating Google OAuth URL:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error generating Google OAuth URL",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Check if Google OAuth is available (credentials configured)
  router.get("/availability", async (req: Request, res: Response) => {
    try {
      return res.status(StatusCodes.OK).json({
        available: GoogleService.googleOAuthAvailable,
      });
    } catch (error) {
      console.error("Error checking Google OAuth availability:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error checking Google OAuth availability",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // OAuth callback for handling authorization code
  router.get("/callback", async (req: Request, res: Response) => {
    try {
      const { code } = req.query;

      if (!code) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Authorization code is missing" });
      }

      if (!GoogleService.googleOAuthAvailable) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Google OAuth credentials not configured in system settings",
        });
      }

      // Exchange the code for tokens
      const redirectUri = `${process.env.APP_URL}/api/integrations/google/callback`;
      const tokenUrl = "https://oauth2.googleapis.com/token";

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code: code as string,
          client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
          client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await response.json();

      if (!response.ok) {
        console.error("Token exchange error:", tokenData);
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Failed to exchange authorization code for tokens",
          error: tokenData.error_description || tokenData.error,
        });
      }

      // Save tokens in database
      const { access_token, refresh_token, expires_in } = tokenData;
      const tokenExpiry = new Date(Date.now() + expires_in * 1000);

      await storage.google.saveTokens(access_token, refresh_token, tokenExpiry);

      // Fetch user info to get the email address
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      if (!userInfoResponse.ok) {
        console.error(
          "Error fetching user info:",
          await userInfoResponse.json(),
        );
      } else {
        const userData = await userInfoResponse.json();
        const userEmail = userData.email;

        if (userEmail) {
          // Update system settings with the Google account email
          await storage.settings.updateSettings({
            googleAccountEmail: userEmail,
          });

          console.log(
            `Updated system settings with Google account email: ${userEmail}`,
          );
        }
      }

      // Redirect to system settings page with success message
      res.redirect("/admin/settings?oauth=success");
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      res.redirect("/admin/settings?oauth=error");
    }
  });

  return router;
}
