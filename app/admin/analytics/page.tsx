'use client'

import { useMemo } from 'react'
import {
  BarChart3,
  BookOpen,
  Users,
  Video,
  CheckCircle2,
  Brain,
  Layers,
} from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'

export default function AdminAnalyticsPage() {
  const { allCourses, allModules, allLessons, activities, aiConfig, aiInstructions } = useAppStore()

  const metrics = useMemo(() => {
    const totalCourses = allCourses.length
    const totalLessons = allLessons.length
    const totalActivities = activities.length
    const totalHours = allCourses.reduce((acc, c) => acc + (c.totalHours || 0), 0)

    // Agrupamento por Nível
    const byLevel: Record<string, number> = {}
    for (const c of allCourses) {
      byLevel[c.level] = (byLevel[c.level] || 0) + 1
    }

    // Agrupamento por Tecnologia
    const byTech: Record<string, number> = {}
    for (const c of allCourses) {
      byTech[c.technology] = (byTech[c.technology] || 0) + 1
    }

    return {
      totalCourses,
      totalLessons,
      totalActivities,
      totalHours,
      byLevel,
      byTech,
    }
  }, [allCourses, allLessons, activities])

  return (
    <AdminShell
      title="Analytics & Métricas Operacionais"
      subtitle="Relatórios e indicadores de volume, distribuição de conteúdo e eficiência do ecossistema"
    >
      <div className="space-y-6">
        {/* Core Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Total de Aulas Catalogadas</CardDescription>
              <CardTitle className="text-2xl font-black text-white font-mono">{metrics.totalLessons}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Integradas à grade sequencial
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Atividades Cadastradas</CardDescription>
              <CardTitle className="text-2xl font-black text-violet-400 font-mono">{metrics.totalActivities}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Exercícios e desafios práticos
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Horas de Vídeo Analisadas</CardDescription>
              <CardTitle className="text-2xl font-black text-emerald-400 font-mono">{metrics.totalHours}h</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Curadoria de canais oficiais
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Instruções de IA Ativas</CardDescription>
              <CardTitle className="text-2xl font-black text-purple-400 font-mono">
                {aiInstructions.filter((i) => i.active).length}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Regras pedagógicas no runtime
            </CardContent>
          </Card>
        </div>

        {/* Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribution by Level */}
          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-bold text-white">Distribuição por Nível de Ensino</CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Segmentação dos cursos catalogados
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3">
              {Object.entries(metrics.byLevel).map(([lvl, count]) => {
                const percentage = Math.round((count / (metrics.totalCourses || 1)) * 100)
                return (
                  <div key={lvl} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize text-zinc-300 font-semibold">{lvl}</span>
                      <span className="font-mono text-zinc-400">
                        {count} cursos ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Distribution by Technology */}
          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-bold text-white">Principais Tecnologias do Catálogo</CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Frequência de stacks abordadas
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-2.5">
              {Object.entries(metrics.byTech).map(([tech, count]) => (
                <div
                  key={tech}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
                >
                  <span className="font-bold text-white">{tech}</span>
                  <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-violet-300">
                    {count} {count === 1 ? 'curso' : 'cursos'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  )
}
