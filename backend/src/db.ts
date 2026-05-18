import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS coins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    currency TEXT NOT NULL,
    blockchain TEXT NOT NULL,
    price REAL NOT NULL,
    date TEXT NOT NULL,
    iconFilename TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    score INTEGER NOT NULL DEFAULT 0,
    sessionToken TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed data if empty
const coinCount = db.prepare('SELECT COUNT(*) as count FROM coins').get() as { count: number };
if (coinCount.count === 0) {
    const seedPath = path.join(__dirname, '../data/seed.json');
    if (fs.existsSync(seedPath)) {
        const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
        
        const insertCoin = db.prepare('INSERT INTO coins (currency, blockchain, price, date, iconFilename) VALUES (@currency, @blockchain, @price, @date, @iconFilename)');
        const insertCoins = db.transaction((coins: any[]) => {
            for (const coin of coins) {
                insertCoin.run(coin);
            }
        });
        insertCoins(seedData.coins);

        const insertScore = db.prepare('INSERT INTO scores (username, score) VALUES (@username, @score)');
        const insertScores = db.transaction((scores: any[]) => {
            for (const score of scores) {
                insertScore.run(score);
            }
        });
        insertScores(seedData.scores);
        console.log("Database seeded successfully.");
    }
}

export default db;
