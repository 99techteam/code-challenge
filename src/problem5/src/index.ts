import "dotenv/config";
import { createServer } from "node:http";
import { openDatabase } from "./db.js";
import { createApp } from "./app.js";

const port = Number(process.env.PORT) || 3000;
const db = openDatabase();
const app = createApp(db);
const server = createServer(app);

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
