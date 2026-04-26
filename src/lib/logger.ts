import pino from "pino";
import { env } from "@/lib/config/env";

export const logger = pino({
  level: env.LOG_LEVEL ?? (env.NODE_ENV === "development" ? "debug" : "info"),
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        }
      : undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "password", "*.password",
      "secret", "*.secret",
      "token", "*.token",
      "accessToken", "*.accessToken",
      "refreshToken", "*.refreshToken",
      "creditCard", "*.creditCard",
      "authorization", "*.authorization",
      "headers.cookie", "headers['set-cookie']", "headers.authorization",
      "req.headers.cookie", "req.headers.authorization",
    ],
    censor: "[REDACTED]",
  },
  base: { service: "next-app-note", env: env.NODE_ENV },
});
