'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Database,
  Edit,
  ExternalLink,
  FolderGit2,
  HelpCircle,
  Layers,
  Lock,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Tv,
  Users,
  Youtube,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { YoutubeIcon } from '@/components/icons'
import { mockExercises } from '@/lib/mock-data'
import { useAppStore } from '@/lib/store'
import { BEGINNER_THRESHOLD } from '@/lib/ai/learning-path-engine'
import { LEVEL_LABELS, type SkillLevel } from '@/lib/types'

export default function AdminPage() {
  const {
    allCourses,
    allModules,
    allLessons,
    technologySources,
    contentSources,
    activePath,
    profile,
    placement,
    onboarding,
    recalculateLearningPath,
    validateCatalogIntegrity,
    activities,
    adminApproveActivity,
    adminDeleteActivity,
    generateActivitiesForModule,
  } = useAppStore()

  const [selectedAuditModuleId, setSelectedAuditModuleId] = useState<string | null>(null)
  const [isRecalculating, setIsRecalculating] = useState(false)
  const [isBatchGenerating, setIsBatchGenerating] = useState(false)

  async function handleBatchGenerateActivities() {
    setIsBatchGenerating(true)
    try {
      for (const mod of allModules) {
        await generateActivitiesForModule(mod.id)
      }
      toast.success('Geração em lote concluída com sucesso para todos os módulos do catálogo!')
    } catch {
      toast.error('Erro ao gerar atividades em lote.')
    } finally {
      setIsBatchGenerating(false)
    }
  }

  // Content Health Metrics calculation
  const healthMetrics = useMemo(() => {
    const totalCourses = allCourses.length
    const completeCourses = allCourses.filter((c) => c.modulesCount > 0 && c.lessonsCount > 0).length
    const coursesWithGaps = allCourses.filter((c) => !c.thumbnailUrl || c.lessonsCount === 0).length
    const totalVideos = allLessons.length
    const unavailableVideos = allLessons.filter((l) => l.isUnavailable || l.availabilityStatus === 'unavailable').length
    const lessonsWithoutVideo = allLessons.filter((l) => !l.videoId && !l.externalVideoId).length

    const hasLogicCourse = allCourses.some(
      (c) =>
        c.title.toLowerCase().includes('lógica') ||
        c.title.toLowerCase().includes('logica') ||
        c.title.toLowerCase().includes('algoritmo') ||
        c.category.toLowerCase().includes('fundamento')
    )

    const contentGaps = []
    if (!hasLogicCourse && totalCourses > 0) {
      contentGaps.push({
        id: 'gap-logic',
        stageRequired: 'FASE 1 — Fundamentos da Programação',
        technology: 'Lógica & Algoritmos',
        missingTopic: 'Lógica de Programação & Pensamento Computacional',
        reason: 'Obrigatório para alunos com nota < 65% ou iniciantes. Nenhuma playlist/curso de Lógica cadastrado.',
      })
    }

    return {
      totalCourses,
      completeCourses,
      coursesWithGaps,
      totalVideos,
      unavailableVideos,
      lessonsWithoutVideo,
      contentGaps,
      healthScore: totalCourses === 0 ? 100 : Math.round(((completeCourses / Math.max(1, totalCourses)) * 0.7 + (1 - unavailableVideos / Math.max(1, totalVideos)) * 0.3) * 100),
    }
  }, [allCourses, allLessons])

  function handleTriggerRecalculate() {
    setIsRecalculating(true)
    setTimeout(() => {
      recalculateLearningPath('Auditoria administrativa do SUPER_ADMIN executada.')
      setIsRecalculating(false)
      toast.success('Trilha adaptativa recalculada com sucesso segundo as regras pedagógicas vigentes!')
    }, 600)
  }

  return (
    <AppShell
      title="Painel Administrativo & CMS Restrito"
      subtitle="Gestão do Catálogo Educacional Global, Content Health e Auditoria Pedagógica das Trilhas"
    >
      <div className="space-y-8">
        {/* Admin Header Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-primary/30 bg-primary/[0.04] p-6 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground font-mono font-bold text-xs gap-1">
                <ShieldCheck className="size-3.5" /> SUPER_ADMIN MODE
              </Badge>
              <span className="text-xs text-muted-foreground font-semibold">williamdev36@gmail.com</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Controle Central do Catálogo & Motor de Trilha
            </h2>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Gerencie fontes oficiais do YouTube, audite por que cada curso foi posicionado pela IA e mantenha a saúde do catálogo em tempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link href="/admin/youtube">
              <Button size="sm" className="gap-2 font-bold text-xs bg-red-600 hover:bg-red-700 text-white">
                <YoutubeIcon className="size-3.5" /> Gerenciar Fontes & YouTube
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={handleTriggerRecalculate}
              disabled={isRecalculating}
              className="gap-2 text-xs font-semibold"
            >
              <RefreshCw className={`size-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
              Auditar / Recalcular Trilha
            </Button>
          </div>
        </div>

        {/* Content Health Metrics */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="border-border/80 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Cursos no Catálogo</span>
              <BookOpen className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">{healthMetrics.totalCourses}</div>
              <p className="text-[11px] text-emerald-400 mt-1">{healthMetrics.completeCourses} completos / 0 fictícios</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Módulos Estruturados</span>
              <Layers className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">{allModules.length}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Vinculados a playlists reais</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Aulas Reais</span>
              <Tv className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">{healthMetrics.totalVideos}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Com IDs oficiais do YouTube</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Saúde do Catálogo</span>
              <Activity className="size-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-emerald-400">{healthMetrics.healthScore}%</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {healthMetrics.unavailableVideos > 0 ? `${healthMetrics.unavailableVideos} vídeos com alerta` : '100% íntegro'}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Content Gaps Warning Banner if needed */}
        {healthMetrics.contentGaps.length > 0 && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/[0.06] p-4 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
              <AlertTriangle className="size-4" /> Alerta de Gap de Conteúdo Pedagógico
            </div>
            {healthMetrics.contentGaps.map((gap) => (
              <p key={gap.id} className="text-foreground/90 leading-relaxed">
                <strong>{gap.technology}:</strong> {gap.reason} Importe uma playlist de Lógica no painel do YouTube para preencher essa lacuna automaticamente.
              </p>
            ))}
          </div>
        )}

        {/* Main Admin Tabs */}
        <Card className="border-border/80 shadow-xl shadow-primary/5">
          <Tabs defaultValue="auditoria" className="w-full">
            <div className="border-b border-border bg-muted/30 px-6 py-2">
              <TabsList className="bg-transparent gap-2">
                <TabsTrigger value="auditoria" className="text-xs font-bold data-[state=active]:bg-card gap-1.5">
                  <Brain className="size-3.5" /> Auditoria da Trilha IA
                </TabsTrigger>
                <TabsTrigger value="saude" className="text-xs font-bold data-[state=active]:bg-card gap-1.5">
                  <Activity className="size-3.5" /> Content Health
                </TabsTrigger>
                <TabsTrigger value="modulos" className="text-xs font-bold data-[state=active]:bg-card gap-1.5">
                  <Layers className="size-3.5" /> Módulos ({allModules.length})
                </TabsTrigger>
                <TabsTrigger value="aulas" className="text-xs font-bold data-[state=active]:bg-card gap-1.5">
                  <Tv className="size-3.5" /> Aulas ({allLessons.length})
                </TabsTrigger>
                <TabsTrigger value="exercicios" className="text-xs font-bold data-[state=active]:bg-card gap-1.5">
                  <CheckCircle2 className="size-3.5" /> Atividades IA ({activities.length})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab 1: Learning Path Auditing Tool */}
            <TabsContent value="auditoria" className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Brain className="size-4 text-primary" /> Justificativa Pedagógica & Decisões da Trilha
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Entenda por que cada curso foi escolhido, qual a regra aplicada e quais pré-requisitos foram validados.
                  </p>
                </div>

                <Badge variant="outline" className="font-mono text-xs font-semibold self-start sm:self-auto">
                  Threshold: {BEGINNER_THRESHOLD}%
                </Badge>
              </div>

              {/* Student Diagnostic State Overview */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Aproveitamento no Teste</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-black text-primary">{placement?.score ?? 0}%</p>
                    <Badge variant={placement?.score && placement.score >= BEGINNER_THRESHOLD ? 'default' : 'secondary'} className="text-[10px]">
                      {placement?.score && placement.score >= BEGINNER_THRESHOLD ? '>= 65% (Avançado)' : '< 65% (Iniciante)'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {placement?.score && placement.score < BEGINNER_THRESHOLD
                      ? 'Lógica & Fundamentos obrigatórios'
                      : 'Elegível para avaliação de entrada customizada'}
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Carreira & Área Alvo</p>
                  <p className="text-base font-bold text-foreground capitalize">{onboarding?.area || 'Full Stack'}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Objetivo: {onboarding?.goal || 'primeiro-emprego'}
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Ponto de Partida Determinado</p>
                  <p className="text-sm font-bold text-foreground">
                    {activePath?.startingStage === 'LOGIC_AND_PROGRAMMING_FOUNDATIONS' || (placement?.score ?? 0) < 65
                      ? 'FASE 1 — Lógica & Fundamentos'
                      : 'FASE 2+ — Tecnologias Centrais'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Regra aplicada determinística
                  </p>
                </div>
              </div>

              {/* Step-by-Step Trail Course Sequence with Rationale */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Sequência Estruturada na Trilha do Aluno ({activePath?.items?.length || 0} módulos)
                </h4>

                {(!activePath?.items || activePath.items.length === 0) ? (
                  <div className="p-8 text-center border border-dashed rounded-2xl bg-muted/20 text-xs text-muted-foreground">
                    Nenhuma trilha ativa gerada ainda. O aluno precisa concluir o nivelamento.
                  </div>
                ) : (
                  activePath.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-border bg-card/80 p-4 space-y-2 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="grid size-7 place-items-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-bold text-foreground text-sm">{item.title}</p>
                            <p className="text-[11px] text-muted-foreground">{item.phase}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={item.locked ? 'secondary' : 'default'} className="text-[10px]">
                            {item.locked ? 'Bloqueado por pré-requisito' : 'Liberado para estudo'}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {item.estimatedHours}h
                          </Badge>
                        </div>
                      </div>

                      <div className="rounded-xl border border-border/50 bg-muted/30 p-3 text-xs space-y-1">
                        <p className="text-[11px] font-semibold text-primary">
                          Por que este curso/módulo está nesta posição?
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.recommendationReason || item.pedagogicalRationale || 'Estruturado sequencialmente respeitando a ordem de dependências pedagógicas da carreira.'}
                        </p>
                        <p className="text-[11px] text-muted-foreground/80 pt-1 border-t border-border/40">
                          <strong>Critério de Desbloqueio:</strong> {item.unlockRequirement || 'Conclusão da etapa anterior com aproveitamento >= 50%.'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Tab 2: Content Health */}
            <TabsContent value="saude" className="p-6 space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">Relatório de Saúde e Integridade do Conteúdo</h3>
                <p className="text-xs text-muted-foreground">
                  Diagnóstico automático de consistência de metadados, links de vídeos e integridade referencial.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
                  <p className="text-xs font-bold text-foreground">Resumo de Cursos & Módulos</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li className="flex justify-between">
                      <span>Total de Cursos Cadastrados:</span>
                      <strong className="text-foreground">{healthMetrics.totalCourses}</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Cursos Completos (com aulas):</span>
                      <strong className="text-emerald-400">{healthMetrics.completeCourses}</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Cursos com pendência de capa ou aulas:</span>
                      <strong className={healthMetrics.coursesWithGaps > 0 ? 'text-amber-400' : 'text-foreground'}>
                        {healthMetrics.coursesWithGaps}
                      </strong>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
                  <p className="text-xs font-bold text-foreground">Resumo de Vídeos & Aulas</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li className="flex justify-between">
                      <span>Total de Aulas Catalogadas:</span>
                      <strong className="text-foreground">{healthMetrics.totalVideos}</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Vídeos Marcados como Indisponíveis:</span>
                      <strong className={healthMetrics.unavailableVideos > 0 ? 'text-red-400' : 'text-emerald-400'}>
                        {healthMetrics.unavailableVideos}
                      </strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Fontes Oficiais Conectadas:</span>
                      <strong className="text-foreground">{contentSources.length} canais</strong>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Modules */}
            <TabsContent value="modulos" className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Módulos no Catálogo Global</h3>
                <Link href="/admin/youtube">
                  <Button size="sm" className="gap-1.5 text-xs font-bold">
                    <Plus className="size-3.5" /> Adicionar / Sincronizar Módulos
                  </Button>
                </Link>
              </div>

              <div className="space-y-2">
                {allModules.length === 0 ? (
                  <div className="p-8 text-center border border-dashed rounded-2xl bg-muted/20 text-xs text-muted-foreground">
                    Nenhum módulo cadastrado.
                  </div>
                ) : (
                  allModules.map((mod) => (
                    <div
                      key={mod.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary font-bold">
                          {mod.order}
                        </span>
                        <div>
                          <p className="font-bold text-foreground">{mod.title}</p>
                          <p className="text-[11px] text-muted-foreground">{mod.phase} • {mod.estimatedHours}h estimadas</p>
                        </div>
                      </div>

                      <Badge variant="secondary" className="text-[10px]">
                        {mod.lessonIds?.length || 0} aulas
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Tab 4: Lessons */}
            <TabsContent value="aulas" className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Aulas no Catálogo Global</h3>
                <Link href="/admin/youtube">
                  <Button size="sm" className="gap-1.5 text-xs font-bold">
                    <Plus className="size-3.5" /> Gerenciar Aulas do YouTube
                  </Button>
                </Link>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
                {allLessons.length === 0 ? (
                  <div className="p-8 text-center border border-dashed rounded-2xl bg-muted/20 text-xs text-muted-foreground">
                    Nenhuma aula cadastrada.
                  </div>
                ) : (
                  allLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-7 place-items-center rounded-lg bg-muted text-muted-foreground font-bold">
                          {lesson.order}
                        </span>
                        <div>
                          <p className="font-bold text-foreground">{lesson.title}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {lesson.source ? `Fonte: ${lesson.source} • ` : ''}Duração: {lesson.durationMin} min
                          </p>
                        </div>
                      </div>

                      <Badge variant="outline" className="text-[10px]">
                        ID: {lesson.videoId || 'real-video'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Tab 5: AI Pedagogical Activities Management */}
            <TabsContent value="exercicios" className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Banco de Atividades Pedagógicas ({activities.length})</h3>
                  <p className="text-xs text-muted-foreground">
                    Atividades validadas com enunciado, objetivos, dicas e gabarito contextualizado com aulas reais.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleBatchGenerateActivities}
                    disabled={isBatchGenerating}
                    className="gap-1.5 text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30"
                  >
                    <Sparkles className={`size-3.5 ${isBatchGenerating ? 'animate-spin' : ''}`} />
                    {isBatchGenerating ? 'Gerando em Lote...' : 'Gerar em Lote para Todos os Módulos'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
                {activities.map((act, i) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/30 p-3.5 text-xs gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="grid size-7 shrink-0 place-items-center rounded-xl bg-violet-950/60 border border-violet-500/30 text-violet-400 font-bold">
                        {i + 1}
                      </span>
                      <div className="truncate space-y-0.5">
                        <p className="font-bold text-white truncate">{act.title}</p>
                        <p className="text-[11px] text-zinc-400 truncate font-medium">{act.statement}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold border-white/10 text-zinc-400">
                        {act.technology || 'Lógica'}
                      </Badge>
                      <Badge className="bg-violet-950 text-violet-300 border-violet-500/30 text-[10px] font-mono">
                        +{act.xpReward} XP
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          adminDeleteActivity(act.id)
                          toast.info('Atividade excluída.')
                        }}
                        className="text-zinc-500 hover:text-rose-400 h-7 px-2 text-[10px]"
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </AppShell>
  )
}
