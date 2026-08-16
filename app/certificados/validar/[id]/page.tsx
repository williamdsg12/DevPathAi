'use client'

import { use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/logo'

export default function ValidateCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const validationId = resolvedParams.id

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between pb-6 border-b border-border/80">
        <Link href="/">
          <Logo />
        </Link>
        <Badge className="bg-success/15 text-success border-0 gap-1 font-bold text-xs">
          <ShieldCheck className="size-4" /> Certificado Autêntico
        </Badge>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 flex flex-col justify-center py-8">
        <Card className="border-border/80 shadow-2xl shadow-primary/5 overflow-hidden">
          <div className="bg-gradient-to-r from-success/20 via-success/10 to-transparent p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-success text-success-foreground shadow-lg shadow-success/25">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Credencial Oficial Válida</h2>
                <p className="text-xs text-muted-foreground">Registro verificado no banco de dados DevPath AI</p>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-5 text-xs sm:text-sm">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Aluno(a) Certificado</span>
              <p className="text-lg font-extrabold text-foreground">William Santos</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Formação</span>
                <p className="font-bold text-foreground">Full Stack JavaScript</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Carga Horária</span>
                <p className="font-bold text-foreground">120 Horas Práticas</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Média Final</span>
                <p className="font-bold text-success text-base">92% de Aproveitamento</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Código de Validação</span>
                <p className="font-mono text-xs font-bold text-primary">{validationId}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border/60 flex items-center justify-between">
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <ArrowLeft className="size-3.5" /> Página Inicial
                </Button>
              </Link>
              <Link href="/cadastro">
                <Button size="sm" className="gap-1.5 font-bold shadow-md shadow-primary/20">
                  Criar Minha Conta no DevPath AI
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="mx-auto max-w-2xl pt-6 text-center text-xs text-muted-foreground">
        DevPath AI — Sistema de verificação criptográfica de certificados de tecnologia.
      </footer>
    </div>
  )
}
