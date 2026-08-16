'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Database,
  Edit,
  FolderGit2,
  Layers,
  Plus,
  ShieldCheck,
  Trash2,
  Tv,
  Users,
  Youtube,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { YoutubeIcon } from '@/components/icons'
import { mockExercises } from '@/lib/mock-data'
import { useAppStore } from '@/lib/store'

export default function AdminPage() {
  const { allCourses, allModules, allLessons, technologySources } = useAppStore()
  const [exercises, setExercises] = useState(mockExercises)

  return (
    <AppShell
      title="Painel Administrativo & CMS"
      subtitle="Gerenciamento de conteúdos, trilhas, módulos, aulas, exercícios e métricas da plataforma"
    >
      <div className="space-y-8">
        {/* YouTube Content Management Banner CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-red-600/30 bg-red-600/[0.04] p-6 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-red-600 text-white font-bold gap-1 text-xs">
                <YoutubeIcon className="size-3.5" /> YouTube Data API v3
              </Badge>
              <span className="text-xs text-muted-foreground font-semibold">Catálogo Conectado</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Fontes de Conteúdo & Sincronização
            </h2>
            <p className="text-xs text-muted-foreground max-w-xl">
              Gerencie playlists importadas, defina fontes prioritárias por tecnologia e sincronize novos vídeos automaticamente.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/cursos/importar">
              <Button variant="outline" size="sm" className="text-xs font-semibold">
                Importar Playlist
              </Button>
            </Link>

            <Link href="/admin/youtube">
              <Button size="sm" className="gap-2 font-bold text-xs bg-red-600 hover:bg-red-700 text-white">
                Gerenciar Fontes <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Metrics Overview */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Cursos no Catálogo</span>
              <BookOpen className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">{allCourses.length}</div>
              <p className="text-[11px] text-success mt-1">{technologySources.length} fontes ativas</p>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Módulos Publicados</span>
              <Layers className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">{allModules.length}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Estruturados dinamicamente</p>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Aulas Reais</span>
              <Tv className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">{allLessons.length}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Com vídeos individuais</p>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Banco de Questões</span>
              <CheckCircle2 className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">{exercises.length}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Com validação automática</p>
            </CardContent>
          </Card>
        </section>

        {/* Content Management Tabs */}
        <Card className="border-border/80 shadow-xl shadow-primary/5">
          <Tabs defaultValue="modules" className="w-full">
            <div className="border-b border-border bg-muted/30 px-6 py-2">
              <TabsList className="bg-transparent gap-2">
                <TabsTrigger value="modules" className="text-xs font-bold data-[state=active]:bg-card">
                  Módulos ({allModules.length})
                </TabsTrigger>
                <TabsTrigger value="lessons" className="text-xs font-bold data-[state=active]:bg-card">
                  Aulas ({allLessons.length})
                </TabsTrigger>
                <TabsTrigger value="exercises" className="text-xs font-bold data-[state=active]:bg-card">
                  Exercícios ({exercises.length})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Modules Tab */}
            <TabsContent value="modules" className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Lista de Módulos da Formação</h3>
                <Link href="/admin/youtube">
                  <Button size="sm" className="gap-1.5 text-xs font-bold">
                    <Plus className="size-3.5" /> Adicionar / Sincronizar Módulos
                  </Button>
                </Link>
              </div>

              <div className="space-y-2">
                {allModules.length === 0 ? (
                  <div className="p-8 text-center border border-dashed rounded-2xl bg-muted/20 text-xs text-muted-foreground">
                    Nenhum módulo cadastrado. Importe canais ou playlists no painel do YouTube para gerar módulos reais.
                  </div>
                ) : (
                  allModules.map((mod) => (
                    <div
                      key={mod.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary font-bold">
                          {mod.order}
                        </span>
                        <div>
                          <p className="font-bold text-foreground">{mod.title}</p>
                          <p className="text-[11px] text-muted-foreground">{mod.phase} • {mod.estimatedHours}h estimadas</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {mod.lessonIds.length} aulas
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Lessons Tab */}
            <TabsContent value="lessons" className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Lista de Aulas do Catálogo</h3>
                <Link href="/admin/youtube">
                  <Button size="sm" className="gap-1.5 text-xs font-bold">
                    <Plus className="size-3.5" /> Gerenciar Aulas do YouTube
                  </Button>
                </Link>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
                {allLessons.length === 0 ? (
                  <div className="p-8 text-center border border-dashed rounded-2xl bg-muted/20 text-xs text-muted-foreground">
                    Nenhuma aula cadastrada. Importe playlists no painel do YouTube.
                  </div>
                ) : (
                  allLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-7 place-items-center rounded-lg bg-muted text-muted-foreground font-bold">
                          {lesson.order}
                        </span>
                        <div>
                          <p className="font-bold text-foreground">{lesson.title}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {lesson.source ? `Fonte: ${lesson.source} • ` : ''}Tipo: {lesson.type} • {lesson.durationMin} min
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Exercises Tab */}
            <TabsContent value="exercises" className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Banco de Questões e Desafios</h3>
                <Button size="sm" onClick={() => toast.info('Modal de criação de exercício pronto para formulário.')} className="gap-1.5 text-xs font-bold">
                  <Plus className="size-3.5" /> Criar Exercício
                </Button>
              </div>

              <div className="space-y-2">
                {exercises.map((ex, i) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary font-bold">
                        {i + 1}
                      </span>
                      <div className="truncate">
                        <p className="font-bold text-foreground truncate">{ex.prompt}</p>
                        <p className="text-[11px] text-muted-foreground capitalize">Tipo: {ex.type} • Dificuldade: {ex.difficulty}</p>
                      </div>
                    </div>

                    <Badge variant="outline" className="text-[10px] uppercase font-bold shrink-0">
                      {ex.difficulty}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </AppShell>
  )
}
