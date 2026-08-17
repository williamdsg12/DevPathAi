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

export default function CoursesPage() {
  const { allCourses, allModules, allLessons, completedLessons, activePath, isModuleUnlocked } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')

  const activeModuleIds = useMemo(() => {
    return new Set(activePath?.items?.map((it) => it.moduleId) || [])
  }, [activePath])

  const categories = [
    { id: 'all', label: 'Todos' },
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
      title="Cursos"
      subtitle="Catálogo completo de cursos e módulos de formação em programação"
    >
      <div className="space-y-8 pb-12">
        {/* Banner de Apresentação */}
        <div className="rounded-3xl border border-white/5 bg-[#12111a] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1.5 max-w-2xl">
            <Badge className="bg-violet-950/80 border border-violet-500/30 text-violet-300 font-bold text-xs">
              Catálogo Oficial
            </Badge>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Cursos e Formações Especializadas
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
              Explore o catálogo completo de cursos com aulas sequenciais, exercícios práticos e avaliações.
            </p>
          </div>

          <Link href="/trilha" className="shrink-0">
            <Button size="lg" className="w-full sm:w-auto gap-2 font-black text-xs px-6 py-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-purple-600/30">
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
                placeholder="Buscar por tecnologia, nome do curso, módulo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-[#12111a] border-white/10 rounded-2xl text-xs placeholder:text-zinc-500 focus-visible:ring-violet-500/50"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {levels.map((lvl) => (
                <Button
                  key={lvl.id}
                  variant={selectedLevel === lvl.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={`text-xs font-bold rounded-xl shrink-0 transition-colors ${
                    selectedLevel === lvl.id
                      ? 'bg-violet-600 text-white border-violet-500'
                      : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {lvl.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Categorias */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs font-bold shrink-0 rounded-xl px-3.5 transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40'
                    : 'bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5'
                }`}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid de Cursos com Cards Grandes */}
        {filteredCourses.length === 0 ? (
          <Card className="p-12 text-center border-white/5 rounded-3xl bg-[#12111a] space-y-3">
            <p className="text-sm font-bold text-white">Nenhum curso encontrado para os filtros selecionados.</p>
            <p className="text-xs text-zinc-400">Tente buscar por outro termo ou limpe os filtros de categoria/nível.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedLevel('all')
              }}
              className="text-xs font-bold rounded-xl border-white/10 text-white"
            >
              Limpar Filtros
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => {
              const courseMods = allModules.filter((m) => m.courseId === course.id || m.phase === course.category)
              const courseLessonIds = courseMods.flatMap((m) => m.lessonIds || [])
              const completedInCourse = courseLessonIds.filter((lid) => completedLessons.includes(lid)).length
              const courseProgressPercent = courseLessonIds.length > 0 ? Math.round((completedInCourse / courseLessonIds.length) * 100) : 0
              const isCourseInActivePath = courseMods.some((m) => activeModuleIds.has(m.id))

              return (
                <div
                  key={course.id}
                  className="group flex flex-col justify-between rounded-3xl border border-white/5 bg-[#12111a] hover:border-violet-500/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-950/30 overflow-hidden"
                >
                  {/* Thumbnail / Cover */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                    {course.thumbnailUrl ? (
                      <Image
                        src={course.thumbnailUrl}
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="grid size-full place-items-center bg-violet-950/30 text-violet-400">
                        <BookOpen className="size-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12111a] via-transparent to-transparent" />
                    
                    <Badge className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-[10px] font-extrabold text-white border border-white/10">
                      {course.technology || 'Tecnologia'}
                    </Badge>

                    {isCourseInActivePath && (
                      <Badge className="absolute top-3 right-3 bg-violet-600 text-white text-[10px] font-black shadow-lg shadow-purple-600/40 border border-violet-400/30">
                        Na Sua Trilha
                      </Badge>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-violet-400">
                          {course.category}
                        </span>
                        <span className="text-[11px] font-bold text-zinc-400 capitalize">
                          ● {LEVEL_LABELS[course.level as SkillLevel] || course.level}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-white group-hover:text-violet-300 transition-colors leading-snug line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                        {course.description}
                      </p>
                    </div>

                    {/* Metadata & Progress */}
                    <div className="space-y-3 pt-2">
                      {courseProgressPercent > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                            <span>Progresso</span>
                            <span className="text-violet-400 font-mono">{courseProgressPercent}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                            <div
                              style={{ width: `${courseProgressPercent}%` }}
                              className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-white/5 pt-3">
                        <span className="font-semibold">{courseMods.length} módulos</span>
                        <span className="text-zinc-600">•</span>
                        <span className="font-semibold">{course.lessonsCount} aulas</span>
                        <span className="text-zinc-600">•</span>
                        <span className="font-semibold font-mono">{course.totalHours}h</span>
                      </div>

                      {/* Ver Curso Button */}
                      <Link href={`/courses/${course.slug || course.id}`} className="block pt-1">
                        <Button className="w-full justify-between font-bold text-xs py-5 rounded-xl bg-white/[0.04] hover:bg-violet-600 text-white border border-white/10 hover:border-violet-500 transition-all duration-200 group-hover:bg-violet-600">
                          <span>Ver curso</span>
                          <ArrowRight className="size-4" />
                        </Button>
                      </Link>
                    </div>
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
