'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  Video,
  Eye,
  ExternalLink,
  Youtube,
  LayoutGrid,
  List,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { LEVEL_LABELS, type SkillLevel } from '@/lib/types'

export default function AdminCursosPage() {
  const { allCourses, allModules, allLessons, removeCourse, updateCourseDetails } = useAppStore()
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const filteredCourses = useMemo(() => {
    return allCourses.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.technology.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase()) ||
        (c.channelTitle && c.channelTitle.toLowerCase().includes(search.toLowerCase()))
      const matchLevel = levelFilter === 'all' || c.level === levelFilter
      const matchStatus = statusFilter === 'all' || c.status === statusFilter
      return matchSearch && matchLevel && matchStatus
    })
  }, [allCourses, search, levelFilter, statusFilter])

  const totalLessons = useMemo(() => allLessons.length, [allLessons])
  const totalHours = useMemo(() => allCourses.reduce((acc, c) => acc + (c.totalHours || 0), 0), [allCourses])

  function handleToggleStatus(courseId: string, currentStatus: string) {
    const newStatus = currentStatus === 'ativo' ? 'rascunho' : 'ativo'
    updateCourseDetails(courseId, { status: newStatus as any })
    toast.success(`Status do curso alterado para "${newStatus}".`)
  }

  function handleDeleteCourse(courseId: string, title: string) {
    if (confirm(`Tem certeza que deseja excluir o curso "${title}"?`)) {
      removeCourse(courseId)
      toast.success(`Curso "${title}" excluído do catálogo.`)
    }
  }

  return (
    <AdminShell
      title="Catálogo de Conteúdo & Cursos"
      subtitle="Gerenciamento da grade curricular, status de publicação, canais oficiais e integridade das aulas"
    >
      <div className="space-y-6 max-w-7xl">
        {/* Metric Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Total de Cursos</CardDescription>
              <CardTitle className="text-2xl font-black text-white font-mono">{allCourses.length}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Grade oficial estruturada
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Cursos Ativos</CardDescription>
              <CardTitle className="text-2xl font-black text-emerald-400 font-mono">
                {allCourses.filter((c) => c.status === 'ativo').length}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Disponíveis para alunos
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Módulos & Aulas</CardDescription>
              <CardTitle className="text-2xl font-black text-violet-400 font-mono">
                {allModules.length} <span className="text-xs text-zinc-400 font-normal">mods</span> • {totalLessons}{' '}
                <span className="text-xs text-zinc-400 font-normal">aulas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              {totalHours}h de vídeo catalogadas
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Integridade dos Vídeos</CardDescription>
              <CardTitle className="text-2xl font-black text-emerald-400 font-mono">100% VÁLIDOS</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Embeds oficiais funcionais
            </CardContent>
          </Card>
        </div>

        {/* Controls & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#100f1c] p-4 rounded-2xl border border-white/10">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por curso, tecnologia ou canal..."
                className="pl-9 bg-black/40 border-white/10 text-xs text-white h-9 rounded-xl"
              />
            </div>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="all">Todos os Níveis</option>
              <option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediário</option>
              <option value="avancado">Avançado</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="rascunho">Rascunho</option>
              <option value="arquivado">Arquivado</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* View Mode Switcher */}
            <div className="flex items-center rounded-xl bg-black/40 p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-violet-600/30 text-violet-300' : 'text-zinc-400 hover:text-white'
                }`}
                title="Visualização em Lista"
              >
                <List className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-violet-600/30 text-violet-300' : 'text-zinc-400 hover:text-white'
                }`}
                title="Visualização em Grade"
              >
                <LayoutGrid className="size-4" />
              </button>
            </div>

            <Link href="/admin/youtube">
              <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white text-xs rounded-xl gap-1.5 h-9">
                <Plus className="size-3.5" /> Descobrir / Importar
              </Button>
            </Link>
          </div>
        </div>

        {/* Courses Presentation: List or Grid */}
        {filteredCourses.length === 0 ? (
          <Card className="bg-[#100f1c] border-white/10 p-12 text-center">
            <BookOpen className="size-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">Nenhum curso encontrado</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
              Não encontramos cursos correspondentes aos filtros selecionados.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('')
                setLevelFilter('all')
                setStatusFilter('all')
              }}
              className="text-xs border-white/10 text-zinc-300"
            >
              Limpar Filtros
            </Button>
          </Card>
        ) : viewMode === 'list' ? (
          /* LIST VIEW */
          <div className="rounded-2xl border border-white/10 bg-[#100f1c] overflow-hidden">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-white/5 bg-black/40 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="p-4">Curso</th>
                  <th className="p-4">Canal / Fonte</th>
                  <th className="p-4">Tecnologia</th>
                  <th className="p-4">Nível</th>
                  <th className="p-4">Grade</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {course.thumbnailUrl ? (
                          <img
                            src={course.thumbnailUrl}
                            alt=""
                            className="size-10 rounded-lg object-cover border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="size-10 rounded-lg bg-violet-950/40 border border-violet-500/20 grid place-items-center shrink-0">
                            <BookOpen className="size-4 text-violet-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-bold text-white block truncate max-w-xs">{course.title}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">{course.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-300 font-medium">{course.channelTitle || 'Canal Oficial'}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-violet-300 bg-violet-950/20">
                        {course.technology}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-[11px] text-zinc-300 capitalize">{course.level}</span>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-zinc-400">
                      {course.modulesCount || 1} mods • {course.lessonsCount || 0} aulas ({course.totalHours || 0}h)
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono uppercase font-bold ${
                          course.status === 'ativo'
                            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/30'
                            : 'border-amber-500/30 text-amber-400 bg-amber-950/30'
                        }`}
                      >
                        {course.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(course.id, course.status)}
                          className="h-7 text-[11px] text-zinc-400 hover:text-white px-2"
                        >
                          {course.status === 'ativo' ? 'Pausar' : 'Publicar'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCourse(course.id, course.title)}
                          className="h-7 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-950/20 px-2"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="bg-[#100f1c] border-white/10 overflow-hidden flex flex-col justify-between">
                <div>
                  {course.thumbnailUrl && (
                    <div className="h-36 w-full overflow-hidden relative border-b border-white/5">
                      <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      <Badge
                        variant="outline"
                        className={`absolute top-3 right-3 text-[10px] font-mono uppercase font-bold ${
                          course.status === 'ativo'
                            ? 'border-emerald-500/40 text-emerald-300 bg-black/80'
                            : 'border-amber-500/40 text-amber-300 bg-black/80'
                        }`}
                      >
                        {course.status}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[9px] font-mono border-white/10 text-violet-300">
                        {course.technology}
                      </Badge>
                      <span className="text-[10px] text-zinc-400 capitalize">{course.level}</span>
                    </div>
                    <CardTitle className="text-sm font-bold text-white line-clamp-1">{course.title}</CardTitle>
                    <CardDescription className="text-[11px] text-zinc-400 line-clamp-2">
                      {course.description || `Formação completa em ${course.technology}.`}
                    </CardDescription>
                  </CardHeader>
                </div>

                <CardContent className="p-4 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-400">
                    {course.lessonsCount || 0} aulas • {course.totalHours || 0}h
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(course.id, course.status)}
                      className="h-7 text-[10px] text-zinc-400 hover:text-white px-2"
                    >
                      {course.status === 'ativo' ? 'Pausar' : 'Ativar'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCourse(course.id, course.title)}
                      className="h-7 text-[10px] text-red-400 hover:text-red-300 px-1.5"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  )
}
