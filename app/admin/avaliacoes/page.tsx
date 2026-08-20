'use client'

import { useState, useMemo } from 'react'
import {
  Award,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { mockAssessments } from '@/lib/mock-data'

export default function AdminAvaliacoesPage() {
  const { allModules } = useAppStore()
  const [search, setSearch] = useState('')

  const assessmentsList = useMemo(() => {
    return Object.entries(mockAssessments).map(([moduleId, assess]) => {
      const relatedModule = allModules.find((m) => m.id === moduleId)
      return {
        moduleId,
        moduleTitle: relatedModule?.title || `Módulo ${moduleId}`,
        title: assess.title,
        questionsCount: assess.questions?.length || 0,
        passingGrade: assess.passingGrade || 70,
        xpReward: assess.xpReward || 500,
        timeLimitMin: assess.timeLimitMin || 30,
      }
    })
  }, [allModules])

  const filteredAssessments = useMemo(() => {
    return assessmentsList.filter((a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.moduleTitle.toLowerCase().includes(search.toLowerCase())
    )
  }, [assessmentsList, search])

  return (
    <AdminShell
      title="Avaliações & Provas de Módulo"
      subtitle="Supervisão das provas teóricas e práticas obrigatórias para desbloqueio sequencial dos módulos"
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Total de Avaliações</CardDescription>
              <CardTitle className="text-2xl font-black text-white font-mono">{assessmentsList.length}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Provas vinculadas aos módulos
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Média de Nota de Corte</CardDescription>
              <CardTitle className="text-2xl font-black text-emerald-400 font-mono">70%</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Critério mínimo de aprovação
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Tempo Médio Estimado</CardDescription>
              <CardTitle className="text-2xl font-black text-violet-400 font-mono">30 min</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Por avaliação formal
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-3 bg-[#100f1c] p-4 rounded-2xl border border-white/10">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar avaliação ou módulo..."
              className="pl-9 bg-black/40 border-white/10 text-xs text-white"
            />
          </div>
        </div>

        {/* Assessments Table */}
        <div className="rounded-3xl border border-white/10 bg-[#100f1c] overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-white/5 bg-black/40 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="p-4">Avaliação</th>
                <th className="p-4">Módulo Vinculado</th>
                <th className="p-4">Questões</th>
                <th className="p-4">Nota de Corte</th>
                <th className="p-4">Tempo Limite</th>
                <th className="p-4">Recompensa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    Nenhuma avaliação encontrada.
                  </td>
                </tr>
              ) : (
                filteredAssessments.map((a) => (
                  <tr key={a.moduleId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2.5">
                      <div className="size-8 rounded-xl bg-violet-600/20 border border-violet-500/30 grid place-items-center text-violet-300">
                        <Award className="size-4" />
                      </div>
                      <span>{a.title}</span>
                    </td>
                    <td className="p-4 text-zinc-300 font-semibold">{a.moduleTitle}</td>
                    <td className="p-4 font-mono text-[11px] text-zinc-400">{a.questionsCount} questões</td>
                    <td className="p-4 font-mono text-[11px] text-emerald-400 font-bold">{a.passingGrade}%</td>
                    <td className="p-4 font-mono text-[11px] text-zinc-400">{a.timeLimitMin} minutos</td>
                    <td className="p-4 font-mono text-[11px] text-violet-400 font-bold">+{a.xpReward} XP</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}
