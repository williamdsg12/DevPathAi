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
  ShieldCheck,
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
    setLoadingStep('Passo 1/3: Consultando YouTube Data API v3...')

    try {
      setLoadingStep('Passo 2/3: Analisando e classificando vídeos e durações...')
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

      setLoadingStep('Passo 3/3: Estruturando módulos e gerando atividades pedagógicas...')
      setTimeout(() => {
        setImportResult(data)
        setIsLoading(false)
        if (data.isChannel) {
          toast.success(`Canal "${data.channel?.name}" identificado! ${data.courses?.length || 0} cursos e ${data.totalVideos || 0} aulas catalogadas.`)
        } else {
          toast.success(`Playlist importada com sucesso! ${data.totalVideos} aulas identificadas.`)
        }
      }, 600)
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
      title="Importar Playlist do YouTube — CMS Admin"
      subtitle="Transforme qualquer playlist pública em um curso estruturado com módulos e atividades com IA"
    >
      <div className="mx-auto max-w-4xl space-y-6 pb-16">
        {/* Admin Mode Badge Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <Link
            href="/cursos"
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Voltar para Cursos
          </Link>

          <div className="flex items-center gap-2">
            <Badge className="bg-violet-950/80 border border-violet-500/40 text-violet-300 text-xs font-mono font-bold">
              <ShieldCheck className="size-3.5 mr-1" /> MODO ADMINISTRADOR
            </Badge>
            <Link href="/admin">
              <Button variant="outline" size="sm" className="text-xs font-bold border-white/10 text-zinc-300 hover:text-white gap-1.5">
                Painel Geral Admin <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* URL Input Box */}
        <Card className="border-white/10 bg-[#12111d] shadow-2xl rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="grid size-12 place-items-center rounded-2xl bg-rose-600/15 border border-rose-500/30 text-rose-500 shadow-lg shadow-rose-950/40">
              <YoutubeIcon className="size-7" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold text-white">Importador Automatizado do YouTube</CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Cole a URL de uma playlist ou canal. A IA processará metadados, títulos, durações e criará a estrutura pedagógica.
              </CardDescription>
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-zinc-300">URL da Playlist ou Canal</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="https://www.youtube.com/playlist?list=PLHz_AreHm4dmSj0MHol_aoNYCSGFqvfXV"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-black/50 border-white/10 text-xs sm:text-sm font-mono text-white rounded-xl h-11"
                  required
                />
                <Button type="submit" disabled={isLoading} className="gap-2 font-bold text-xs h-11 px-6 rounded-xl shrink-0 bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 cursor-pointer">
                  <Sparkles className="size-4" />
                  {isLoading ? 'Analisando...' : 'Importar Conteúdo'}
                </Button>
              </div>
            </div>
          </form>

          {/* Quick Presets */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-xs font-semibold text-zinc-400">Playlists curadas recomendadas:</span>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((sug) => (
                <button
                  key={sug.label}
                  type="button"
                  onClick={() => setUrl(sug.url)}
                  className="rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-violet-500/30 px-3 py-1.5 text-xs text-zinc-300 transition-colors cursor-pointer"
                >
                  {sug.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="rounded-2xl border border-violet-500/30 bg-violet-950/20 p-5 text-center space-y-2 animate-pulse">
              <p className="text-xs font-bold text-violet-300">{loadingStep}</p>
              <p className="text-[11px] text-zinc-400">
                Aguarde enquanto recuperamos os metadados oficiais e estruturamos as aulas.
              </p>
            </div>
          )}
        </Card>

        {/* AI Classification & Real Video Preview */}
        {importResult && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Overview Card */}
            <Card className="border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-[#12111d] to-[#0a0910] p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-rose-600 text-white font-bold text-xs">
                    {importResult.isChannel ? 'Canal Oficial Identificado' : 'Playlist Oficial Importada'}
                  </Badge>
                  <Badge variant="secondary" className="font-bold text-xs bg-white/5 text-zinc-300">
                    {importResult.isChannel ? `${importResult.courses?.length || 0} Cursos Encontrados` : (importResult.course?.technology || 'Desenvolvimento')}
                  </Badge>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {importResult.isChannel ? importResult.channel?.name : importResult.course?.title}
                </h2>
                <p className="text-xs text-zinc-400">
                  {importResult.isChannel ? (
                    <>
                      Canal: <strong className="text-white">{importResult.channel?.name}</strong> • {importResult.courses?.length || 0} cursos • {importResult.totalVideos} aulas
                    </>
                  ) : (
                    <>
                      Canal: <strong className="text-white">{importResult.playlist?.channelTitle || importResult.course?.channelTitle}</strong> • {importResult.totalVideos} aulas • {importResult.course?.totalHours}h estimadas
                    </>
                  )}
                </p>
              </div>

              <Button
                size="lg"
                onClick={handleSaveCourse}
                className="gap-2 font-bold text-xs sm:text-sm shadow-xl shadow-purple-600/30 py-6 px-8 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white shrink-0 cursor-pointer"
              >
                <CheckCircle2 className="size-5" />
                {importResult.isChannel ? 'Integrar Todos os Cursos' : 'Integrar como Curso Oficial'}
              </Button>
            </Card>

            {/* Courses / Modules Structure */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="size-4 text-violet-400" /> Grade Curricular de Aulas Recuperadas ({importResult.lessons?.length || 0})
              </h3>

              <Card className="border-white/10 bg-[#12111d] shadow-xl rounded-3xl p-4 max-h-96 overflow-y-auto space-y-2 scrollbar-thin">
                {importResult.lessons?.map((lesson: any, i: number) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-3 text-xs gap-3 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="grid size-6 place-items-center rounded-full bg-violet-600/20 text-[10px] font-bold text-violet-400 shrink-0">
                        {i + 1}
                      </span>
                      <div className="truncate text-left">
                        <p className="font-semibold text-white truncate">{lesson.title}</p>
                        <p className="text-[11px] text-zinc-500">
                          {lesson.technology ? `${lesson.technology} • ` : ''}{lesson.durationMin || 20} min
                        </p>
                      </div>
                    </div>

                    <Badge variant="outline" className="text-[10px] border-white/10 text-zinc-400 shrink-0 font-mono">
                      ID: {lesson.videoId || lesson.id}
                    </Badge>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
