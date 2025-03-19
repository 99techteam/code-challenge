import express from "express";
import todoRoute from "./todo.route"; 

const router = express.Router();

router.get("/", (req, res) => {
  res.send("API V1 is running");
});

router.use("/todo", todoRoute);

export default router;
