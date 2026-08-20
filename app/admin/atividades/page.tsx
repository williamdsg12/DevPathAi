'use client'

import { useState, useMemo } from 'react'
import {
  CheckSquare,
  Search,
  Plus,
  CheckCircle2,
  Trash2,
  Sparkles,
  Award,
  Clock,
  Code2,
  FileQuestion,
} from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'

export default function AdminAtividadesPage() {
  const { activities, adminApproveActivity, adminDeleteActivity, generateActivitiesForModule, allModules } = useAppStore()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isGenerating, setIsGenerating] = useState(false)

  const filteredActivities = useMemo(() => {
    return (activities || []).filter((act) => {
      const matchSearch =
        act.title.toLowerCase().includes(search.toLowerCase()) ||
        act.statement.toLowerCase().includes(search.toLowerCase())
      const matchType = typeFilter === 'all' || act.type === typeFilter
      const matchStatus = statusFilter === 'all' || act.status === statusFilter
      return matchSearch && matchType && matchStatus
    })
  }, [activities, search, typeFilter, statusFilter])

  async function handleGenerateSample() {
    if (allModules.length === 0) {
      toast.error('Nenhum módulo encontrado.')
      return
    }
    setIsGenerating(true)
    try {
      await generateActivitiesForModule(allModules[0].id)
      toast.success('Novas atividades pedagógicas geradas pelo motor de IA!')
    } catch {
      toast.error('Erro ao gerar atividades.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <AdminShell
      title="Banco de Atividades & Exercícios"
      subtitle="Gerenciamento das atividades pedagógicas práticas, dicas socráticas e critérios de aprovação"
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Total de Atividades</CardDescription>
              <CardTitle className="text-2xl font-black text-white font-mono">{activities.length}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Cadastradas nos módulos
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Publicadas & Ativas</CardDescription>
              <CardTitle className="text-2xl font-black text-emerald-400 font-mono">
                {activities.filter((a) => a.status === 'published').length}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Disponíveis para os alunos
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Em Revisão / Rascunho</CardDescription>
              <CardTitle className="text-2xl font-black text-amber-400 font-mono">
                {activities.filter((a) => a.status !== 'published').length}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Aguardando aprovação
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">XP Total Distribuído</CardDescription>
              <CardTitle className="text-2xl font-black text-violet-400 font-mono">
                {activities.reduce((acc, a) => acc + (a.xpReward || 0), 0)} XP
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Recompensas gamificadas
            </CardContent>
          </Card>
        </div>

        {/* Filter and Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#100f1c] p-4 rounded-2xl border border-white/10">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar atividade por título ou enunciado..."
              className="pl-9 bg-black/40 border-white/10 text-xs text-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-zinc-200 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="all">Todos os Tipos</option>
              <option value="multiple_choice">Múltipla Escolha</option>
              <option value="code">Código / Desafio</option>
              <option value="fill_code">Preencher Código</option>
              <option value="find_bug">Encontrar Bug</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-zinc-200 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="published">Publicada</option>
              <option value="review">Em Revisão</option>
              <option value="draft">Rascunho</option>
            </select>

            <Button
              size="sm"
              onClick={handleGenerateSample}
              disabled={isGenerating}
              className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl gap-1.5 h-9"
            >
              <Sparkles className="size-3.5" />
              {isGenerating ? 'Gerando...' : 'Gerar c/ IA'}
            </Button>
          </div>
        </div>

        {/* Activities Table */}
        <div className="rounded-3xl border border-white/10 bg-[#100f1c] overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-white/5 bg-black/40 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="p-4">Atividade</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Dificuldade</th>
                <th className="p-4">Recompensa</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    Nenhuma atividade encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white max-w-xs">
                      <p className="truncate">{act.title}</p>
                      <span className="text-[10px] text-zinc-400 font-normal line-clamp-1">
                        {act.statement}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-zinc-300">
                        {act.type}
                      </Badge>
                    </td>
                    <td className="p-4 capitalize font-semibold text-zinc-300">
                      {act.difficulty}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-violet-300 font-bold">
                      +{act.xpReward} XP
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          act.status === 'published'
                            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/30'
                            : 'border-amber-500/30 text-amber-400 bg-amber-950/30'
                        }`}
                      >
                        {act.status === 'published' ? 'Publicada' : 'Em Revisão'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {act.status !== 'published' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              adminApproveActivity(act.id)
                              toast.success('Atividade aprovada e publicada!')
                            }}
                            className="text-[10px] font-bold h-7 px-2 border-emerald-500/30 text-emerald-400 hover:text-emerald-300"
                          >
                            Aprovar
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            adminDeleteActivity(act.id)
                            toast.info('Atividade excluída.')
                          }}
                          className="text-[10px] font-bold h-7 px-2 text-zinc-500 hover:text-rose-400"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
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
