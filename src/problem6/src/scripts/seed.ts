/**
 * Database seeding script
 */

import { Database } from "../config/database";
import { SeedData } from "../utils/seedData";
import { databaseConfig } from "../config";

async function runSeed(): Promise<void> {
  const database = new Database(databaseConfig);
  const seedData = new SeedData(database);

  try {
    console.log("🚀 Starting database seeding...");

    // Initialize database
    await database.initialize();

    // Clear existing data
    await seedData.clearUsers();
    await seedData.resetAutoIncrement();

    // Seed with sample data
    await seedData.seedUsers();

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exit(1);
  } finally {
    await database.close();
  }
}

// Run the seeding script
if (require.main === module) {
  runSeed();
}
