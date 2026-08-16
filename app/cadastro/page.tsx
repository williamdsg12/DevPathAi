import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/auth-shell'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata: Metadata = {
  title: 'Criar conta — DevPath AI',
}

export default function CadastroPage() {
  return (
    <AuthShell
      title="Crie sua conta gratuita"
      subtitle="Comece hoje sua trilha personalizada rumo à carreira dev."
    >
      <SignupForm />
    </AuthShell>
  )
}
