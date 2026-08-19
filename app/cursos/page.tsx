'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  Layers,
  Lock,
  Play,
  Search,
  Sparkles,
} from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import { LEVEL_LABELS, type SkillLevel } from '@/lib/types'

const TECH_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  JavaScript: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/30' },
  TypeScript: { bg: 'bg-blue-500/10', text: 'text-blue-300', border: 'border-blue-500/30' },
  React: { bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  Node: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  Python: { bg: 'bg-indigo-500/10', text: 'text-indigo-300', border: 'border-indigo-500/30' },
  HTML: { bg: 'bg-orange-500/10', text: 'text-orange-300', border: 'border-orange-500/30' },
  CSS: { bg: 'bg-sky-500/10', text: 'text-sky-300', border: 'border-sky-500/30' },
  SQL: { bg: 'bg-purple-500/10', text: 'text-purple-300', border: 'border-purple-500/30' },
  Git: { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/30' },
}

export default function CoursesPage() {
  const { allCourses, allModules, allLessons, completedLessons, activePath, isModuleUnlocked } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')

  const categories = [
    { id: 'all', label: 'Todos os Cursos' },
    { id: 'Fundamentos', label: 'Fundamentos' },
    { id: 'Frontend', label: 'Front-end & Web' },
    { id: 'Backend', label: 'Back-end & APIs' },
    { id: 'Full Stack', label: 'Full Stack' },
    { id: 'Mobile', label: 'Mobile' },
    { id: 'Data & IA', label: 'Data Science & IA' },
  ]

  const levels = [
    { id: 'all', label: 'Todos os Níveis' },
    { id: 'iniciante', label: 'Iniciante' },
    { id: 'intermediario', label: 'Intermediário' },
    { id: 'avancado', label: 'Avançado' },
  ]

  const filteredCourses = useMemo(() => {
    return allCourses.filter((course) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = course.title.toLowerCase().includes(q)
        const matchDesc = course.description.toLowerCase().includes(q)
        const matchTech = (course.technology || '').toLowerCase().includes(q)
        const matchSkills = (course.skills || []).some((s) => s.toLowerCase().includes(q))
        if (!matchTitle && !matchDesc && !matchTech && !matchSkills) {
          return false
        }
      }

      if (selectedLevel !== 'all' && course.level !== selectedLevel) {
        return false
      }

      if (selectedCategory !== 'all') {
        const combined = `${course.category} ${course.title} ${course.technology} ${(course.skills || []).join(' ')}`.toLowerCase()
        if (selectedCategory === 'Fundamentos') {
          return combined.includes('fundamentos') || combined.includes('lógica') || combined.includes('algoritmo') || combined.includes('git')
        }
        if (selectedCategory === 'Frontend') {
          return combined.includes('front') || combined.includes('web') || combined.includes('html') || combined.includes('css') || combined.includes('react')
        }
        if (selectedCategory === 'Backend') {
          return combined.includes('back') || combined.includes('node') || combined.includes('python') || combined.includes('api')
        }
        if (selectedCategory === 'Full Stack') {
          return combined.includes('full') || combined.includes('fullstack')
        }
      }

      return true
    })
  }, [allCourses, searchQuery, selectedCategory, selectedLevel])

  return (
    <AppShell
      title="Catálogo de Cursos"
      subtitle="Cursos completos com vídeo-aulas sequenciais, desafios práticos e certificação"
    >
      <div className="space-y-8 pb-16">
        {/* Banner de Apresentação */}
        <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-950/40 via-[#12111d] to-[#0a0910] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1.5 max-w-2xl">
            <Badge className="bg-violet-950/80 border border-violet-500/30 text-violet-300 font-bold text-xs">
              Catálogo Curado por Especialistas
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Cursos e Formações Especializadas
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
              Explore o catálogo completo de cursos com aulas sequenciais, exercícios de código e projetos de portfólio.
            </p>
          </div>

          <Link href="/trilha" className="shrink-0">
            <Button size="lg" className="w-full sm:w-auto gap-2 font-black text-xs sm:text-sm px-7 py-5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white shadow-xl shadow-purple-600/30">
              <Compass className="size-4" /> Ver Minha Trilha
            </Button>
          </Link>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
              <Input
                placeholder="Buscar por tecnologia, título do curso, módulo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-[#12111d] border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder:text-zinc-500 focus-visible:ring-violet-500/50"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {levels.map((lvl) => (
                <Button
                  key={lvl.id}
                  variant={selectedLevel === lvl.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={`text-xs font-bold rounded-xl shrink-0 transition-colors cursor-pointer ${
                    selectedLevel === lvl.id
                      ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/25'
                      : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {lvl.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Categorias Quick Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-violet-950/80 border-violet-500 text-violet-200 ring-1 ring-violet-400 shadow-md shadow-violet-950/40'
                    : 'bg-[#12111d] border-white/5 text-zinc-400 hover:text-white hover:border-white/20'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Cursos */}
        {filteredCourses.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#12111d] p-12 text-center space-y-4">
            <BookOpen className="size-10 text-zinc-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Nenhum curso encontrado</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Não encontramos nenhum curso ativo correspondente aos filtros selecionados.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedLevel('all')
              }}
              className="text-xs font-bold border-white/10 rounded-xl"
            >
              Limpar Filtros
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => {
              const courseModules = allModules.filter(
                (m) => m.courseId === course.id || m.phase === course.category || (course.playlistId && m.id.includes(course.id))
              )
              const courseLessons = courseModules.flatMap((m) =>
                allLessons.filter((l) => m.lessonIds.includes(l.id) || l.moduleId === m.id)
              )
              const totalMissions = courseLessons.length || course.lessonsCount || 1

              const techKey = Object.keys(TECH_COLORS).find((k) =>
                course.title.toLowerCase().includes(k.toLowerCase()) || (course.technology || '').toLowerCase().includes(k.toLowerCase())
              )
              const techStyle = techKey ? TECH_COLORS[techKey] : { bg: 'bg-violet-500/10', text: 'text-violet-300', border: 'border-violet-500/30' }

              return (
                <div
                  key={course.id}
                  className="group relative rounded-3xl border border-white/5 bg-[#12111d] hover:border-violet-500/40 p-5 space-y-4 transition-all duration-300 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Thumbnail / Header */}
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-md">
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      ) : (
                        <div className="grid size-full place-items-center bg-violet-950/40 text-violet-400">
                          <BookOpen className="size-10" />
                        </div>
                      )}
                      <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-lg bg-black/80 text-[10px] font-bold text-white font-mono">
                        {course.totalHours || Math.max(1, Math.round(courseLessons.reduce((acc, l) => acc + (l.durationMin || 25), 0) / 60))}h de conteúdo
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono border ${techStyle.bg} ${techStyle.text} ${techStyle.border}`}>
                        {course.technology || 'Formação'}
                      </span>
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold bg-white/5 text-zinc-400">
                        {LEVEL_LABELS[course.level as SkillLevel] || course.level}
                      </Badge>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors leading-snug">
                      {course.title}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                      {course.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 font-semibold">
                      {totalMissions} missões práticas
                    </span>
                    <Link href={`/courses/${course.slug || course.id}`}>
                      <Button size="sm" variant="ghost" className="text-xs text-violet-400 hover:text-violet-300 font-bold gap-1 p-0 cursor-pointer">
                        Ver Jornada <ArrowRight className="size-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
