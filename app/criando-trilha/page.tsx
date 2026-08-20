'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  Code2,
  Flame,
  Layers,
  Lock,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Logo } from '@/components/logo'
import { useAppStore } from '@/lib/store'
import { LEVEL_LABELS, type SkillLevel } from '@/lib/types'

const steps = [
  'Analisando seu perfil e histórico de aprendizagem...',
  'Identificando seu nível atual com base no diagnóstico...',
  'Definindo objetivos profissionais e foco de carreira...',
  'Selecionando conteúdos reais verificados no catálogo...',
  'Estruturando módulos pedagógicos e árvore de pré-requisitos...',
  'Criando sua trilha personalizada e liberando a primeira aula...',
]

const checklistItems = [
  'analisando seu perfil',
  'identificando seu nível',
  'definindo objetivos',
  'selecionando conteúdos',
  'estruturando módulos',
  'criando sua trilha',
]

export default function PathGenerationPage() {
  const router = useRouter()
  const {
    profile,
    onboarding,
    placement,
    generateCustomPath,
    activePath,
    allModules,
    allLessons,
  } = useAppStore()

  const [currentStepIdx, setCurrentStepIdx] = useState(0)
  const [isGenerating, setIsGenerating] = useState(true)

  // Simulation of AI Path Generation Steps
  useEffect(() => {
    if (currentStepIdx < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStepIdx((idx) => idx + 1)
      }, 800)
      return () => clearTimeout(timer)
    } else if (currentStepIdx === steps.length - 1 && isGenerating) {
      const timer = setTimeout(() => {
        setIsGenerating(false)
        generateCustomPath()
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          })
        } catch {}
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [currentStepIdx, isGenerating, generateCustomPath])

  const firstActiveItem =
    activePath?.items?.find((it) => it.status === 'disponivel' || it.status === 'em_andamento') ||
    activePath?.items?.[0]
  const activeMod = allModules.find((m) => m.id === firstActiveItem?.moduleId) || allModules[0]
  const firstLesson =
    allLessons.find((l) => l.id === activeMod?.lessonIds?.[0]) ||
    allLessons.find((l) => l.moduleId === activeMod?.id) ||
    allLessons[0]

  function handleStartJourney() {
    toast.success('Bons estudos! Sua jornada foi iniciada.')
    if (firstLesson) {
      router.push(`/aulas/${firstLesson.id}`)
    } else {
      router.push('/trilha')
    }
  }

  const levelName = placement?.level
    ? (LEVEL_LABELS[placement.level as SkillLevel] || String(placement.level))
    : 'Iniciante Absoluto'

  const areaName =
    onboarding?.area === 'frontend'
      ? 'Front-end Moderno'
      : onboarding?.area === 'backend'
      ? 'Back-end & APIs'
      : 'Full Stack JavaScript'

  const totalLessons = allModules.reduce((acc, m) => acc + m.lessonIds.length, 0)
  const totalHours = allModules.reduce((acc, m) => acc + (m.estimatedHours || 10), 0)

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between pb-6 border-b border-border/80">
        <Logo />
        <Badge variant="outline" className="gap-1.5 text-xs text-primary border-primary/30">
          <Bot className="size-3.5" /> DevMentor AI Engine
        </Badge>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-4xl flex-1 flex flex-col justify-center py-8">
        {isGenerating ? (
          /* Animated AI Synthesis Loading Screen */
          <Card className="border-border/80 shadow-2xl shadow-primary/10 text-center p-8 sm:p-12 space-y-8">
            <div className="relative mx-auto size-20">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="relative grid size-20 place-items-center rounded-3xl bg-primary text-primary-foreground shadow-xl shadow-primary/30">
                <Brain className="size-10 animate-pulse" />
              </div>
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              <h2 className="text-xl sm:text-2xl font-black text-foreground">
                A IA está criando seu caminho.
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground min-h-[40px] flex items-center justify-center">
                {steps[currentStepIdx]}
              </p>
            </div>

            {/* Checklist processing animation */}
            <div className="max-w-xs mx-auto text-left space-y-2 text-xs font-medium py-2">
              {checklistItems.map((item, idx) => {
                const isDone = idx <= currentStepIdx
                const isCurrent = idx === currentStepIdx
                return (
                  <div
                    key={item}
                    className={`flex items-center gap-2.5 transition-all duration-300 ${
                      isDone ? 'text-foreground' : 'text-muted-foreground/50'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="size-4 rounded-full border border-muted-foreground/30 shrink-0" />
                    )}
                    <span className={isCurrent ? 'font-bold text-primary' : ''}>
                      {item}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <Progress value={((currentStepIdx + 1) / steps.length) * 100} className="h-2.5" />
              <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase">
                <span>Passo {currentStepIdx + 1} de {steps.length}</span>
                <span>{Math.round(((currentStepIdx + 1) / steps.length) * 100)}%</span>
              </div>
            </div>
          </Card>
        ) : (
          /* Generated Trail Overview */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Success Hero Banner */}
            <div className="rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/15 via-primary/5 to-card p-6 sm:p-8 shadow-2xl shadow-primary/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-primary text-primary-foreground font-bold">
                      Trilha Personalizada Pronta
                    </Badge>
                    <Badge variant="secondary" className="font-bold text-xs">
                      Nível Inicial: {levelName}
                    </Badge>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                    Sua Jornada em {areaName}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                    Olá, <strong>{profile?.name?.split(' ')[0] || 'Desenvolvedor'}</strong>! Criamos um plano de formação adaptativo iniciando pelos fundamentos de Lógica e Algoritmos para você construir uma base sólida e evoluir com segurança.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 text-center shrink-0 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Carga Horária</span>
                  <p className="text-2xl font-black text-primary">{totalHours}h</p>
                  <p className="text-[11px] text-muted-foreground">{totalLessons} aulas • {allModules.length} módulos</p>
                </div>
              </div>
            </div>

            {/* Next Action Highlight: Module 1 / Lesson 1 */}
            <Card className="border-2 border-primary/50 shadow-xl overflow-hidden bg-primary/[0.02]">
              <div className="bg-primary/10 p-4 border-b border-primary/20 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <PlayCircle className="size-4" /> Seu Ponto de Partida Obrigatório
                </span>
                <Badge className="bg-success text-success-foreground text-[10px] font-bold">
                  Liberado para Estudo
                </Badge>
              </div>

              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase text-muted-foreground">
                      {activeMod?.phase || 'Fase 1 — Fundamentos'}: {activeMod?.title || 'Lógica de Programação'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-foreground">
                      {firstLesson?.title || 'Aula 1: Introdução aos Algoritmos e Lógica'}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                      {firstLesson?.description || activeMod?.description || 'Nesta primeira aula você entenderá o funcionamento da lógica computacional, como instruções são executadas linha a linha e construirá seus primeiros algoritmos.'}
                    </p>
                  </div>

                  <Button
                    size="lg"
                    onClick={handleStartJourney}
                    className="gap-2 text-base font-bold py-6 px-8 rounded-2xl shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 hover:scale-105 transition-all"
                  >
                    COMEÇAR MINHA JORNADA
                    <ArrowRight className="size-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Phases Roadmap Summary */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Estrutura das 6 Fases da sua Formação
              </h2>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { phase: 'Fase 1', title: 'Fundamentos da Programação', desc: 'Lógica, Algoritmos e Git/GitHub', status: 'Em Andamento', isUnlocked: true },
                  { phase: 'Fase 2', title: 'Desenvolvimento Web', desc: 'HTML5 Semântico, CSS3 e JavaScript Moderno', status: 'Bloqueado 🔒', isUnlocked: false },
                  { phase: 'Fase 3', title: 'Front-end Moderno', desc: 'React, TypeScript e Tailwind CSS', status: 'Bloqueado 🔒', isUnlocked: false },
                  { phase: 'Fase 4', title: 'Back-end & Bancos de Dados', desc: 'Node.js, Express e PostgreSQL / SQL', status: 'Bloqueado 🔒', isUnlocked: false },
                  { phase: 'Fase 5', title: 'Full Stack & Deploy', desc: 'Aplicações Completas, Autenticação e Cloud', status: 'Bloqueado 🔒', isUnlocked: false },
                  { phase: 'Fase 6', title: 'Carreira & Mercado', desc: 'Portfólio, Entrevista IA e Certificação', status: 'Bloqueado 🔒', isUnlocked: false },
                ].map((item, i) => (
                  <div
                    key={item.phase}
                    className={`rounded-2xl border p-4 transition-all ${
                      item.isUnlocked
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border/60 bg-muted/20 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-primary uppercase">{item.phase}</span>
                      <Badge variant={item.isUnlocked ? 'default' : 'outline'} className="text-[10px]">
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-bold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border/80">
              <Link href="/dashboard" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
                Ir direto para o Dashboard
              </Link>

              <Button onClick={handleStartJourney} className="gap-2 font-bold shadow-md shadow-primary/20">
                Iniciar Aula 1 <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-4xl pt-6 text-center text-xs text-muted-foreground border-t border-border/60">
        DevPath AI — Plataforma de aprendizagem adaptativa orientada por Inteligência Artificial.
      </footer>
    </div>
  )
}
