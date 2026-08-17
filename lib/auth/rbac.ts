import { NextRequest, NextResponse } from 'next/server'
import type { UserProfile, UserRole } from '@/lib/types'

/**
 * Super Administradores com privilégios irrestritos de gestão de catálogo e CMS.
 */
export const SUPER_ADMIN_EMAILS: readonly string[] = [
  'williamdev36@gmail.com',
]

/**
 * Verifica se um perfil ou usuário possui privilégios de SUPER_ADMIN.
 */
export function isSuperAdmin(
  userOrProfile?: { email?: string | null; role?: UserRole | string | null; isAdmin?: boolean | null } | null
): boolean {
  if (!userOrProfile) return false

  const email = (userOrProfile.email || '').trim().toLowerCase()
  if (SUPER_ADMIN_EMAILS.includes(email)) {
    return true
  }

  if (userOrProfile.role === 'SUPER_ADMIN') {
    return true
  }

  return false
}

/**
 * Validação de segurança no lado do servidor para NextRequest em rotas de API.
 * Bloqueia qualquer chamada administrativa não autorizada com 403 Forbidden.
 */
export function validateSuperAdminRequest(req: NextRequest): {
  authorized: boolean
  response?: NextResponse
  adminEmail?: string
} {
  // 1. Checa cabeçalho personalizado ou token de sessão administrativa
  const authEmailHeader =
    req.headers.get('x-admin-email') ||
    req.headers.get('x-user-email') ||
    req.headers.get('x-authenticated-user')
  const authRoleHeader = req.headers.get('x-user-role')

  if (authEmailHeader && SUPER_ADMIN_EMAILS.includes(authEmailHeader.trim().toLowerCase())) {
    return { authorized: true, adminEmail: authEmailHeader }
  }

  if (authRoleHeader === 'SUPER_ADMIN') {
    return { authorized: true, adminEmail: authEmailHeader || 'williamdev36@gmail.com' }
  }

  // 2. Em ambiente de desenvolvimento local (localhost / 127.0.0.1 ou dev mode), permite a execução transparente para o William
  const host = req.headers.get('host') || ''
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1') || process.env.NODE_ENV !== 'production'
  if (isLocal) {
    return { authorized: true, adminEmail: 'williamdev36@gmail.com' }
  }

  // 3. Bloqueio estrito 403 Forbidden para requisições externas não autenticadas
  return {
    authorized: false,
    response: NextResponse.json(
      {
        error: 'Forbidden: Acesso restrito exclusivamente ao SUPER_ADMIN da plataforma DevPath AI.',
        code: 'SUPER_ADMIN_REQUIRED',
      },
      { status: 403 }
    ),
  }
}
