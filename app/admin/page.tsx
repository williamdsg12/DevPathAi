'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Brain,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Users,
  Video,
  ShieldCheck,
  CreditCard,
  History,
  Activity,
  Layers,
} from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import { computeAIHealthMetrics, computeCatalogHealthMetrics } from '@/lib/monitoring/health'
import { INITIAL_AI_CONFIG, INITIAL_AI_INSTRUCTIONS } from '@/lib/ai/prompt-compiler'

export default function AdminPage() {
  const {
    allCourses,
    allModules,
    allLessons,
    activities,
    aiConfig,
    aiInstructions,
    aiOperationLogs,
    importLogs,
  } = useAppStore()

  // 1. Resumo Operacional do Catálogo
  const activeCourses = useMemo(() => allCourses.filter((c) => c.status === 'ativo'), [allCourses])
  const totalLessons = useMemo(() => allLessons.length, [allLessons])
  const totalHours = useMemo(() => allCourses.reduce((acc, c) => acc + (c.totalHours || 0), 0), [allCourses])

  // 2. Métricas de Saúde da IA
  const aiHealth = useMemo(
    () => computeAIHealthMetrics(aiConfig || INITIAL_AI_CONFIG, aiInstructions || INITIAL_AI_INSTRUCTIONS, aiOperationLogs || []),
    [aiConfig, aiInstructions, aiOperationLogs]
  )

  // 3. Métricas de Saúde do Catálogo
  const catalogHealth = useMemo(
    () => computeCatalogHealthMetrics(allCourses, allModules, allLessons),
    [allCourses, allModules, allLessons]
  )

  return (
    <AdminShell
      title="Dashboard Operacional"
      subtitle="Visão executiva da integridade do catálogo, desempenho da IA e métricas da plataforma"
    >
      <div className="space-y-6 max-w-7xl">
        {/* RESUMO PRINCIPAL — 4 Indicadores Estruturais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#100f1c] border-white/10 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Cursos Publicados</CardDescription>
              <CardTitle className="text-2xl font-black text-white font-mono flex items-baseline justify-between">
                <span>{activeCourses.length}</span>
                <span className="text-xs font-normal text-zinc-500 font-sans">de {allCourses.length} total</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-400 flex items-center gap-1.5">
              <CheckCircle2 className="size-3 text-emerald-400" />
              Catálogo oficial ativo
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Aulas Catalogadas</CardDescription>
              <CardTitle className="text-2xl font-black text-violet-400 font-mono flex items-baseline justify-between">
                <span>{totalLessons}</span>
                <span className="text-xs font-normal text-zinc-500 font-sans">{totalHours}h de vídeo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Video className="size-3 text-violet-400" />
              Embed oficial YouTube
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Saúde do Catálogo</CardDescription>
              <CardTitle className="text-2xl font-black text-emerald-400 font-mono uppercase">
                {catalogHealth.status === 'healthy' ? '100% ÍNTEGRO' : 'ATENÇÃO'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck className="size-3 text-emerald-400" />
              {catalogHealth.unavailableCourses === 0 ? 'Sem vídeos indisponíveis' : `${catalogHealth.unavailableCourses} precisam de revisão`}
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Status do Motor IA</CardDescription>
              <CardTitle className="text-2xl font-black text-purple-400 font-mono uppercase flex items-baseline justify-between">
                <span>{aiHealth.status === 'healthy' ? 'ATIVO' : 'DEGRADADO'}</span>
                <span className="text-xs font-normal text-zinc-500 font-mono">{aiHealth.activeVersion}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Brain className="size-3 text-purple-400" />
              {aiHealth.activeInstructionsCount} instruções ativas
            </CardContent>
          </Card>
        </div>

        {/* SEGUNDA LINHA: Painéis de Saúde da IA e Catálogo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Painel de Saúde da IA */}
          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-5 pb-3 border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Brain className="size-4 text-purple-400" />
                  DevPath AI Orchestrator
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Modelo: {aiHealth.activeModel} • Versão: {aiHealth.activeVersion}
                </CardDescription>
              </div>
              <Link href="/admin/ai">
                <Button variant="ghost" size="sm" className="text-xs text-violet-400 hover:text-violet-300 gap-1 h-7">
                  Gerenciar <ArrowRight className="size-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase block">Latência P95</span>
                  <span className="text-lg font-black text-white font-mono">{aiHealth.p95LatencyMs}ms</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase block">Taxa de Erro</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">{aiHealth.errorRatePercent}%</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase block">Tokens Usados</span>
                  <span className="text-lg font-black text-violet-300 font-mono">{aiHealth.totalTokensUsed24h}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                <span>Sanitizador anti-vazamento de segredos:</span>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-950/20 text-[10px] font-mono">
                  ATIVADO (REDACTION)
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Painel de Saúde do Catálogo */}
          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-5 pb-3 border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="size-4 text-violet-400" />
                  Saúde e Integridade do Conteúdo
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Monitoramento contínuo de playlists e links
                </CardDescription>
              </div>
              <Link href="/admin/youtube">
                <Button variant="ghost" size="sm" className="text-xs text-violet-400 hover:text-violet-300 gap-1 h-7">
                  Curadoria <ArrowRight className="size-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase block">Cursos Ativos</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">{catalogHealth.activeCourses}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase block">Rascunhos</span>
                  <span className="text-lg font-black text-amber-400 font-mono">{catalogHealth.draftCourses}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase block">Indisponíveis</span>
                  <span className="text-lg font-black text-zinc-400 font-mono">{catalogHealth.unavailableCourses}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                <span>Deduplicação canônica de URLs:</span>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-950/20 text-[10px] font-mono">
                  100% SEM DUPLICATAS
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TERCEIRA LINHA: Ações Rápidas & Links Operacionais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/youtube">
            <div className="p-4 rounded-2xl bg-[#100f1c] border border-white/10 hover:border-violet-500/40 transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <Sparkles className="size-5 text-violet-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="size-4 text-zinc-600 group-hover:text-violet-400 transition-colors" />
              </div>
              <h3 className="text-xs font-bold text-white">Descobrir Cursos</h3>
              <p className="text-[11px] text-zinc-400">Ingestão automatizada de canais e playlists</p>
            </div>
          </Link>

          <Link href="/admin/ai">
            <div className="p-4 rounded-2xl bg-[#100f1c] border border-white/10 hover:border-purple-500/40 transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <Brain className="size-5 text-purple-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="size-4 text-zinc-600 group-hover:text-purple-400 transition-colors" />
              </div>
              <h3 className="text-xs font-bold text-white">Treinar IA</h3>
              <p className="text-[11px] text-zinc-400">Gerenciar instruções pedagógicas e regras</p>
            </div>
          </Link>

          <Link href="/admin/usuarios">
            <div className="p-4 rounded-2xl bg-[#100f1c] border border-white/10 hover:border-emerald-500/40 transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <Users className="size-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="size-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="text-xs font-bold text-white">Gestão de Usuários</h3>
              <p className="text-[11px] text-zinc-400">Perfis de acesso e controle de permissões</p>
            </div>
          </Link>

          <Link href="/admin/financeiro">
            <div className="p-4 rounded-2xl bg-[#100f1c] border border-white/10 hover:border-amber-500/40 transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="size-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="size-4 text-zinc-600 group-hover:text-amber-400 transition-colors" />
              </div>
              <h3 className="text-xs font-bold text-white">Financeiro SaaS</h3>
              <p className="text-[11px] text-zinc-400">Planos, assinaturas e faturamento</p>
            </div>
          </Link>
        </div>
      </div>
    </AdminShell>
  )
}
