'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  Filter,
  Layers,
  PlayCircle,
  Plus,
  Sparkles,
  Tv,
} from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { YoutubeIcon } from '@/components/icons'
import { useAppStore } from '@/lib/store'
import { getIcon } from '@/lib/module-icons'

export default function CoursesPage() {
  const { allCourses, allModules, allLessons, completedLessons, moduleStatus } = useAppStore()
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'Todos os Cursos' },
    { id: 'Fundamentos da Programação', label: 'Fundamentos' },
    { id: 'Web & Front-end', label: 'Web & JavaScript' },
    { id: 'Front-end Moderno', label: 'Front-end & React' },
    { id: 'Back-end', label: 'Back-end & APIs' },
    { id: 'Full Stack', label: 'Full Stack' },
  ]

  const filteredCourses = allCourses.filter(
    (c) => selectedCategory === 'all' || c.category === selectedCategory || (selectedCategory === 'Web & Front-end' && (c.category.includes('Web') || c.category.includes('Front')))
  )

  return (
    <AppShell
      title="Cursos & Catálogo Educacional"
      subtitle="Conteúdos pedagógicos estruturados com playlists reais do YouTube, módulos e aulas completas"
    >
      <div className="space-y-8">
        {/* Header Action Bar with YouTube Importer CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-primary/20 bg-primary/5 p-6 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground font-bold">Catálogo Oficial</Badge>
              <span className="text-xs text-muted-foreground font-semibold">Vídeos Reais do YouTube</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Estude com Conteúdo Real & Guiado
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Cursos organizados pedagogicamente em sequência lógica com vídeos oficiais e exercícios práticos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <Link href="/admin/youtube">
              <Button variant="outline" className="text-xs font-semibold py-6">
                Gerenciar Fontes
              </Button>
            </Link>

            <Link href="/cursos/importar">
              <Button className="gap-2 font-bold shadow-lg shadow-red-600/20 py-6 px-6 bg-red-600 hover:bg-red-700 text-white">
                <YoutubeIcon className="size-4" /> Importar Playlist do YouTube
              </Button>
            </Link>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="text-xs font-semibold shrink-0"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Courses Grid or Zero State */}
        {allCourses.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-border/80 rounded-3xl bg-muted/10 space-y-4">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen className="size-8" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-lg font-bold text-foreground">Você ainda não possui cursos disponíveis</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                O catálogo educacional está pronto para receber conteúdos reais. Adicione um canal ou playlist do YouTube na área administrativa para popular as aulas automaticamente.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/admin/youtube">
                <Button className="font-bold text-xs gap-2">
                  Gerenciar Fontes no Painel Admin <ArrowRight className="size-3.5" />
                </Button>
              </Link>
              <Link href="/cursos/importar">
                <Button variant="outline" className="font-bold text-xs gap-2">
                  <YoutubeIcon className="size-3.5" /> Importar Playlist
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => {
              const courseMods = allModules.filter((m) => m.courseId === course.id || m.phase === course.category)
              const firstLessonId = courseMods[0]?.lessonIds[0] || (allLessons[0]?.id ?? '')

              return (
                <Card key={course.id} className="flex flex-col justify-between border-border/80 hover:border-primary/40 transition-all shadow-md">
                  <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        {course.category}
                      </span>
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                        {course.level}
                      </Badge>
                    </div>

                    <div>
                      <CardTitle className="text-base font-bold line-clamp-1">{course.title}</CardTitle>
                      <CardDescription className="text-xs mt-0.5 line-clamp-1">
                        Fonte: {course.channelTitle || 'YouTube Oficial'}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/30 p-2 text-xs text-muted-foreground">
                      <span className="text-[11px] font-medium">{course.lessonsCount} aulas</span>
                      <span className="text-[11px] font-medium text-right">{course.totalHours}h estimadas</span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                      <Link href={`/courses/${course.slug}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                          Ver Detalhes
                        </Button>
                      </Link>

                      <Link href={firstLessonId ? `/aulas/${firstLessonId}` : `/courses/${course.slug}`} className="flex-1">
                        <Button size="sm" className="w-full text-xs font-bold gap-1">
                          <PlayCircle className="size-3.5" /> Iniciar
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
