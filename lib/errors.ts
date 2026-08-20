/**
 * Central Error Hierarchy & API Response Formatter — DevPath AI
 *
 * Provides typed domain errors and safe API response formatters
 * that prevent sensitive stack leaks in production.
 */

import { NextResponse } from 'next/server'
import { logger } from './logger'

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: any
  public readonly isOperational: boolean

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: any) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details)
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Usuário não autenticado.') {
    super(message, 401, 'UNAUTHENTICATED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acesso restrito. Privilégios insuficientes.') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Recurso', identifier?: string) {
    const msg = identifier ? `${resource} "${identifier}" não encontrado.` : `${resource} não encontrado.`
    super(msg, 404, 'NOT_FOUND')
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details)
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Limite de requisições excedido. Tente novamente em instantes.') {
    super(message, 429, 'RATE_LIMITED')
  }
}

export class ExternalServiceError extends AppError {
  constructor(serviceName: string, originalMessage?: string) {
    const msg = originalMessage
      ? `Falha na integração com o serviço externo "${serviceName}": ${originalMessage}`
      : `Falha na comunicação com o serviço externo "${serviceName}".`
    super(msg, 502, 'EXTERNAL_SERVICE_ERROR', { service: serviceName })
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Erro ao processar operação no banco de dados.', details?: any) {
    super(message, 500, 'DATABASE_ERROR', details)
  }
}

/**
 * Standardized API Error Handler
 * Transforms any caught error into a safe, structured NextResponse.
 */
export function handleApiError(error: unknown, moduleName = 'API'): NextResponse {
  if (error instanceof AppError) {
    logger.warn(moduleName, `[${error.code}] ${error.message}`, {
      statusCode: error.statusCode,
      details: error.details,
    })

    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details || undefined,
      },
      { status: error.statusCode }
    )
  }

  // Native or unhandled errors
  const err = error instanceof Error ? error : new Error(String(error))
  logger.error(moduleName, 'Erro interno não tratado', err)

  const isDev = process.env.NODE_ENV !== 'production'

  return NextResponse.json(
    {
      error: isDev ? err.message : 'Ocorreu um erro interno ao processar a solicitação.',
      code: 'INTERNAL_SERVER_ERROR',
      ...(isDev ? { stack: err.stack } : {}),
    },
    { status: 500 }
  )
}
