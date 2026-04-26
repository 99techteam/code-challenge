import app from "@/app";
import { config } from "@/config";
import { connectDB, disconnectDB } from "@/db/mongo";

app.listen(config.port, () => {
  connectDB();
  console.log(`Server running at http://localhost:${config.port}`);
});

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await disconnectDB();
  process.exit(0);
});