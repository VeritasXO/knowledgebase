/**
 * Admin User Creation Script
 *
 * This script prompts for email and password, then creates an admin user
 * in the database. To run: npm run create-admin
 */
import { UserStorage } from "@server/storage/users";
import { ADMIN_ROLES } from "@shared/constants";
import bcrypt from "bcrypt";
import readline from "readline";

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Prompt for input and handle responses
async function promptUser(): Promise<{ email: string; password: string }> {
  return new Promise((resolve) => {
    rl.question("Enter admin email: ", (email) => {
      rl.question("Enter admin password: ", (password) => {
        resolve({ email, password });
      });
    });
  });
}

// Main function to create admin user
async function createAdmin() {
  try {
    // Get user input
    const { email, password } = await promptUser();

    // Validate input
    if (!email || !email.includes("@") || !password || password.length < 8) {
      console.error(
        "Error: Please provide a valid email and password (min 8 characters)",
      );
      rl.close();
      return;
    }

    // Create user storage instance
    const userStorage = new UserStorage();

    // Check if user already exists
    const existingUser = await userStorage.getUserByEmail(email);
    if (existingUser) {
      console.error(`Error: User with email ${email} already exists`);
      rl.close();
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await userStorage.createUser({
      email,
      password: hashedPassword,
      role: ADMIN_ROLES.ADMIN,
    });

    console.log(`Admin user created successfully with ID: ${newUser.id}`);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    rl.close();
  }
}

// Execute the function
createAdmin();
