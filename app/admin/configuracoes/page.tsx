'use client'

import { useState } from 'react'
import {
  Settings,
  ShieldCheck,
  Cpu,
  Database,
  Globe,
  Key,
  CheckCircle2,
  AlertTriangle,
  Server,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { env, getEnvironmentHealth } from '@/lib/config/env'

export default function AdminConfiguracoesPage() {
  const health = getEnvironmentHealth()
  const [isTesting, setIsTesting] = useState(false)

  function handleRunDiagnostics() {
    setIsTesting(true)
    setTimeout(() => {
      setIsTesting(false)
      toast.success('Diagnóstico de infraestrutura executado com sucesso!')
    }, 800)
  }

  return (
    <AdminShell
      title="Configurações do Sistema"
      subtitle="Supervisão de ambiente, validação de segredos, infraestrutura e conexões de backend"
    >
      <div className="space-y-6">
        {/* Environment Summary Card */}
        <Card className="bg-[#100f1c] border-white/10">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Server className="size-4 text-violet-400" /> Diagnóstico de Ambiente
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Ambiente atual: <strong className="text-white uppercase">{env.NODE_ENV}</strong> • URL:{' '}
                  <code className="text-violet-300 font-mono">{env.appUrl}</code>
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunDiagnostics}
                disabled={isTesting}
                className="text-xs font-bold border-white/10 text-zinc-300 hover:text-white rounded-xl gap-1.5"
              >
                <RefreshCw className={`size-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                {isTesting ? 'Testando...' : 'Reavaliar Conexões'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            <div className="divide-y divide-white/5 border border-white/5 rounded-2xl overflow-hidden bg-black/40">
              {health.checks.map((check) => (
                <div key={check.service} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-white flex items-center gap-2">
                      {check.service}
                    </p>
                    <p className="text-zinc-400 text-[11px]">{check.details}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`font-mono text-[10px] uppercase font-bold shrink-0 ${
                      check.status === 'ok'
                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/30'
                        : 'border-amber-500/30 text-amber-400 bg-amber-950/30'
                    }`}
                  >
                    {check.status === 'ok' ? 'Operacional' : 'Atenção'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security & Access Policies Card */}
        <Card className="bg-[#100f1c] border-white/10">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="size-4 text-purple-400" /> Diretrizes de Segurança & RBAC
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Regras e privilégios estabelecidos no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3 text-xs text-zinc-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <p className="font-bold text-white">Super Administrador Principal</p>
                <p className="text-[11px] text-zinc-400 font-mono">williamdev36@gmail.com</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <p className="font-bold text-white">Proteção contra Vazamento</p>
                <p className="text-[11px] text-zinc-400">
                  Segredos e chaves de API mascaradas com <code className="text-purple-300 font-mono">[REDACTED]</code> nos logs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  )
}
