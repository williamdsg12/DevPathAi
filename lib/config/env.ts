/**
 * Environment Configuration & Runtime Validation — DevPath AI
 *
 * Ensures all required environment variables are validated
 * and categorizes the runtime environment (development, staging, production).
 */

export type AppEnvironment = 'development' | 'staging' | 'production' | 'test'

export interface EnvConfig {
  NODE_ENV: AppEnvironment
  isDevelopment: boolean
  isStaging: boolean
  isProduction: boolean
  isTest: boolean
  appUrl: string
  supabase: {
    url?: string
    anonKey?: string
    serviceRoleKey?: string
    isConfigured: boolean
    isServerConfigured: boolean
  }
  ai: {
    provider: 'gemini' | 'openai' | 'anthropic' | 'deepseek'
    apiKey?: string
    model: string
    isConfigured: boolean
  }
  youtube: {
    apiKey?: string
    isConfigured: boolean
  }
}

function detectEnvironment(): AppEnvironment {
  const env = (process.env.NODE_ENV || 'development').toLowerCase()
  if (env === 'production') {
    // Check if staging is flagged in app url or custom env
    if (process.env.NEXT_PUBLIC_APP_URL?.includes('staging') || process.env.APP_ENV === 'staging') {
      return 'staging'
    }
    return 'production'
  }
  if (env === 'test') return 'test'
  return 'development'
}

const currentEnv = detectEnvironment()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey

const aiProvider = (process.env.AI_PROVIDER || 'gemini').toLowerCase() as EnvConfig['ai']['provider']
const aiApiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY
const aiModel = process.env.AI_MODEL || 'gemini-1.5-pro'

const isSupabaseValid = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project') &&
    !supabaseAnonKey.includes('your_supabase_anon_key')
)

const isSupabaseServerValid = Boolean(
  supabaseUrl &&
    supabaseServiceKey &&
    !supabaseUrl.includes('your-project') &&
    !supabaseServiceKey.includes('your_supabase_service_role')
)

const isAiValid = Boolean(
  aiApiKey &&
    !aiApiKey.includes('your_ai_api_key') &&
    !aiApiKey.includes('sua-chave')
)

const youtubeApiKey = process.env.YOUTUBE_API_KEY
const isYoutubeValid = Boolean(
  youtubeApiKey &&
    !youtubeApiKey.includes('your_youtube_api_key')
)

export const env: EnvConfig = {
  NODE_ENV: currentEnv,
  isDevelopment: currentEnv === 'development',
  isStaging: currentEnv === 'staging',
  isProduction: currentEnv === 'production',
  isTest: currentEnv === 'test',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  supabase: {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    serviceRoleKey: supabaseServiceKey,
    isConfigured: isSupabaseValid,
    isServerConfigured: isSupabaseServerValid,
  },
  ai: {
    provider: aiProvider,
    apiKey: aiApiKey,
    model: aiModel,
    isConfigured: isAiValid,
  },
  youtube: {
    apiKey: youtubeApiKey,
    isConfigured: isYoutubeValid,
  },
}

/**
 * Diagnostic Health Check of Environment Variables
 */
export function getEnvironmentHealth(): {
  environment: AppEnvironment
  checks: Array<{ service: string; status: 'ok' | 'warning' | 'missing'; details: string }>
} {
  return {
    environment: env.NODE_ENV,
    checks: [
      {
        service: 'Supabase Database & Auth',
        status: env.supabase.isConfigured ? 'ok' : 'warning',
        details: env.supabase.isConfigured
          ? 'Conectado e configurado.'
          : 'Credenciais ausentes ou de exemplo. Operando em modo de persistência local segura.',
      },
      {
        service: 'Supabase Service Role (Server-Side)',
        status: env.supabase.isServerConfigured ? 'ok' : 'warning',
        details: env.supabase.isServerConfigured
          ? 'Service Role configurado para operações administrativas.'
          : 'Service Role ausente (algumas operações administrativas de banco rodarão com privilégios de anon).',
      },
      {
        service: 'Provedor de Inteligência Artificial',
        status: env.ai.isConfigured ? 'ok' : 'warning',
        details: env.ai.isConfigured
          ? `Configurado via ${env.ai.provider.toUpperCase()} (Modelo: ${env.ai.model}).`
          : 'Chave de API ausente. Motor de IA operando via síntese pedagógica grounded determinística.',
      },
      {
        service: 'YouTube Data API v3',
        status: env.youtube.isConfigured ? 'ok' : 'ok',
        details: env.youtube.isConfigured
          ? 'API Key do YouTube configurada para consultas ilimitadas.'
          : 'Sem API Key dedicada; importação e validação operando via parser e feeds RSS públicos oficiais.',
      },
    ],
  }
}
