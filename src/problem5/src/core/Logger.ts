import path from "path";
import fs from "fs";
import { createLogger, format, transports } from "winston"
import DailyRotateFile from "winston-daily-rotate-file";
import { environment, logDirectory } from "../config";
import moment from "moment-timezone";

let dir = logDirectory;
if (!dir) dir = path.resolve('logs');

// create directory if it is not present
if (!fs.existsSync(dir)) {
  // Create the directory if it does not exist
  fs.mkdirSync(dir);
}

const logLevel = environment === "development" ? "debug" : "warn";

const dailyRotateFile = new DailyRotateFile({
  level: logLevel,
  filename: dir + "/%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  handleExceptions: true,
  maxSize: "20m",
  maxFiles: "14d",
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.json(),
  )
});

// Vietnam timezone format function
const vietnamTimezone = format((info) => {
  info.timestamp = moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss");
  return info;
})

const logger = createLogger({
  transports: [
    new transports.Console({
      level: logLevel,
      format: format.combine(
        vietnamTimezone(),
        format.errors({ stack: true }),
        format.prettyPrint(),
      ),
    }),
    dailyRotateFile
  ],
  exceptionHandlers: [dailyRotateFile],
  exitOnError: false // do not exit on handled exceptions
});

export default logger;