import { createLogger, format, transports } from "winston";
import fs from "fs";
import path from "path";

// Ensure logs folder exists
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const logFile = path.join(logDir, "app.log");

const Logger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)
    ),
    transports: [
        new transports.Console(),          // Console output in dev
        new transports.File({ filename: logFile }) // Single log file
    ],
});

export default Logger;