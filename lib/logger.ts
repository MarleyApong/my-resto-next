import { createLogger, format, transports } from "winston"
import DailyRotateFile from "winston-daily-rotate-file"

// Type logger
type Logger = ReturnType<typeof createLogger>

// Créer une instance du logger
const loggerInstance = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message }) => {
      const environment = process.env.NODE_ENV || "development"
      return `${timestamp} [${level.toUpperCase()}] [${environment}] : ${message}`
    })
  ),
  transports: [
    new transports.Console(),
    ...(process.env.NODE_ENV === "production"
      ? [
          new DailyRotateFile({
            dirname: "logs",
            filename: "app-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d"
          })
        ]
      : [])
  ]
})

// Étendre l'objet global
declare global {
  // Ajouter `logger` dans l'objet global avec le type correct
  var logger: Logger
}

// Éviter de réinitialiser `global.logger` à chaque rechargement
if (!global.logger) {
  global.logger = loggerInstance
}

export default global.logger
