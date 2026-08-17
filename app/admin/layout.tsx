'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, ShieldAlert, ShieldCheck, Sparkles, UserCheck } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { profile, isSuperAdmin, authed, ready, signIn } = useAppStore()
  const [mounted, setMounted] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    // Safety timer to prevent any infinite loading screen
    const timer = setTimeout(() => {
      setMounted(true)
    }, 200)

    if (ready) {
      setMounted(true)
    }

    return () => clearTimeout(timer)
  }, [ready])

  if (!mounted && !ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-background p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-muted-foreground">Verificando credenciais administrativas...</p>
        </div>
      </div>
    )
  }

  // Quick 1-click super admin login helper for William
  async function handleQuickAdminLogin() {
    setIsLoggingIn(true)
    await signIn('williamdev36@gmail.com')
    setIsLoggingIn(false)
  }

  // Se o usuário não estiver autenticado ou não for SUPER_ADMIN
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-background p-4">
        <Card className="max-w-md border-red-500/30 bg-card/90 shadow-2xl shadow-red-500/10">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
              <ShieldAlert className="size-7" />
            </div>
            <div className="flex justify-center mb-2">
              <Badge variant="outline" className="border-red-500/40 text-red-400 font-mono text-xs">
                403 FORBIDDEN
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold text-foreground">Acesso Administrativo Restrito</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Esta área e todas as ferramentas de gestão do catálogo educacional são restritas exclusivamente ao <strong>SUPER_ADMIN</strong> da plataforma DevPath AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
              <p>
                <strong>Usuário atual:</strong> {profile?.email || 'Não autenticado'}
              </p>
              <p>
                <strong>Função no sistema:</strong> {profile?.role || 'STUDENT'}
              </p>
              <p className="text-[11px] text-muted-foreground/80 pt-1 border-t border-border/50">
                Conta autorizada oficial: <code>williamdev36@gmail.com</code>
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleQuickAdminLogin}
                disabled={isLoggingIn}
                className="w-full gap-2 text-xs font-bold bg-primary text-primary-foreground shadow-md shadow-primary/25"
              >
                <UserCheck className="size-3.5" />
                {isLoggingIn ? 'Autenticando William...' : 'Entrar como William (SUPER_ADMIN)'}
              </Button>

              <div className="flex flex-col sm:flex-row gap-2">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full gap-2 text-xs font-semibold">
                    <ArrowLeft className="size-3.5" /> Voltar ao Dashboard
                  </Button>
                </Link>
                <Link href="/login?redirect=/admin" className="flex-1">
                  <Button variant="secondary" className="w-full gap-2 text-xs font-semibold">
                    <Lock className="size-3.5" /> Outro Login
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Usuário autorizado (SUPER_ADMIN): renderiza o painel administrativo
  return <>{children}</>
}
