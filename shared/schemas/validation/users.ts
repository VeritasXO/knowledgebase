import { ADMIN_ROLES } from "@shared/constants";
import { usersSchema } from "@shared/schemas/db";
import { createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const insertUserSchema = createUpdateSchema(usersSchema)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    password: z.string().min(8, {
      message: "Password must be at least 8 characters",
    }),
    email: z.string().email(),
    role: z.enum([ADMIN_ROLES.ADMIN]),
  });

export const updateUserSchema = createUpdateSchema(usersSchema)
  .omit({
    id: true,
    createdAt: true,
    password: true,
  })
  .extend({
    fullName: z.string().min(2, {
      message: "Name must be at least 2 characters",
    }),
    email: z.string().email(),
    role: z.enum([ADMIN_ROLES.ADMIN]),
  });

export const adminLoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const userPasswordResetSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Confirm password must be at least 8 characters" }),
    token: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type InsertUserFormValues = z.infer<typeof insertUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;
