/**
 * Google Token Storage Implementation
 *
 * Implements Google OAuth token-related storage operations.
 */
import { BaseStorage } from "@server/storage/base";
import { googleSchema } from "@shared/schemas/db";

export class GoogleStorage extends BaseStorage {
  async getTokens(): Promise<
    | { accessToken: string; refreshToken?: string; tokenExpiry: Date }
    | undefined
  > {
    const [token] = await this.db.select().from(googleSchema);
    if (!token) return undefined;

    return {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      tokenExpiry: token.token_expiry,
    };
  }

  async saveTokens(
    accessToken: string,
    refreshToken: string,
    tokenExpiry: Date,
  ): Promise<any> {
    // Delete any existing tokens first (we only store one)
    await this.db.delete(googleSchema);

    // Insert the new token
    const [token] = await this.db
      .insert(googleSchema)
      .values({
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expiry: tokenExpiry,
      })
      .returning();

    return token;
  }

  async deleteTokens(): Promise<boolean> {
    const result = await this.db.delete(googleSchema).returning();
    return result.length > 0;
  }
}
