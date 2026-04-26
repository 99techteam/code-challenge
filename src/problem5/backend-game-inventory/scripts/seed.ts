import { Game } from "../src/models/game.model";
import { connectDB, disconnectDB } from "../src/db/mongo";

async function seed() {
  try {
    await connectDB();

    const count = await Game.countDocuments();

    if (count > 0) {
      console.log("Data already seeded, skipping...");
      return;
    }

    await Game.insertMany([
      {
        title: "Elden Ring",
        genre: "RPG",
        platform: "PC",
        quantity: 10,
        price: 59.99,
      },
      {
        title: "God of War",
        genre: "Action",
        platform: "PlayStation",
        quantity: 5,
        price: 49.99,
      },
      {
        title: "FIFA 24",
        genre: "Sports",
        platform: "PC",
        quantity: 20,
        price: 39.99,
      },
    ]);

    console.log("Seed data inserted");
  } catch (err) {
    console.error(err);
  } finally {
    await disconnectDB();
  }
}

seed();