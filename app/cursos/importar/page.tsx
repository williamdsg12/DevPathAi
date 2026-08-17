'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  Clock,
  Layers,
  PlayCircle,
  Sparkles,
  Tv,
  Youtube,
} from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { YoutubeIcon } from '@/components/icons'
import { useAppStore } from '@/lib/store'
import type { Course, LearningModule, Lesson, YouTubePlaylist } from '@/lib/types'

export default function ImportYouTubePage() {
  const router = useRouter()
  const { importCourseFromPlaylist, ingestFullChannelToStore, profile } = useAppStore()
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')

  const [importResult, setImportResult] = useState<any>(null)

  // Quick Playlist Suggestions
  const quickSuggestions = [
    { label: 'Canal Curso em Vídeo (@cursoemvideo)', url: 'https://www.youtube.com/@cursoemvideo' },
    { label: 'Lógica (Gustavo Guanabara)', url: 'https://www.youtube.com/playlist?list=PLHz_AreHm4dmSj0MHol_aoNYCSGFqvfXV' },
    { label: 'JavaScript (Curso em Vídeo)', url: 'https://www.youtube.com/playlist?list=PLHz_AreHm4dlsK3Nr9GVvXCbpQyHQl1o1' },
    { label: 'HTML5 & CSS3 (Guanabara)', url: 'https://www.youtube.com/playlist?list=PLHz_AreHm4dlAnJ_jJtV29RFxnPHDuk9o' },
    { label: 'Git & GitHub (Guanabara)', url: 'https://www.youtube.com/playlist?list=PLHz_AreHm4dm7ZULPAmadvjNdH6zkzpN1' },
    { label: 'React Moderno (Hora de Codar)', url: 'https://www.youtube.com/playlist?list=PLnDvRpP8BnezptmknbFpvo_kofnpqVpU-' },
  ]

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) {
      toast.error('Insira a URL ou link do canal/playlist do YouTube.')
      return
    }

    setIsLoading(true)
    setLoadingStep('Consultando YouTube Data API v3...')

    try {
      setLoadingStep('Recuperando cursos e vídeos com paginação completa...')
      const res = await fetch('/api/youtube/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': profile?.email || 'williamdev36@gmail.com',
          'x-user-role': profile?.role || 'SUPER_ADMIN',
          'x-admin-email': 'williamdev36@gmail.com',
        },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível importar o conteúdo do YouTube.')
      }

      setLoadingStep('Estruturando módulos e organizando aulas com IA...')
      setTimeout(() => {
        setImportResult(data)
        setIsLoading(false)
        if (data.isChannel) {
          toast.success(`Canal "${data.channel?.name}" identificado! ${data.courses?.length || 0} cursos e ${data.totalVideos || 0} aulas recuperadas.`)
        } else {
          toast.success(`Playlist importada com sucesso! ${data.totalVideos} aulas identificadas.`)
        }
      }, 500)
    } catch (err: any) {
      setIsLoading(false)
      toast.error(err.message || 'Erro ao consultar a API do YouTube.')
    }
  }

  function handleSaveCourse() {
    if (!importResult) return

    if (importResult.isChannel && importResult.channel) {
      ingestFullChannelToStore({
        channel: importResult.channel,
        playlists: importResult.playlists,
        courses: importResult.courses,
        modules: importResult.modules,
        lessons: importResult.lessons,
        report: importResult.report,
      })
      toast.success(`Canal "${importResult.channel.name}" com ${importResult.courses?.length || 0} cursos adicionado ao catálogo oficial!`)
    } else {
      importCourseFromPlaylist({
        course: importResult.course,
        modules: importResult.modules,
        lessons: importResult.lessons,
        playlist: importResult.playlist,
      })
      toast.success(`Curso "${importResult.course.title}" adicionado ao catálogo oficial!`)
    }

    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } })
    } catch {}

    router.push('/cursos')
  }

  return (
    <AppShell
      title="Importar Playlist do YouTube"
      subtitle="Transforme qualquer playlist pública em um curso organizado com vídeos reais e paginação completa"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <Link
            href="/cursos"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Voltar para Cursos
          </Link>

          <Link href="/admin/youtube">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              Gerenciar Fontes do YouTube <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>

        {/* URL Input Box */}
        <Card className="border-border/80 shadow-xl shadow-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-red-600/10 text-red-600">
                <YoutubeIcon className="size-7" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold">Importador Oficial do YouTube</CardTitle>
                <CardDescription className="text-xs">
                  Cole a URL de uma playlist ou vídeo. A IA consultará a API oficial, recuperará todos os vídeos e criará a estrutura de módulos.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">URL da Playlist do YouTube</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="https://www.youtube.com/playlist?list=PLHz_AreHm4dmSj0MHol_aoNYCSGFqvfXV"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="text-xs sm:text-sm font-mono"
                    required
                  />
                  <Button type="submit" disabled={isLoading} className="gap-2 font-bold shrink-0 bg-red-600 hover:bg-red-700 text-white">
                    <Sparkles className="size-4" />
                    {isLoading ? 'Consultando...' : 'Importar Playlist'}
                  </Button>
                </div>
              </div>
            </form>

            {/* Quick Presets */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <span className="text-xs font-semibold text-muted-foreground">Playlists recomendadas para teste rápido:</span>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((sug) => (
                  <button
                    key={sug.label}
                    type="button"
                    onClick={() => setUrl(sug.url)}
                    className="rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
                  >
                    {sug.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-center space-y-2 animate-pulse">
                <p className="text-xs font-bold text-primary">{loadingStep}</p>
                <p className="text-[11px] text-muted-foreground">
                  Aguarde enquanto buscamos os metadados oficiais e estruturamos as aulas.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* AI Classification & Real Video Preview */}
        {importResult ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Overview Card */}
            <Card className="border-primary/40 bg-gradient-to-r from-primary/10 via-card to-card overflow-hidden">
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-red-600 text-white font-bold text-xs">
                      {importResult.isChannel ? 'Canal Oficial Identificado' : 'Playlist Oficial Importada'}
                    </Badge>
                    <Badge variant="secondary" className="font-bold text-xs">
                      {importResult.isChannel ? `${importResult.courses?.length || 0} Cursos Encontrados` : (importResult.course?.technology || 'Desenvolvimento')}
                    </Badge>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-foreground">
                    {importResult.isChannel ? importResult.channel?.name : importResult.course?.title}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {importResult.isChannel ? (
                      <>
                        Canal Oficial: <strong className="text-foreground">{importResult.channel?.name}</strong> • {importResult.courses?.length || 0} cursos • {importResult.totalVideos} aulas catalogadas
                      </>
                    ) : (
                      <>
                        Canal Oficial: <strong className="text-foreground">{importResult.playlist?.channelTitle || importResult.course?.channelTitle}</strong> • {importResult.totalVideos} aulas • {importResult.course?.totalHours}h estimadas
                      </>
                    )}
                  </p>
                </div>

                <Button
                  size="lg"
                  onClick={handleSaveCourse}
                  className="gap-2 font-bold shadow-xl shadow-primary/25 py-6 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
                >
                  <CheckCircle2 className="size-5" />
                  {importResult.isChannel ? 'Integrar Todos os Cursos do Canal' : 'Integrar como Curso Oficial'}
                </Button>
              </div>
            </Card>

            {/* Courses / Modules Structure */}
            {importResult.isChannel ? (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Layers className="size-4 text-primary" /> Cursos Identificados no Canal ({importResult.courses?.length || 0})
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {importResult.courses?.map((course: any) => (
                    <Card key={course.id} className="border-border/80 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          {course.category}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {course.lessonsCount} aulas • {course.totalHours}h
                        </Badge>
                      </div>

                      <h4 className="text-sm font-bold text-foreground line-clamp-1">{course.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {course.skills?.map((s: string) => (
                          <span key={s} className="rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {s}
                          </span>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Layers className="size-4 text-primary" /> Módulos Gerados pela IA ({importResult.modules?.length || 0})
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {importResult.modules?.map((mod: any) => (
                    <Card key={mod.id} className="border-border/80 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          Módulo {mod.order}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {mod.lessonIds?.length || 0} aulas • {mod.estimatedHours}h
                        </Badge>
                      </div>

                      <h4 className="text-sm font-bold text-foreground">{mod.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{mod.description}</p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {mod.skills?.map((s: string) => (
                          <span key={s} className="rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {s}
                          </span>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Real Videos List */}
            <Card className="border-border/80 shadow-lg">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold">
                      Grade Curricular de Aulas Recuperadas ({importResult.lessons?.length || 0})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Vídeos reais do YouTube com IDs oficiais e durações calculadas.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {importResult.lessons?.map((lesson: any, i: number) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between rounded-xl border border-border/70 p-3 text-xs gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary shrink-0">
                        {i + 1}
                      </span>
                      <div className="truncate">
                        <p className="font-semibold text-foreground truncate">{lesson.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {lesson.technology ? `${lesson.technology} • ` : ''}{lesson.durationMin} min
                        </p>
                      </div>
                    </div>

                    <Badge variant="outline" className="text-[10px] shrink-0">
                      ID: {lesson.videoId || lesson.id}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveCourse} size="lg" className="gap-2 font-bold shadow-xl shadow-primary/20">
                <CheckCircle2 className="size-4" />
                {importResult.isChannel ? 'Confirmar e Integrar Todos os Cursos do Canal' : 'Confirmar e Integrar ao Catálogo'}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  )
}
