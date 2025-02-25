import app from "./app";
import { port } from "./config";
import logger from "./core/Logger";
import AppDataSource from "./database"
import seed from "./database/seeding/seed";

(async () => {
  try {
    await AppDataSource.initialize();
    await seed();
    console.info('Database connected successfully');
    logger.info('Database connected successfully at');
  } catch (error) {
    logger.error(`Failed to connect to the database at `, error);
    console.error('Failed to connect to the database', error);
  }
})();

app
  .listen(port, () => {
    logger.info(`server running on port : ${port}`);
    console.info(`server running on port : ${port}`);
  })
  .on("error", (e) => {
    logger.error('Server error: ', e);
    console.error(e);
  });
