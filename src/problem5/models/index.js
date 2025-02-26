require("dotenv").config(); // Load .env variables
const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");
const config = require("../config/config.js")[process.env.NODE_ENV || "development"];

const basename = path.basename(__filename);
const db = {};

// Initialize Sequelize with environment variables
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: false, // Disable logging (optional)
  }
);

// Load all models dynamically
fs.readdirSync(__dirname)
  .filter((file) => file !== basename && file.endsWith(".js"))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
