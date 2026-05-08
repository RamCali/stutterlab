import "server-only";

type LogLevel = "info" | "warn" | "error";

type LogFields = Record<
  string,
  string | number | boolean | null | undefined
>;

type LogEvent = {
  level: LogLevel;
  event: string;
  fields?: LogFields;
  error?: unknown;
};

export function logInfo(event: string, fields?: LogFields) {
  writeLog({ level: "info", event, fields });
}

export function logWarn(event: string, fields?: LogFields) {
  writeLog({ level: "warn", event, fields });
}

export function logError(event: string, error?: unknown, fields?: LogFields) {
  writeLog({ level: "error", event, fields, error });
}

export async function measureAsync<T>(
  event: string,
  fields: LogFields,
  fn: () => Promise<T>
): Promise<T> {
  const startedAt = Date.now();
  try {
    const result = await fn();
    logInfo(`${event}.success`, {
      ...fields,
      durationMs: Date.now() - startedAt,
    });
    return result;
  } catch (error) {
    logError(`${event}.failure`, error, {
      ...fields,
      durationMs: Date.now() - startedAt,
    });
    throw error;
  }
}

function writeLog({ level, event, fields, error }: LogEvent) {
  const payload = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...sanitizeFields(fields),
    ...(error ? { error: serializeError(error) } : {}),
  };

  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

function sanitizeFields(fields?: LogFields) {
  if (!fields) return {};

  return Object.fromEntries(
    Object.entries(fields).filter(([key]) => {
      const lower = key.toLowerCase();
      return (
        !lower.includes("token") &&
        !lower.includes("secret") &&
        !lower.includes("key") &&
        !lower.includes("email") &&
        !lower.includes("transcript") &&
        !lower.includes("message")
      );
    })
  );
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  return {
    message: String(error),
  };
}
