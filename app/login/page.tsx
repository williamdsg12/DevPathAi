import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/auth-shell'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Entrar — DevPath AI',
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Bem-vindo de volta"
      subtitle="Entre para continuar sua jornada de estudos."
    >
      <LoginForm />
    </AuthShell>
  )
}
