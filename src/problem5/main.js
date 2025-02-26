require("dotenv").config();
import express, { json } from "express";
import { Sequelize, DataTypes, Op } from "sequelize";
import { User } from "./models";

const app = express();
app.use(json());

// Create User
app.post("/users", async (req, res) => {
    const user = await User.create(req.body);
    res.json(user);
});

// Get All Users
app.get("/users", async (req, res) => {
    const { name, email } = req.query;

    const whereClause = {};
    if (name) whereClause.name = { [Op.like]: `%${name}%` };
    if (email) whereClause.email = { [Op.like]: `%${email}%` };

    const users = await User.findAll({ where: whereClause});
    res.json(users);
});

// Get User by ID
app.get("/users/:id", async (req, res) => {
    const user = await User.findByPk(req.params.id);
    user ? res.json(user) : res.status(404).send("User Not Found");
});

// Update User
app.put("/users/:id", async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (user) {
        await user.update(req.body);
        res.json(user);
    } else {
        res.status(404).send("User Not Found");
    }
});

// Delete User
app.delete("/users/:id", async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (user) {
        await user.destroy();
        res.json({ message: "User deleted" });
    } else {
        res.status(404).send("User Not Found");
    }
});

// Start Server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
