import express from "express";
import mongoose from "mongoose";
import router from "./routes";

const app = express();
app.use(express.json());
// console.log("Hello");

//TEST
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.post("/api/book", (req, res) => {
  console.log(req.body);
  res.send(req.body);
});

//connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://user1:1@cluster0.t8id7.mongodb.net/Node-API?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Connected to MongoDB");
    //API endpoints
    app.use("/", router);
    app.listen(4000, () => console.log("Server running on port 4000"));
  })
  .catch((err) => console.error(err));
