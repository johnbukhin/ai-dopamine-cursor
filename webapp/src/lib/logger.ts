type LogContext = Record<string, unknown> | undefined;

const PREFIX = '[Compass]';

const write = (level: 'warn' | 'error', message: string, context?: LogContext): void => {
  const formatted = `${PREFIX} ${message}`;
  if (context) {
    console[level](formatted, context);
    return;
  }
  console[level](formatted);
};

/**
 * Lightweight logger for client-side diagnostics.
 * Keep verbosity low in production while preserving error visibility.
 */
export const logger = {
  warn: (message: string, context?: LogContext): void => {
    if (import.meta.env.DEV) {
      write('warn', message, context);
    }
  },
  error: (message: string, context?: LogContext): void => {
    write('error', message, context);
  },
};
