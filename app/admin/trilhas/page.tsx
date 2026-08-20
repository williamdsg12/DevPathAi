'use client'

import { useState } from 'react'
import {
  GitFork,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  RefreshCw,
  Award,
  AlertTriangle,
  ArrowRight,
  BookOpen,
} from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'

export default function AdminTrilhasPage() {
  const { activePath, allModules, recalculateLearningPath } = useAppStore()
  const [isRecalculating, setIsRecalculating] = useState(false)

  function handleRecalculate() {
    setIsRecalculating(true)
    setTimeout(() => {
      recalculateLearningPath('Auditoria administrativa de trilhas executada.')
      setIsRecalculating(false)
      toast.success('Trilha adaptativa recalculada com sucesso segundo as regras pedagógicas!')
    }, 600)
  }

  return (
    <AdminShell
      title="Gestão de Trilhas de Aprendizagem"
      subtitle="Supervisão da sequência pedagógica, estágios da jornada do aluno e desbloqueio de pré-requisitos"
    >
      <div className="space-y-6">
        {/* Active Path Summary Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-950/70 via-[#131124] to-[#0a0914] p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <Badge className="bg-violet-600/30 text-violet-300 border border-violet-500/40 text-xs font-mono font-bold">
                TRILHA ATIVA
              </Badge>
              <h2 className="text-xl font-bold text-white">{activePath?.title || 'Trilha Full Stack Developer'}</h2>
              <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
                {activePath?.description || 'Jornada estruturada desde fundamentos até projetos reais de mercado.'}
              </p>
            </div>

            <Button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl px-5 h-10 gap-2 shrink-0"
            >
              <RefreshCw className={`size-4 ${isRecalculating ? 'animate-spin' : ''}`} />
              {isRecalculating ? 'Recalculando...' : 'Recalcular Trilha (Motor IA)'}
            </Button>
          </div>
        </div>

        {/* Modules in the Path */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="size-4 text-violet-400" /> Módulos Sequenciais da Trilha ({allModules.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allModules.map((mod, idx) => (
              <Card key={mod.id} className="bg-[#100f1c] border-white/10 overflow-hidden">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-violet-400 uppercase">
                      Módulo {idx + 1} • {mod.phase}
                    </span>
                    <Badge variant="outline" className="text-[10px] border-white/10 text-zinc-300">
                      {mod.estimatedHours}h est.
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-white pt-1">{mod.title}</CardTitle>
                  <CardDescription className="text-xs text-zinc-400 line-clamp-2">
                    {mod.objective}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-3">
                  <div className="flex items-center gap-4 text-xs text-zinc-400 border-t border-white/5 pt-3">
                    <span className="flex items-center gap-1.5 font-mono">
                      <BookOpen className="size-3.5 text-zinc-400" /> {mod.lessonIds?.length || 0} aulas
                    </span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <Award className="size-3.5 text-zinc-400" /> {mod.hasAssessment ? 'Prova de Módulo' : 'Sem prova'}
                    </span>
                  </div>

                  {mod.skills && mod.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {mod.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-300 border border-white/5"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
