/**
 * System Settings Storage Implementation
 *
 * Implements system-wide settings operations.
 */
import { BaseStorage } from "@server/storage/base";
import { settingsSchema } from "@shared/schemas/db";
import {
  UpdateSettingsValues,
  type ClientSettings,
} from "@shared/schemas/validation/settings";

export class SettingsStorage extends BaseStorage {
  async getSettings() {
    // Get settings from the database
    const [settings] = await this.db.select().from(settingsSchema);

    // If no settings exist, create default settings
    if (!settings) {
      return this.createDefaultSettings();
    }

    return settings;
  }

  async getClientSettings(): Promise<ClientSettings> {
    // Get settings from the database
    const settings = await this.getSettings();

    // If no settings exist, create default settings
    if (!settings) {
      return this.createDefaultSettings();
    }

    const publicSettings: ClientSettings = {
      websiteTitle: settings.websiteTitle,
    };

    return publicSettings;
  }

  async updateSettings(updates: UpdateSettingsValues) {
    // Update settings
    const [updatedSettings] = await this.db
      .update(settingsSchema)
      .set(updates)
      .returning();

    return updatedSettings;
  }

  private async createDefaultSettings() {
    // Create default settings record
    const [settings] = await this.db
      .insert(settingsSchema)
      .values({})
      .returning();

    return settings;
  }
}
