/**
 * Request Validation Utilities — DevPath AI
 *
 * Lightweight, zero-dependency validation helpers for API payloads,
 * parameters, and data sanitization.
 */

import { ValidationError } from './errors'

export function validateRequiredString(value: any, fieldName: string, minLength = 1, maxLength = 50000): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ValidationError(`O campo "${fieldName}" é obrigatório e deve ser um texto válido.`)
  }
  const trimmed = value.trim()
  if (trimmed.length < minLength) {
    throw new ValidationError(`O campo "${fieldName}" deve conter no mínimo ${minLength} caracteres.`)
  }
  if (trimmed.length > maxLength) {
    throw new ValidationError(`O campo "${fieldName}" não pode exceder ${maxLength} caracteres.`)
  }
  return trimmed
}

export function validateEmail(email: any): string {
  const str = validateRequiredString(email, 'email', 5, 255)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(str)) {
    throw new ValidationError('Informe um endereço de e-mail válido.')
  }
  return str.toLowerCase()
}

export function validateUrl(url: any, fieldName = 'URL', optional = false): string | undefined {
  if (optional && (!url || typeof url !== 'string' || !url.trim())) {
    return undefined
  }
  const str = validateRequiredString(url, fieldName, 8, 2000)
  try {
    const parsed = new URL(str)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new ValidationError(`O campo "${fieldName}" deve utilizar protocolo HTTP ou HTTPS.`)
    }
    return parsed.toString()
  } catch (err) {
    throw new ValidationError(`O campo "${fieldName}" deve ser uma URL válida.`)
  }
}

export function validateArray<T>(value: any, fieldName: string, minItems = 0, maxItems = 1000): T[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(`O campo "${fieldName}" deve ser uma lista (array).`)
  }
  if (value.length < minItems) {
    throw new ValidationError(`O campo "${fieldName}" deve conter pelo menos ${minItems} item(ns).`)
  }
  if (value.length > maxItems) {
    throw new ValidationError(`O campo "${fieldName}" não pode conter mais de ${maxItems} itens.`)
  }
  return value
}

export function validateEnum<T extends string>(value: any, fieldName: string, allowedValues: readonly T[]): T {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      `Valor inválido para o campo "${fieldName}". Valores permitidos: ${allowedValues.join(', ')}.`
    )
  }
  return value as T
}
