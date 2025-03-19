import express from "express";
import cors from "cors";
import routes from "./routes/index"; 

const app = express();
const port = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());

app.use("/api", routes);

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
