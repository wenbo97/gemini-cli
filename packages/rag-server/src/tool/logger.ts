import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}]: ${message}`;
    })
);

const logger = winston.createLogger({
    level: "debug",  // Changed from "info" to capture debug logs
    format: logFormat,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), logFormat),
            level: "debug",
        }),
        new winston.transports.File({
            filename: path.resolve(__dirname, "../../../../logs/app.log"),  // Absolute path to logs folder
            level: "debug",
        }),
    ],
});

export default logger;
