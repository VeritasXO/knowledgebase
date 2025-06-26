import { settingsSchema } from "@shared/schemas/db";
import { createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

// Schema for complete settings
export const fullSettingsSchema = createUpdateSchema(settingsSchema)
  .omit({
    id: true,
    updatedAt: true,
  })
  .extend({
    // Website customization
    websiteTitle: z
      .string()
      .min(1, { message: "Website title is required" })
      .optional(),
    googleAccountEmail: z
      .string()
      .email({ message: "Please enter a valid email address" })
      .optional()
      .nullable(),
  });

// Schema for partial updates - all fields optional
export const updateSettingsSchema = fullSettingsSchema.partial();

export const clientSettingsSchema = createSelectSchema(settingsSchema).pick({
  websiteTitle: true,
});

// Type for client-side settings with OAuth fields
export type ClientSettings = z.infer<typeof clientSettingsSchema>;

// Type for partial updates
export type UpdateSettingsValues = z.infer<typeof updateSettingsSchema>;
