import { bootstrapPlatform, closePlatform } from "./bootstrap";
import { config } from "dotenv";

import { app } from "./interfaces/server/app";
import * as Logger from "./utils/Logger";

config();

const API_CORS_ORIGIN  = process.env.API_CORS_ORIGIN as string;
const RUNNING_PORT     = process.env.RUNNING_PORT as number | string || 3000;

try {
  bootstrapPlatform().then(() => {
    // do something here
    app(API_CORS_ORIGIN)
      .listen(RUNNING_PORT, () => Logger.instance.info(`App listening on port ${RUNNING_PORT}!`));
  });
} catch (e) {
  if (e instanceof Error) {
    Logger.instance.error(e.message);
  } else {
    Logger.instance.error("Unknown error occurred.");
  }
} finally {
  closePlatform();
}
