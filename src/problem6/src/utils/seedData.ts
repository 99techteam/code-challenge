/**
 * Database seeding utility
 */

import { Database } from "../config/database";
import { CreateUserRequest } from "../types";

export class SeedData {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  /**
   * Seed the database with sample data
   */
  public async seedUsers(): Promise<void> {
    const sampleUsers: CreateUserRequest[] = [
      {
        name: "John Doe",
        email: "john.doe@example.com",
        age: 30,
        role: "admin",
        isActive: true,
      },
      {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        age: 25,
        role: "user",
        isActive: true,
      },
      {
        name: "Bob Johnson",
        email: "bob.johnson@example.com",
        age: 35,
        role: "moderator",
        isActive: true,
      },
      {
        name: "Alice Brown",
        email: "alice.brown@example.com",
        age: 28,
        role: "user",
        isActive: false,
      },
      {
        name: "Charlie Wilson",
        email: "charlie.wilson@example.com",
        age: 42,
        role: "admin",
        isActive: true,
      },
      {
        name: "Diana Davis",
        email: "diana.davis@example.com",
        age: 31,
        role: "user",
        isActive: true,
      },
      {
        name: "Eve Miller",
        email: "eve.miller@example.com",
        age: 27,
        role: "moderator",
        isActive: true,
      },
      {
        name: "Frank Garcia",
        email: "frank.garcia@example.com",
        age: 33,
        role: "user",
        isActive: false,
      },
    ];

    console.log("🌱 Seeding database with sample users...");

    for (const userData of sampleUsers) {
      try {
        await this.db.run(
          `INSERT INTO users (name, email, age, role, isActive, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            userData.name,
            userData.email,
            userData.age,
            userData.role,
            userData.isActive ? 1 : 0,
          ]
        );
      } catch (error) {
        // Skip if user already exists
        if (
          error instanceof Error &&
          error.message.includes("UNIQUE constraint failed")
        ) {
          console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    console.log("✅ Database seeded successfully!");
  }

  /**
   * Clear all data from users table
   */
  public async clearUsers(): Promise<void> {
    console.log("🧹 Clearing users table...");
    await this.db.run("DELETE FROM users");
    console.log("✅ Users table cleared!");
  }

  /**
   * Reset auto-increment counter
   */
  public async resetAutoIncrement(): Promise<void> {
    console.log("🔄 Resetting auto-increment counter...");
    await this.db.run('DELETE FROM sqlite_sequence WHERE name = "users"');
    console.log("✅ Auto-increment counter reset!");
  }
}
