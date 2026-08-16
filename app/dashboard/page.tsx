'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  Flame,
  GraduationCap,
  Layers,
  Lightbulb,
  ListTodo,
  Map,
  PlayCircle,
  Repeat,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { getIcon } from '@/lib/module-icons'

export default function DashboardPage() {
  const {
    profile,
    activePath,
    allModules,
    allLessons,
    moduleProgress,
    moduleStatus,
    getModuleMastery,
    dailyStudyPlan,
    overallProgress,
    xp,
    level,
    streak,
    studiedMinutes,
    todayStudiedMinutes,
    weeklyStudyRecords,
    currentModuleId,
    nextPendingLessonId,
    difficulties,
    spacedReviews,
    completedLessons,
  } = useAppStore()

  const currentModule = allModules.find((m) => m.id === currentModuleId) || allModules[0]
  const currentModProgress = currentModule ? moduleProgress[currentModule.id] : null
  const currentMastery = currentModule
    ? getModuleMastery(currentModule.id)
    : { totalMastery: 0, lessonMastery: 0, exerciseMastery: 0, projectMastery: 0, assessmentMastery: 0, isUnlocked: false }
  const nextLesson = allLessons.find((l) => l.id === nextPendingLessonId) || allLessons[0]
  const ModuleIcon = currentModule ? getIcon(currentModule.icon) : BookOpen

  const isFirstDay = completedLessons.length === 0
  const pendingReviews = spacedReviews.filter((r) => !r.completed)
  const dailyTargetMinutes = dailyStudyPlan.totalMinutes || 45
  const dailyGoalPercent = Math.min(100, Math.round((todayStudiedMinutes / dailyTargetMinutes) * 100))

  return (
    <AppShell title="Dashboard do Aluno" subtitle="Acompanhe seu ritmo de estudos, plano diário e evolução adaptativa">
      <div className="space-y-8">
        {/* Welcome & Primary CTA Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-card p-6 sm:p-8 shadow-xl shadow-primary/5">
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-1.5 rounded-full py-1 text-xs">
                  <Sparkles className="size-3.5 text-primary" />
                  Trilha Ativa: {activePath.title}
                </Badge>
                <Badge className="bg-warning/15 text-warning gap-1 font-bold">
                  <Flame className="size-3.5 fill-warning" /> {streak} {streak === 1 ? 'dia' : 'dias'} de consistência
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                Olá, {profile?.name?.split(' ')[0] || 'Desenvolvedor'}! 👋
              </h1>
              <p className="max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
                {isFirstDay
                  ? nextLesson
                    ? `Seu primeiro passo na programação começa hoje com a aula "${nextLesson.title}". Bons estudos!`
                    : 'Bem-vindo! Acesse a área de cursos ou adicione conteúdos na área administrativa para começar sua jornada.'
                  : currentModule
                  ? `Você está no módulo "${currentModule.title}" com Mastery Score de ${currentMastery.totalMastery}%.`
                  : 'Acesse o catálogo de cursos para continuar seus estudos.'}
              </p>
            </div>

            {/* Main Action Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href={nextPendingLessonId ? `/aulas/${nextPendingLessonId}` : allLessons[0] ? `/aulas/${allLessons[0].id}` : '/cursos'}
                className="inline-flex"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto gap-2 text-base font-bold shadow-xl shadow-primary/30 py-6 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-105"
                >
                  <PlayCircle className="size-5" />
                  {isFirstDay ? (nextLesson ? 'INICIAR PRIMEIRA AULA' : 'EXPLORAR CURSOS') : 'CONTINUAR ESTUDANDO'}
                  <ArrowRight className="size-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 4 Key KPI Metrics Cards */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Card className="border-border/70 hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progresso Geral</span>
              <GraduationCap className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">{overallProgress}%</div>
              <Progress value={overallProgress} className="h-1.5 mt-2" />
              <p className="text-[11px] text-muted-foreground mt-2">{completedLessons.length} aulas concluídas</p>
            </CardContent>
          </Card>

          <Card className="border-border/70 hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total XP & Nível</span>
              <Trophy className="size-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">{xp.toLocaleString('pt-BR')} <span className="text-sm font-semibold text-muted-foreground">XP</span></div>
              <p className="text-xs font-bold text-primary mt-1">Nível {level} — {isFirstDay ? 'Iniciante' : 'Desenvolvedor'}</p>
              <p className="text-[11px] text-muted-foreground mt-1">+{(level * 1000 - xp)} XP para o Nível {level + 1}</p>
            </CardContent>
          </Card>

          <Card className="border-border/70 hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tempo Estudado</span>
              <Clock className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">{Math.round(studiedMinutes / 60)}h <span className="text-sm font-semibold text-muted-foreground">{studiedMinutes % 60}m</span></div>
              <p className="text-xs text-muted-foreground mt-1">Meta diária: {todayStudiedMinutes}m / {dailyTargetMinutes}m</p>
              <Progress value={dailyGoalPercent} className="h-1.5 mt-2" />
            </CardContent>
          </Card>

          <Card className="border-border/70 hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Streak & Consistência</span>
              <Flame className="size-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-extrabold text-warning">{streak} <span className="text-sm font-semibold text-muted-foreground">dias</span></div>
              <p className="text-xs text-muted-foreground mt-1">Recorde pessoal: {streak} dias</p>
              <div className="flex items-center gap-1 mt-2">
                {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
                  <span
                    key={i}
                    className={`grid size-5 place-items-center rounded-full text-[10px] font-bold ${
                      streak > 0 && i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Plano de Estudo Diário Individual */}
        <section className="rounded-3xl border border-primary/20 bg-card p-6 shadow-lg shadow-primary/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <ListTodo className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Plano de Estudo Diário Adaptativo</h2>
                <p className="text-xs text-muted-foreground">Calculado individualmente para otimizar sua retenção de conteúdo hoje</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs font-bold border-primary/30 text-primary">
              Meta: {dailyTargetMinutes} min
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {dailyStudyPlan.tasks.map((task) => (
              <Link key={task.id} href={task.actionUrl} className="group">
                <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-2 hover:border-primary/50 transition-colors h-full flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                        {task.type}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                        <Clock className="size-3" /> {task.durationMinutes} min
                      </span>
                    </div>
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {task.title}
                    </p>
                  </div>
                  <span className="text-[11px] text-primary font-bold flex items-center gap-1 pt-2">
                    Iniciar tarefa <ArrowRight className="size-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Current Module Details & Mastery Breakdown */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Current Active Module Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/80 shadow-lg shadow-primary/5 overflow-hidden">
              <div className="border-b border-border bg-muted/30 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <ModuleIcon className="size-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                      Fase {currentModule?.phaseOrder}: {currentModule?.phase}
                    </span>
                    <h2 className="text-lg font-bold text-foreground">{currentModule?.title}</h2>
                  </div>
                </div>

                <Badge variant="secondary" className="font-semibold capitalize">
                  {moduleStatus(currentModule?.id || '')}
                </Badge>
              </div>

              <CardContent className="p-6 space-y-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentModule?.description} {currentModule?.objective}
                </p>

                {/* Weighted Mastery Score Breakdown */}
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Brain className="size-4 text-primary" /> Mastery Score do Módulo:
                    </span>
                    <span className="text-base font-extrabold text-primary">{currentMastery.totalMastery}%</span>
                  </div>
                  <Progress value={currentMastery.totalMastery} className="h-2" />
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-muted-foreground pt-1">
                    <div className="rounded-lg bg-card p-1.5 border border-border/60">
                      <span className="block font-bold text-foreground">{currentMastery.lessonsScore}/20</span>
                      Aulas (20%)
                    </div>
                    <div className="rounded-lg bg-card p-1.5 border border-border/60">
                      <span className="block font-bold text-foreground">{currentMastery.exercisesScore}/30</span>
                      Exercícios (30%)
                    </div>
                    <div className="rounded-lg bg-card p-1.5 border border-border/60">
                      <span className="block font-bold text-foreground">{currentMastery.projectScore}/25</span>
                      Projeto (25%)
                    </div>
                    <div className="rounded-lg bg-card p-1.5 border border-border/60">
                      <span className="block font-bold text-foreground">{currentMastery.assessmentScore}/25</span>
                      Avaliação (25%)
                    </div>
                  </div>
                </div>

                {/* Progress Details Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-border bg-card p-3">
                    <span className="text-[11px] text-muted-foreground">Aulas</span>
                    <p className="text-lg font-bold text-foreground">
                      {currentModProgress?.lessonsCompleted ?? 0} / {currentModule?.lessonIds.length}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-3">
                    <span className="text-[11px] text-muted-foreground">Exercícios</span>
                    <p className="text-lg font-bold text-foreground">
                      {currentModProgress?.exercisesCompleted ?? 0} / {currentModule?.exerciseCount}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-3">
                    <span className="text-[11px] text-muted-foreground">Projeto Prático</span>
                    <p className="text-lg font-bold text-foreground">
                      {currentModProgress?.projectSubmitted ? 'Entregue ✓' : currentModule?.hasProject ? 'Pendente' : 'N/A'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-3">
                    <span className="text-[11px] text-muted-foreground">Nota Avaliação</span>
                    <p className="text-lg font-bold text-foreground">
                      {currentModProgress?.assessmentScore !== null && currentModProgress?.assessmentScore !== undefined
                        ? `${currentModProgress.assessmentScore}%`
                        : 'Pendente'}
                    </p>
                  </div>
                </div>

                {/* Navigation and Module Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <Link href={`/trilha`} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                    Ver árvore completa de módulos da trilha <ArrowRight className="size-3.5" />
                  </Link>

                  <div className="flex items-center gap-2">
                    <Link href={`/exercicios`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <CheckCircle2 className="size-4" /> Exercícios
                      </Button>
                    </Link>

                    {currentModule?.hasAssessment ? (
                      <Link href={`/avaliacoes/${currentModule.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Target className="size-4" /> Avaliação Oficial
                        </Button>
                      </Link>
                    ) : null}

                    {nextPendingLessonId ? (
                      <Link href={`/aulas/${nextPendingLessonId}`}>
                        <Button size="sm" className="gap-1.5">
                          {isFirstDay ? 'Iniciar Aula 1' : 'Assistir Aula'} <ArrowRight className="size-4" />
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Study Activity Graphic Visualization */}
            <Card className="border-border/70">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold">Consistência de Estudos da Semana</CardTitle>
                    <CardDescription>Minutos reais dedicados dia a dia</CardDescription>
                  </div>
                  <span className="text-xs font-bold text-primary">
                    Total: {weeklyStudyRecords.reduce((a, b) => a + b.minutes, 0)} minutos
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-2 h-36 pt-4">
                  {weeklyStudyRecords.map((s) => {
                    const heightPercent = Math.min(100, Math.round((s.minutes / 120) * 100))
                    return (
                      <div key={s.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                          {s.minutes}m
                        </div>
                        <div
                          style={{ height: `${Math.max(4, heightPercent)}%` }}
                          className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 ${
                            s.minutes > 0 ? 'bg-primary' : 'bg-muted/60'
                          }`}
                        />
                        <span className="text-xs font-semibold text-muted-foreground">{s.day}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: AI Mentorship, Spaced Repetition & Knowledge Gaps */}
          <div className="space-y-6">
            {/* DevMentor AI Quick Card */}
            <Card className="border-primary/30 bg-primary/[0.03]">
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                    <Bot className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">DevMentor AI</CardTitle>
                    <CardDescription className="text-xs">Seu mentor contextualizado 24/7</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Estudando <strong>{currentModule?.title}</strong>? Peça ajuda ao seu mentor para tirar dúvidas de código ou conceitos!
                </p>
                <div className="space-y-1.5">
                  {[
                    'Como funciona o pensamento computacional?',
                    'O que é um algoritmo na prática?',
                    'Como estruturar meu plano de estudos?',
                  ].map((q) => (
                    <Link
                      key={q}
                      href={`/mentor?q=${encodeURIComponent(q)}`}
                      className="block rounded-lg border border-border bg-card p-2 text-xs font-medium text-muted-foreground hover:border-primary hover:text-foreground transition-colors truncate"
                    >
                      💬 {q}
                    </Link>
                  ))}
                </div>

                <Link href="/mentor" className="block pt-2">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    Abrir Chat com Mentor <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Knowledge Gaps & Recommendations */}
            {activePath.knowledgeGaps && activePath.knowledgeGaps.length > 0 && (
              <Card className="border-amber-500/30 bg-amber-500/[0.03]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <Lightbulb className="size-4" /> Lacunas Diagnosticadas
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Pontos identificados no nivelamento para foco prioritário
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {activePath.knowledgeGaps.map((gap, i) => (
                    <div key={i} className="p-2 rounded-lg border border-amber-500/20 bg-card text-xs space-y-0.5">
                      <div className="flex items-center justify-between font-bold text-foreground">
                        <span>{gap.topic}</span>
                        <Badge variant="outline" className="text-[9px] uppercase border-amber-500/40 text-amber-600">
                          {gap.severity}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{gap.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Spaced Repetition Due Today */}
            <Card className="border-border/70">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Repeat className="size-4 text-primary" /> Revisões de Hoje
                  </CardTitle>
                  <Badge variant={pendingReviews.length > 0 ? 'default' : 'secondary'} className="text-xs">
                    {pendingReviews.length} pendentes
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingReviews.length === 0 ? (
                  <p className="text-xs text-muted-foreground/80 italic py-2">
                    Nenhuma revisão pendente para hoje. Conforme você assistir às aulas e praticar exercícios, a IA criará flashcards para fixação a longo prazo.
                  </p>
                ) : (
                  pendingReviews.slice(0, 2).map((rev) => (
                    <div key={rev.id} className="rounded-xl border border-border bg-card p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{rev.topic}</span>
                        <span className="text-[10px] text-muted-foreground">{rev.moduleTitle}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{rev.question}</p>
                    </div>
                  ))
                )}

                <Link href="/revisoes" className="block pt-1">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Praticar Flashcards de Revisão
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Weak Topics Radar */}
            <Card className="border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Brain className="size-4 text-warning" /> Radar de Dificuldades
                </CardTitle>
                <CardDescription className="text-xs">
                  Tópicos onde a IA identificou necessidade de reforço
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {difficulties.length === 0 ? (
                  <p className="text-xs text-muted-foreground/80 italic py-2">
                    Nenhuma dificuldade registrada ainda. A IA monitorará seus erros em exercícios e avaliações para criar planos de reforço específicos.
                  </p>
                ) : (
                  difficulties.map((d) => (
                    <div key={d.topic} className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0">
                      <span className="font-medium text-foreground">{d.topic}</span>
                      <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold text-warning">
                        {d.count}x revisões recomendadas
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
