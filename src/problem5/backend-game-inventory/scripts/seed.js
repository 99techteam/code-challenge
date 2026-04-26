"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_model_1 = require("../src/models/game.model");
const mongo_1 = require("../src/db/mongo");
async function seed() {
    try {
        await (0, mongo_1.connectDB)();
        const count = await game_model_1.Game.countDocuments();
        if (count > 0) {
            console.log("Data already seeded, skipping...");
            return;
        }
        await game_model_1.Game.insertMany([
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
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await (0, mongo_1.disconnectDB)();
    }
}
seed();
//# sourceMappingURL=seed.js.map