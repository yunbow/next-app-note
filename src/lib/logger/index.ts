import pino from "pino";

// 構造化ログ用のロガー設定
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  base: {
    env: process.env.NODE_ENV,
  },
});

// コンテキスト付きロガーの作成
export function createLogger(context: string) {
  return logger.child({ context });
}

// リクエストロガーの作成（Trace ID付き）
export function createRequestLogger(requestId: string, userId?: string) {
  return logger.child({
    requestId,
    userId,
  });
}

// エラーログのヘルパー
export function logError(
  error: unknown,
  context: string,
  additionalInfo?: Record<string, unknown>
) {
  const errorLogger = createLogger(context);
  
  if (error instanceof Error) {
    errorLogger.error(
      {
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack,
        },
        ...additionalInfo,
      },
      `Error in ${context}`
    );
  } else {
    errorLogger.error(
      {
        error: String(error),
        ...additionalInfo,
      },
      `Unknown error in ${context}`
    );
  }
}

// 成功ログのヘルパー
export function logSuccess(
  message: string,
  context: string,
  data?: Record<string, unknown>
) {
  const successLogger = createLogger(context);
  successLogger.info(data, message);
}

// 警告ログのヘルパー
export function logWarning(
  message: string,
  context: string,
  data?: Record<string, unknown>
) {
  const warningLogger = createLogger(context);
  warningLogger.warn(data, message);
}
