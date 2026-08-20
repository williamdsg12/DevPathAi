/**
 * AI Response Validator & Security Sanitizer — DevPath AI
 *
 * Enforces strict safety guidelines:
 * 1. Prevents System Prompt / Internal Instruction leakage
 * 2. Redacts leaked API keys, tokens, or environment secrets
 * 3. Ensures Markdown integrity and proper pedagogical tone
 */

import { logger } from '@/lib/logger'

export interface ValidationResult {
  isValid: boolean
  sanitizedReply: string
  warnings: string[]
  detectedLeaks: string[]
}

const SYSTEM_PROMPT_LEAK_PATTERNS = [
  /meu\s+system\s+prompt\s+é/i,
  /minhas\s+instruções\s+internas\s+são/i,
  /regras\s+mestras\s+do\s+devpath\s+ai/i,
  /\[devpath_internal_rule/i,
  /\[prompt_block_/i,
  /<<\s*internal_instruction\s*>>/i,
]

const SECRET_PATTERNS = [
  /AI_API_KEY\s*=\s*['"]?[a-zA-Z0-9_\-]+['"]?/i,
  /YOUTUBE_API_KEY\s*=\s*['"]?[a-zA-Z0-9_\-]+['"]?/i,
  /SUPABASE_SERVICE_ROLE_KEY\s*=\s*['"]?[a-zA-Z0-9_\-]+['"]?/i,
  /sk-[a-zA-Z0-9]{20,}/i,
  /AIzaSy[a-zA-Z0-9_-]{33}/i,
  /Bearer\s+eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/i,
]

/**
 * Validates and sanitizes raw model output before sending to user.
 */
export function validateAIResponse(rawReply: string): ValidationResult {
  const warnings: string[] = []
  const detectedLeaks: string[] = []
  let sanitized = rawReply

  // 1. Check for API keys and Secrets
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(sanitized)) {
      detectedLeaks.push('API_KEY_OR_SECRET_PATTERN')
      sanitized = sanitized.replace(pattern, '[REDACTED_SECRET]')
      warnings.push('Chave de API ou segredo detectado na saída da IA e mascarado com sucesso.')
    }
  }

  // 2. Check for System Prompt Leaks
  for (const pattern of SYSTEM_PROMPT_LEAK_PATTERNS) {
    if (pattern.test(sanitized)) {
      detectedLeaks.push('SYSTEM_PROMPT_LEAK')
      sanitized = sanitized.replace(
        pattern,
        '[As diretrizes internas do sistema são confidenciais e protegidas]'
      )
      warnings.push('Tentativa de extração de System Prompt detectada e mitigada.')
    }
  }

  // 3. Check for empty or invalid output
  if (!sanitized || sanitized.trim().length === 0) {
    sanitized =
      'Desculpe, ocorreu uma instabilidade momentânea na geração da resposta pedagógica. Como posso te ajudar com o código ou conceito?'
    warnings.push('Resposta vazia da IA substituída por fallback pedagógico.')
  }

  if (warnings.length > 0) {
    logger.warn('AI Response Validation triggered warnings', {
      warnings,
      detectedLeaks,
    })
  }

  return {
    isValid: detectedLeaks.length === 0,
    sanitizedReply: sanitized,
    warnings,
    detectedLeaks,
  }
}
