import express from "express";
const app = express();
import cors from "cors";
app.use(express.json());
import currencyRoutes from "./routes/currencyRoutes.js";
app.use(
  cors({
    origin: "http://localhost:5177",
  })
);
const POST = 9000;

app.use("/api", currencyRoutes);
app.listen(POST, () => {
  console.log(`✅ Server listen at port ${POST} `);
});
