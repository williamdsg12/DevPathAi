/**
 * Structured Logger — DevPath AI
 *
 * Provides structured JSON / formatted logging with log levels,
 * ISO timestamps, sensitive data redaction, and error tracing.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const CURRENT_LOG_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

const SENSITIVE_KEYS = [
  'password',
  'pass',
  'senha',
  'token',
  'apikey',
  'api_key',
  'secret',
  'authorization',
  'cookie',
  'service_role',
  'serviceRoleKey',
  'jwt',
]

function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') return data

  if (Array.isArray(data)) {
    return data.map(sanitizeData)
  }

  const sanitized: Record<string, any> = {}
  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))
    if (isSensitive && typeof value === 'string') {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  module: string
  message: string
  metadata?: Record<string, any>
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private formatLog(level: LogLevel, module: string, message: string, meta?: any, err?: any): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
    }

    if (meta) {
      entry.metadata = sanitizeData(meta)
    }

    if (err instanceof Error) {
      entry.error = {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
      }
    }

    return entry
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LOG_LEVEL]
  }

  debug(module: string, message: string, meta?: any) {
    if (!this.shouldLog('debug')) return
    const entry = this.formatLog('debug', module, message, meta)
    console.debug(`[${entry.timestamp}] [DEBUG] [${module}] ${message}`, meta ? entry.metadata : '')
  }

  info(module: string, message: string, meta?: any) {
    if (!this.shouldLog('info')) return
    const entry = this.formatLog('info', module, message, meta)
    console.info(`[${entry.timestamp}] [INFO] [${module}] ${message}`, meta ? entry.metadata : '')
  }

  warn(module: string, message: string, meta?: any) {
    if (!this.shouldLog('warn')) return
    const entry = this.formatLog('warn', module, message, meta)
    console.warn(`[${entry.timestamp}] [WARN] [${module}] ${message}`, meta ? entry.metadata : '')
  }

  error(module: string, message: string, err?: any, meta?: any) {
    if (!this.shouldLog('error')) return
    const entry = this.formatLog('error', module, message, meta, err)
    console.error(`[${entry.timestamp}] [ERROR] [${module}] ${message}`, err || '', meta ? entry.metadata : '')
  }
}

export const logger = new Logger()
