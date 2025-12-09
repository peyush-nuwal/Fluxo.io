import winston from "winston";

// -------------------------------------------
// Custom log colors (for dev console only)
// -------------------------------------------
winston.addColors({
  error: "red bold",
  warn: "yellow",
  info: "green",
  http: "cyan",
  debug: "magenta",
});

// -------------------------------------------
// Base logger (used for both prod + dev)
// -------------------------------------------
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
  ),

  defaultMeta: { service: "fluxo-auth-service" },

  transports: [
    // Error-only log file
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),

    // All logs
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

// -------------------------------------------
// Development mode console (color + pretty)
// -------------------------------------------
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),

        winston.format.timestamp({
          format: "HH:mm:ss",
        }),

        winston.format.printf(({ timestamp, level, message, stack }) => {
          // Show stack for errors
          if (stack) {
            return `${timestamp} ${level}: ${stack}`;
          }
          return `${timestamp} ${level}: ${message}`;
        }),
      ),
    }),
  );
}

// -------------------------------------------
// Production mode console (JSON only)
// -------------------------------------------
if (process.env.NODE_ENV === "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.json(),
    }),
  );
}

export default logger;
