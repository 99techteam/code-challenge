import "reflect-metadata";
import dotenv from "dotenv";
import { app } from "./app.js";
import { closeDatabase, initializeDatabase } from "./db/dbConfig.js";

dotenv.config();

const port = Number(process.env.PORT || 3000);

async function bootstrap(): Promise<void> {
    await initializeDatabase();

    const server = app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });

    const shutdown = async (): Promise<void> => {
        server.close(async () => {
            await closeDatabase();
            process.exit(0);
        });
    };

    process.on("SIGINT", shutdown);
}

bootstrap().catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
});
