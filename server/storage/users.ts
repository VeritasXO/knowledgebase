/**
 * User Storage Implementation
 *
 * Implements user-related storage operations.
 */
import { BaseStorage } from "@server/storage/base";
import { UserSelect, usersSchema } from "@shared/schemas/db";
import { InsertUserFormValues } from "@shared/schemas/validation";
import { eq } from "drizzle-orm";

export class UserStorage extends BaseStorage {
  async getUser(id: string): Promise<UserSelect | undefined> {
    const [user] = await this.db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<UserSelect | undefined> {
    const [user] = await this.db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.email, email));
    return user;
  }

  async createUser(values: InsertUserFormValues): Promise<UserSelect> {
    const [user] = await this.db.insert(usersSchema).values(values).returning();
    return user;
  }

  async updateUser(
    id: string,
    updates: Partial<UserSelect>,
  ): Promise<UserSelect | undefined> {
    const [updatedUser] = await this.db
      .update(usersSchema)
      .set(updates)
      .where(eq(usersSchema.id, id))
      .returning();

    return updatedUser;
  }

  async getAllUsers(): Promise<UserSelect[]> {
    return this.db.select().from(usersSchema);
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.db
      .delete(usersSchema)
      .where(eq(usersSchema.id, id))
      .returning();
    return result.length > 0;
  }
}
