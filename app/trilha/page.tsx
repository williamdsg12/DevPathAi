'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Compass,
  Flame,
  FolderGit2,
  HelpCircle,
  Layers,
  Lightbulb,
  Lock,
  Play,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Unlock,
  Zap,
} from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WindingJourneyMap } from '@/components/journey/winding-journey-map'
import { useAppStore } from '@/lib/store'

export default function LearningPathPage() {
  const {
    activePath,
    allLessons,
    nextPendingLessonId,
  } = useAppStore()

  const continueLessonId = nextPendingLessonId || allLessons[0]?.id || ''

  return (
    <AppShell
      title="Minha Jornada de Aprendizado"
      subtitle="Trilha visual gamificada em fases sequenciais com desbloqueio dinâmico por evolução real"
    >
      <div className="space-y-8 pb-16 max-w-4xl mx-auto">
        {/* Banner Hero da Jornada */}
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-950/50 via-[#12111d] to-[#0a0910] p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge className="bg-violet-950/80 border border-violet-500/40 text-violet-300 font-bold px-3 py-0.5 text-xs gap-1.5 shadow-sm">
                  <Sparkles className="size-3 text-violet-400" />
                  Mapa da Jornada Gamificada
                </Badge>
                <span className="text-xs text-zinc-400 font-medium">
                  {activePath?.customizedFor || 'Personalizado para o seu objetivo'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                {activePath?.title || 'Formação Desenvolvedor Full Stack JavaScript'}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                Conforme você avança nas aulas e atividades práticas, o caminho se ilumina e novas fases são desbloqueadas.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {continueLessonId && (
                <Link href={`/aulas/${continueLessonId}`}>
                  <Button className="gap-2 font-black text-xs sm:text-sm px-7 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-xl shadow-purple-600/30 border border-violet-400/30 cursor-pointer">
                    <Play className="size-4 fill-white" /> Continuar Fase Atual
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Trilha Central Gamificada (Full Width & Centered) */}
        <div className="rounded-3xl border border-white/5 bg-[#0e0d16] p-6 sm:p-10 shadow-2xl">
          <WindingJourneyMap />
        </div>
      </div>
    </AppShell>
  )
}
