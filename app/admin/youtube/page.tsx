'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Database,
  Edit,
  ExternalLink,
  FolderGit2,
  Layers,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Tv,
  Users,
  Video,
} from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { YoutubeIcon } from '@/components/icons'
import { useAppStore } from '@/lib/store'
import type {
  ContentSource,
  Course,
  IngestionReport,
  LearningModule,
  Lesson,
  TechnologySource,
  VideoAvailabilityStatus,
  YouTubePlaylist,
} from '@/lib/types'

const INGESTION_STEPS = [
  'Conectando ao YouTube Data API v3...',
  'Identificando canal e playlists públicas...',
  'Buscando todos os vídeos com paginação completa...',
  'Processando durações e metadados oficiais...',
  'Organizando cursos e módulos sequenciais...',
  'Classificando conteúdos e tecnologias com IA...',
  'Criando catálogo pedagógico estruturado...',
  'Finalizando e integrando à biblioteca!',
]

export default function AdminYouTubePage() {
  const {
    contentSources,
    allCourses,
    allLessons,
    allModules,
    importedPlaylists,
    technologySources,
    importLogs,
    ingestFullChannelToStore,
    syncPlaylistInStore,
    updateTechnologySource,
    updatePlaylistClassification,
    validateCatalogIntegrity,
    resetEducationalCatalog,
    syncOfficialTrustedChannels,
  } = useAppStore()

  const [activeTab, setActiveTab] = useState<'channels' | 'library' | 'playlists' | 'sources' | 'validation' | 'logs'>('channels')
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [validatingPlaylistId, setValidatingPlaylistId] = useState<string | null>(null)

  // Reset & Official Sync States
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isSyncingOfficial, setIsSyncingOfficial] = useState(false)

  // Channel Ingestion State & Step Progress
  const [channelInput, setChannelInput] = useState('')
  const [isIngesting, setIsIngesting] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [ingestionReport, setIngestionReport] = useState<IngestionReport | null>(null)

  // Video Validation Tool State
  const [videoToValidate, setVideoToValidate] = useState('')
  const [isValidatingVideo, setIsValidatingVideo] = useState(false)
  const [videoValidationResult, setVideoValidationResult] = useState<{
    videoId: string
    title?: string
    authorName?: string
    status: VideoAvailabilityStatus
    youtubeExists: boolean
    embedAvailable: boolean
    message: string
    watchUrl?: string
    embedUrl?: string
  } | null>(null)

  // Playlist Batch Validation Report Modal
  const [playlistValidationReport, setPlaylistValidationReport] = useState<{
    playlistId: string
    courseTitle: string
    totalVideos: number
    availableCount: number
    embedDisabledCount: number
    removedCount: number
    invalidCount: number
    results: Array<{
      videoId: string
      status: VideoAvailabilityStatus
      youtubeExists: boolean
      embedAvailable: boolean
      title?: string
      message: string
    }>
  } | null>(null)

  // Edit Playlist Modal State
  const [editingPlaylist, setEditingPlaylist] = useState<YouTubePlaylist | null>(null)
  const [editTech, setEditTech] = useState('')
  const [editCategory, setEditCategory] = useState('')

  // Technology Source Edit State
  const [editingTechSource, setEditingTechSource] = useState<TechnologySource | null>(null)
  const [techUrl, setTechUrl] = useState('')

  // Validation Report
  const consistencyReport = validateCatalogIntegrity()

  async function handleIngestChannel(e: React.FormEvent) {
    e.preventDefault()
    if (!channelInput.trim()) {
      toast.error('Insira o @handle ou URL do canal do YouTube.')
      return
    }

    setIsIngesting(true)
    setCurrentStepIndex(0)

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < INGESTION_STEPS.length - 2 ? prev + 1 : prev))
    }, 900)

    try {
      const res = await fetch('/api/youtube/channel/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelInput }),
      })

      const data = await res.json()
      clearInterval(interval)

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao processar ingestão do canal.')
      }

      setCurrentStepIndex(INGESTION_STEPS.length - 1)

      setTimeout(() => {
        ingestFullChannelToStore({
          channel: data.channel,
          playlists: data.playlists,
          courses: data.courses,
          modules: data.modules,
          lessons: data.lessons,
          report: data.report,
        })

        setIngestionReport(data.report)
        setIsIngesting(false)
        setChannelInput('')
        toast.success(`Canal "${data.channel.name}" importado com sucesso! ${data.courses.length} cursos criados.`)
        try {
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } })
        } catch {
          // ignore
        }
      }, 600)
    } catch (err: any) {
      clearInterval(interval)
      setIsIngesting(false)
      toast.error(err.message || 'Falha na ingestão do canal.')
    }
  }

  async function handleSyncChannel(channel: ContentSource) {
    toast.info(`Sincronizando canal ${channel.name}...`)
    try {
      const res = await fetch('/api/youtube/channel/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: channel.channelId }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao sincronizar canal.')
      }

      toast.success(`Canal ${channel.name} sincronizado! ${data.playlists.length} playlists verificadas.`)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao sincronizar.')
    }
  }

  async function handleSyncPlaylist(playlistId: string) {
    setSyncingId(playlistId)
    toast.info('Consultando YouTube API para sincronização...')

    try {
      const res = await fetch('/api/youtube/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao sincronizar playlist.')
      }

      syncPlaylistInStore(playlistId, data.videos)
      setSyncingId(null)
      toast.success(`Playlist sincronizada! ${data.videos.length} vídeos verificados.`)
    } catch (err: any) {
      setSyncingId(null)
      toast.error(err.message || 'Erro ao sincronizar.')
    }
  }

  async function handleValidateSingleVideo(e: React.FormEvent) {
    e.preventDefault()
    if (!videoToValidate.trim()) return

    setIsValidatingVideo(true)
    setVideoValidationResult(null)

    try {
      const res = await fetch('/api/youtube/validate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: videoToValidate }),
      })

      const data = await res.json()
      setIsValidatingVideo(false)

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao validar vídeo.')
      }

      setVideoValidationResult(data)
      toast.success('Validação concluída!')
    } catch (err: any) {
      setIsValidatingVideo(false)
      toast.error(err.message || 'Falha ao validar vídeo.')
    }
  }

  async function handleRevalidatePlaylist(course: Course) {
    const plId = course.playlistId
    if (!plId) {
      toast.error('Este curso não possui playlistId associado.')
      return
    }

    setValidatingPlaylistId(plId)
    toast.info(`Analisando os vídeos do curso "${course.title}"...`)

    try {
      const courseLessons = allLessons.filter((l) => l.playlistId === plId || l.moduleId.includes(plId))
      const videoIds = courseLessons.map((l) => l.videoId).filter(Boolean) as string[]

      const res = await fetch('/api/youtube/validate-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId: plId, videoIds }),
      })

      const data = await res.json()
      setValidatingPlaylistId(null)

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao validar playlist.')
      }

      setPlaylistValidationReport({
        playlistId: plId,
        courseTitle: course.title,
        totalVideos: data.totalVideos,
        availableCount: data.availableCount,
        embedDisabledCount: data.embedDisabledCount,
        removedCount: data.removedCount,
        invalidCount: data.invalidCount,
        results: data.results,
      })

      toast.success(`Validação concluída: ${data.availableCount} liberados no player, ${data.embedDisabledCount} somente YouTube.`)
    } catch (err: any) {
      setValidatingPlaylistId(null)
      toast.error(err.message || 'Falha ao validar playlist.')
    }
  }

  function handleSavePlaylistEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingPlaylist) return

    updatePlaylistClassification(editingPlaylist.youtubePlaylistId, {
      technology: editTech,
      category: editCategory,
      status: 'ativo',
    })

    toast.success(`Classificação da playlist atualizada com sucesso!`)
    setEditingPlaylist(null)
  }

  function handleSaveTechSource(e: React.FormEvent) {
    e.preventDefault()
    if (!editingTechSource || !techUrl.trim()) return

    updateTechnologySource({
      ...editingTechSource,
      primaryPlaylistUrl: techUrl,
      updatedAt: new Date().toISOString(),
    })

    toast.success(`Fonte para ${editingTechSource.technology} atualizada com sucesso!`)
    setEditingTechSource(null)
    setTechUrl('')
  }

  async function handleResetCatalog() {
    setIsResetting(true)
    try {
      const res = await resetEducationalCatalog()
      setIsResetting(false)
      setIsResetModalOpen(false)
      toast.success(`Catálogo resetado com sucesso! ${res.deletedCounts.courses} cursos removidos. Perfis de usuários preservados.`)
    } catch (err: any) {
      setIsResetting(false)
      toast.error('Erro ao resetar catálogo.')
    }
  }

  async function handleSyncOfficial() {
    setIsSyncingOfficial(true)
    toast.info('Sincronizando canais e cursos oficiais com o YouTube...')
    try {
      await syncOfficialTrustedChannels()
      setIsSyncingOfficial(false)
      toast.success('Fontes oficiais (Curso em Vídeo, Rocketseat, Hora de Codar) sincronizadas com sucesso!')
      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } })
      } catch {}
    } catch (err: any) {
      setIsSyncingOfficial(false)
      toast.error('Erro ao sincronizar fontes oficiais.')
    }
  }

  return (
    <AppShell
      title="Biblioteca Central de Conteúdo & YouTube"
      subtitle="Sistema automático de ingestão de canais inteiros, catalogação pedagógica por IA e integridade semântica de cursos"
    >
      <div className="space-y-8">
        {/* Navigation & Action Bar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mr-2"
            >
              <ArrowLeft className="size-3.5" /> Painel Admin
            </Link>

            <div className="flex items-center gap-1 rounded-xl bg-muted/40 p-1 border border-border overflow-x-auto">
              <Button
                variant={activeTab === 'channels' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('channels')}
                className="text-xs font-semibold shrink-0"
              >
                Canais & Ingestão ({contentSources.length})
              </Button>
              <Button
                variant={activeTab === 'library' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('library')}
                className="text-xs font-semibold shrink-0"
              >
                Biblioteca Central ({allCourses.length})
              </Button>
              <Button
                variant={activeTab === 'playlists' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('playlists')}
                className="text-xs font-semibold shrink-0"
              >
                Playlists & Cursos
              </Button>
              <Button
                variant={activeTab === 'sources' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('sources')}
                className="text-xs font-semibold shrink-0"
              >
                Fontes Confiáveis ({technologySources.length})
              </Button>
              <Button
                variant={activeTab === 'validation' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('validation')}
                className="text-xs font-semibold shrink-0"
              >
                Diagnóstico & Validação
              </Button>
              <Button
                variant={activeTab === 'logs' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('logs')}
                className="text-xs font-semibold shrink-0"
              >
                Logs ({importLogs.length})
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncOfficial}
              disabled={isSyncingOfficial}
              className="text-xs font-bold gap-1.5 text-primary border-primary/40 hover:bg-primary/10"
            >
              <Sparkles className="size-3.5" />
              {isSyncingOfficial ? 'Sincronizando...' : 'Sincronizar Fontes Oficiais'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetModalOpen(true)}
              className="text-xs font-bold gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10"
            >
              <Trash2 className="size-3.5" />
              Resetar Catálogo
            </Button>

            <Link href="/cursos/importar">
              <Button size="sm" className="gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md">
                <YoutubeIcon className="size-4" /> Importar Playlist Única
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab 1: Channel Ingestion */}
        {activeTab === 'channels' && (
          <div className="space-y-8">
            <Card className="border-border/80 shadow-lg">
              <CardHeader className="pb-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <YoutubeIcon className="size-5" />
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold">
                      Ingestão Automática de Canal Inteiro
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Insira o @handle ou link do canal. A IA busca todas as playlists, classifica o conteúdo e estrutura os cursos automaticamente.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <form onSubmit={handleIngestChannel} className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Ex: @CursoemVideo, @rocketseat, @MatheusBattisti ou link do canal..."
                    value={channelInput}
                    onChange={(e) => setChannelInput(e.target.value)}
                    disabled={isIngesting}
                    className="text-xs sm:text-sm font-mono h-11"
                  />
                  <Button
                    type="submit"
                    disabled={isIngesting}
                    className="gap-2 bg-red-600 hover:bg-red-700 text-white font-bold shrink-0 h-11 px-6 shadow-md"
                  >
                    {isIngesting ? (
                      <>
                        <RefreshCw className="size-4 animate-spin" /> Ingerindo Canal...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" /> Ingerir Canal com IA
                      </>
                    )}
                  </Button>
                </form>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground font-semibold">Canais de Referência:</span>
                  <button
                    type="button"
                    onClick={() => setChannelInput('@CursoemVideo')}
                    className="rounded-lg border border-border/80 bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    @CursoemVideo (Guanabara)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannelInput('@rocketseat')}
                    className="rounded-lg border border-border/80 bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    @rocketseat
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannelInput('@MatheusBattisti')}
                    className="rounded-lg border border-border/80 bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    @MatheusBattisti (Hora de Codar)
                  </button>
                </div>

                {isIngesting ? (
                  <div className="rounded-2xl border border-primary/40 bg-primary/5 p-6 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-primary flex items-center gap-2">
                        <RefreshCw className="size-4 animate-spin" /> {INGESTION_STEPS[currentStepIndex]}
                      </span>
                      <span className="font-mono font-bold text-muted-foreground">
                        Etapa {currentStepIndex + 1} de {INGESTION_STEPS.length}
                      </span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-primary/20">
                      <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${((currentStepIndex + 1) / INGESTION_STEPS.length) * 100}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-muted-foreground">
                      Aguarde enquanto a YouTube Data API v3 recupera as páginas de vídeos e a IA estrutura o currículo pedagógico.
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Ingestion Report Modal Card */}
            {ingestionReport ? (
              <Card className="border-success/40 bg-success/5 p-6 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-6 text-success" />
                    <h3 className="text-lg font-bold text-foreground">
                      Relatório de Ingestão: {ingestionReport.channelName}
                    </h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIngestionReport(null)}>
                    Fechar
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="rounded-xl border border-border bg-card p-3">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Playlists Importadas</span>
                    <p className="text-xl font-black text-foreground mt-0.5">{ingestionReport.playlistsImported}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Vídeos Reais</span>
                    <p className="text-xl font-black text-foreground mt-0.5">{ingestionReport.videosImported}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Cursos Gerados</span>
                    <p className="text-xl font-black text-primary mt-0.5">{ingestionReport.coursesGenerated}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Aprovados pela IA</span>
                    <p className="text-xl font-black text-success mt-0.5">{ingestionReport.autoApprovedCount}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setIngestionReport(null)
                      setActiveTab('library')
                    }}
                    className="font-bold text-xs"
                  >
                    Ver Cursos na Biblioteca <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </Card>
            ) : null}

            {/* Registered Channels List */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-foreground">Canais Registrados na Plataforma ({contentSources.length})</h3>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {contentSources.map((cs) => (
                  <Card key={cs.id} className="border-border/80 hover:border-primary/40 transition-all p-5 space-y-3 shadow-sm flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-red-600/10 text-red-600 border-0 text-[10px] font-bold">
                          Fonte Confiável
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-bold">
                          Prioridade {cs.priority}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-foreground">{cs.name}</h4>
                        <p className="text-xs font-mono text-muted-foreground">{cs.handle || cs.channelUrl}</p>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{cs.description}</p>
                    </div>

                    <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                      <a href={cs.channelUrl} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8 px-2">
                          <ExternalLink className="size-3.5" /> YouTube
                        </Button>
                      </a>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSyncChannel(cs)}
                        className="text-xs h-8 px-3 gap-1 font-semibold"
                      >
                        <RefreshCw className="size-3" /> Sincronizar Canal
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Dynamic Central Content Library */}
        {activeTab === 'library' && (
          <div className="space-y-8">
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 space-y-1 shadow-sm">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-primary-foreground font-bold">Biblioteca Central</Badge>
                <span className="text-xs text-muted-foreground font-semibold">Alimentada por YouTube API</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Catálogo Estruturado de Formações</h2>
              <p className="text-xs text-muted-foreground">
                Cursos agrupados por áreas de conhecimento, alimentados diretamente a partir das playlists oficiais.
              </p>
            </div>

            {/* Courses grouped by Category */}
            {['Fundamentos da Programação', 'Web & Front-end', 'Front-end Moderno', 'Back-end', 'Backend & Automação', 'Ferramentas'].map((cat) => {
              const catCourses = allCourses.filter((c) => c.category === cat || (cat === 'Web & Front-end' && c.category.includes('Web')))
              if (catCourses.length === 0) return null

              return (
                <div key={cat} className="space-y-4">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Layers className="size-4 text-primary" /> {cat} ({catCourses.length})
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {catCourses.map((course) => (
                      <Card key={course.id} className="border-border/80 p-5 space-y-3 flex flex-col justify-between shadow-sm">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-[10px] font-bold">
                              {course.technology}
                            </Badge>
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px] font-bold gap-1">
                              🟢 Disponível
                            </Badge>
                          </div>

                          <h4 className="text-sm font-bold text-foreground">{course.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
                          <p className="text-[11px] text-muted-foreground">Fonte: <strong>{course.channelTitle}</strong></p>
                        </div>

                        <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs gap-2">
                          <span className="text-muted-foreground font-semibold">{course.lessonsCount} aulas • {course.totalHours}h</span>

                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevalidatePlaylist(course)}
                              disabled={validatingPlaylistId === course.playlistId}
                              className="h-7 px-2 text-[11px] font-semibold gap-1"
                            >
                              {validatingPlaylistId === course.playlistId ? (
                                <RefreshCw className="size-3 animate-spin" />
                              ) : (
                                <ShieldCheck className="size-3 text-primary" />
                              )}
                              Validar Vídeos
                            </Button>

                            <Link href={`/courses/${course.slug}`}>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs font-semibold gap-1">
                                Ver <ArrowRight className="size-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Tab 3: Playlists & Classification Review */}
        {activeTab === 'playlists' && (
          <div className="space-y-6">
            <Card className="border-border/80 shadow-md">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-base font-bold">Revisão e Classificação de Playlists</CardTitle>
                <CardDescription className="text-xs">
                  Valide a tecnologia e nível sugeridos pela IA para cada playlist importada.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <div className="divide-y divide-border/60">
                  {allCourses.map((course) => (
                    <div key={course.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:bg-muted/20">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-foreground font-bold text-sm">{course.title}</strong>
                          <Badge variant="secondary" className="text-[10px]">{course.technology}</Badge>
                          <Badge className="bg-success/15 text-success border-0 text-[10px]">Aprovado</Badge>
                        </div>
                        <p className="text-muted-foreground">Canal: {course.channelTitle} • {course.lessonsCount} aulas sequenciais</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevalidatePlaylist(course)}
                          disabled={validatingPlaylistId === course.playlistId}
                          className="h-8 text-xs gap-1.5"
                        >
                          <ShieldCheck className="size-3.5 text-primary" /> Validar Vídeos
                        </Button>

                        {course.playlistId ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSyncPlaylist(course.playlistId!)}
                            disabled={syncingId === course.playlistId}
                            className="h-8 text-xs gap-1.5"
                          >
                            <RefreshCw className={`size-3 ${syncingId === course.playlistId ? 'animate-spin' : ''}`} /> Sincronizar
                          </Button>
                        ) : null}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingPlaylist({
                              id: course.id,
                              youtubePlaylistId: course.playlistId || course.id,
                              title: course.title,
                              description: course.description,
                              thumbnailUrl: course.thumbnailUrl,
                              youtubeUrl: course.playlistUrl || '',
                              itemCount: course.lessonsCount,
                              channelTitle: course.channelTitle || '',
                              category: course.category,
                              technology: course.technology,
                              level: course.level,
                              status: 'ativo',
                              classificationConfidence: 100,
                              createdAt: course.createdAt,
                              updatedAt: course.updatedAt,
                            })
                            setEditTech(course.technology)
                            setEditCategory(course.category)
                          }}
                          className="h-8 text-xs gap-1.5"
                        >
                          <Edit className="size-3" /> Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Edit Playlist Classification Modal */}
            {editingPlaylist ? (
              <Card className="border-primary/40 bg-primary/5 p-6 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground">
                    Editar Classificação: {editingPlaylist.title}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setEditingPlaylist(null)}>
                    Cancelar
                  </Button>
                </div>

                <form onSubmit={handleSavePlaylistEdit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Tecnologia</label>
                      <Input
                        value={editTech}
                        onChange={(e) => setEditTech(e.target.value)}
                        className="text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Categoria</label>
                      <Input
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setEditingPlaylist(null)}>
                      Cancelar
                    </Button>
                    <Button type="submit" size="sm" className="font-bold">
                      Salvar Classificação
                    </Button>
                  </div>
                </form>
              </Card>
            ) : null}
          </div>
        )}

        {/* Tab 4: Technology Sources */}
        {activeTab === 'sources' && (
          <div className="space-y-6">
            <Card className="border-border/80 shadow-lg">
              <CardHeader className="pb-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-primary" />
                  <div>
                    <CardTitle className="text-base font-bold">Mapeamento de Fontes Confiáveis por Tecnologia</CardTitle>
                    <CardDescription className="text-xs">
                      A IA consulta prioritariamente essas playlists ao gerar trilhas personalizadas para os alunos.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="divide-y divide-border/60">
                  {technologySources.map((ts) => (
                    <div
                      key={ts.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground">{ts.technology}</h4>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {ts.primaryPlaylistId}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Canal de Origem: <strong>{ts.channelTitle}</strong></p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a href={ts.primaryPlaylistUrl} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8">
                            <ExternalLink className="size-3" /> Abrir Playlist
                          </Button>
                        </a>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditingTechSource(ts)
                            setTechUrl(ts.primaryPlaylistUrl)
                          }}
                          className="text-xs h-8 gap-1.5"
                        >
                          <Edit className="size-3" /> Alterar Fonte
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Edit Technology Source Modal */}
            {editingTechSource ? (
              <Card className="border-primary/40 bg-primary/5 p-6 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground">
                    Alterar Fonte Oficial: {editingTechSource.technology}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setEditingTechSource(null)}>
                    Cancelar
                  </Button>
                </div>

                <form onSubmit={handleSaveTechSource} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">URL da Nova Playlist do YouTube</label>
                    <Input
                      placeholder="https://www.youtube.com/playlist?list=PL..."
                      value={techUrl}
                      onChange={(e) => setTechUrl(e.target.value)}
                      className="text-xs font-mono"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setEditingTechSource(null)}>
                      Cancelar
                    </Button>
                    <Button type="submit" size="sm" className="font-bold">
                      Atualizar Fonte Oficial
                    </Button>
                  </div>
                </form>
              </Card>
            ) : null}
          </div>
        )}

        {/* Tab 5: Diagnostic & Video Availability Validation */}
        {activeTab === 'validation' && (
          <div className="space-y-8">
            {/* Single Video Validation Tool */}
            <Card className="border-border/80 shadow-md">
              <CardHeader className="pb-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Video className="size-5 text-primary" />
                  <div>
                    <CardTitle className="text-base font-bold">Diagnóstico Unitário de Vídeo</CardTitle>
                    <CardDescription className="text-xs">
                      Teste qualquer URL ou ID de vídeo do YouTube para diagnosticar permissões de embed, status e canonical IDs.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <form onSubmit={handleValidateSingleVideo} className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Ex: 8mei6XYRhR4 ou https://www.youtube.com/watch?v=8mei6XYRhR4..."
                    value={videoToValidate}
                    onChange={(e) => setVideoToValidate(e.target.value)}
                    disabled={isValidatingVideo}
                    className="text-xs font-mono h-10"
                  />
                  <Button
                    type="submit"
                    disabled={isValidatingVideo}
                    className="font-bold text-xs shrink-0 h-10 px-5 gap-1.5"
                  >
                    {isValidatingVideo ? (
                      <RefreshCw className="size-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="size-3.5" />
                    )}
                    Validar Vídeo
                  </Button>
                </form>

                {videoValidationResult ? (
                  <div className="rounded-2xl border border-border p-4 bg-muted/20 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {videoValidationResult.status === 'available' ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600 border-0 font-bold text-xs gap-1">
                            🟢 Disponível no Player
                          </Badge>
                        ) : videoValidationResult.status === 'embed_disabled' ? (
                          <Badge className="bg-amber-500/15 text-amber-600 border-0 font-bold text-xs gap-1">
                            🟡 Somente YouTube (Embed Restrito)
                          </Badge>
                        ) : (
                          <Badge className="bg-destructive/15 text-destructive border-0 font-bold text-xs gap-1">
                            🔴 Indisponível / Removido
                          </Badge>
                        )}
                        <span className="font-mono text-xs font-bold text-foreground">
                          ID: {videoValidationResult.videoId}
                        </span>
                      </div>

                      {videoValidationResult.watchUrl ? (
                        <a href={videoValidationResult.watchUrl} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="sm" className="text-xs h-7 gap-1">
                            <ExternalLink className="size-3" /> YouTube ↗
                          </Button>
                        </a>
                      ) : null}
                    </div>

                    <div className="text-xs space-y-1 text-muted-foreground">
                      {videoValidationResult.title ? (
                        <p><strong>Título:</strong> {videoValidationResult.title}</p>
                      ) : null}
                      {videoValidationResult.authorName ? (
                        <p><strong>Canal:</strong> {videoValidationResult.authorName}</p>
                      ) : null}
                      <p><strong>Diagnóstico:</strong> {videoValidationResult.message}</p>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Semantic Consistency Overview */}
            <Card className="border-border/80 shadow-md">
              <CardHeader className="pb-4 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {consistencyReport.isValid ? (
                      <CheckCircle2 className="size-5 text-success" />
                    ) : (
                      <AlertTriangle className="size-5 text-amber-500" />
                    )}
                    <div>
                      <CardTitle className="text-base font-bold">Relatório de Integridade Semântica</CardTitle>
                      <CardDescription className="text-xs">
                        {consistencyReport.totalCourses} cursos, {consistencyReport.totalModules} módulos e {consistencyReport.totalLessons} aulas auditadas
                      </CardDescription>
                    </div>
                  </div>

                  <Badge variant={consistencyReport.isValid ? 'secondary' : 'destructive'} className="text-xs font-bold">
                    {consistencyReport.isValid ? '100% Consistente' : `${consistencyReport.issues.length} Alertas`}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {consistencyReport.issues.length === 0 ? (
                  <div className="rounded-2xl border border-success/30 bg-success/5 p-6 text-center space-y-2">
                    <CheckCircle2 className="size-8 text-success mx-auto" />
                    <h4 className="text-sm font-bold text-foreground">Catálogo Perfeitamente Validado</h4>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Zero contaminação detectada: nenhum vídeo de Python em lógica, todos os IDs normalizados e ordenação estrita de 1 a N respeitada.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {consistencyReport.issues.map((iss, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-3 text-xs"
                      >
                        <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-foreground">{iss.message}</p>
                          <p className="text-muted-foreground mt-0.5">Tipo: {iss.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 6: Import & Sync Logs */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <Card className="border-border/80 shadow-md">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-base font-bold">Histórico de Ingestão e Sincronizações</CardTitle>
                <CardDescription className="text-xs">
                  Registro detalhado de todas as operações realizadas com YouTube Data API.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                {importLogs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    Nenhum log registrado ainda. Realize a importação de uma playlist ou canal para visualizar aqui.
                  </div>
                ) : (
                  <div className="divide-y divide-border/60">
                    {importLogs.map((log) => (
                      <div key={log.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <strong className="font-bold text-foreground">{log.playlistTitle}</strong>
                            <Badge className="bg-success/15 text-success border-0 text-[10px]">Sucesso</Badge>
                          </div>
                          <p className="text-muted-foreground">{log.message}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(log.createdAt).toLocaleTimeString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Playlist Batch Validation Report Modal */}
        {playlistValidationReport ? (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full border-border/80 shadow-2xl bg-card animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-5 text-primary" />
                    <CardTitle className="text-base font-bold">
                      Validação de Playlist: {playlistValidationReport.courseTitle}
                    </CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setPlaylistValidationReport(null)}>
                    ✕
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  {playlistValidationReport.totalVideos} vídeos analisados via diagnóstico de reprodução e permissões.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                    <span className="text-[10px] uppercase font-bold text-emerald-600">Disponíveis no Player</span>
                    <p className="text-xl font-black text-emerald-600 mt-0.5">{playlistValidationReport.availableCount}</p>
                  </div>

                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                    <span className="text-[10px] uppercase font-bold text-amber-600">Somente YouTube</span>
                    <p className="text-xl font-black text-amber-600 mt-0.5">{playlistValidationReport.embedDisabledCount}</p>
                  </div>

                  <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
                    <span className="text-[10px] uppercase font-bold text-destructive">Removidos / Privados</span>
                    <p className="text-xl font-black text-destructive mt-0.5">{playlistValidationReport.removedCount}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Aulas Auditadas</h4>
                  <div className="divide-y divide-border/60 max-h-60 overflow-y-auto rounded-xl border border-border">
                    {playlistValidationReport.results.map((r, i) => (
                      <div key={i} className="p-2.5 flex items-center justify-between text-xs hover:bg-muted/20">
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono text-muted-foreground text-[10px] w-6">{i + 1}.</span>
                          <span className="truncate">{r.title || r.videoId}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {r.status === 'available' ? (
                            <Badge className="bg-emerald-500/15 text-emerald-600 border-0 text-[10px]">🟢 Player</Badge>
                          ) : r.status === 'embed_disabled' ? (
                            <Badge className="bg-amber-500/15 text-amber-600 border-0 text-[10px]">🟡 YouTube</Badge>
                          ) : (
                            <Badge className="bg-destructive/15 text-destructive border-0 text-[10px]">🔴 Removido</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>

              <div className="p-4 border-t border-border/60 flex justify-end">
                <Button size="sm" onClick={() => setPlaylistValidationReport(null)} className="font-bold text-xs">
                  Fechar Relatório
                </Button>
              </div>
            </Card>
          </div>
        ) : null}

        {/* Modal: Confirm Reset Educational Catalog */}
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
            <Card className="w-full max-w-lg border-destructive/40 shadow-2xl bg-card">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-destructive/15 flex items-center justify-center text-destructive">
                    <AlertTriangle className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-destructive">
                      Resetar Catálogo Educacional
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Esta ação apaga todo o catálogo e prepara a base para reconstrução real.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-destructive">
                    <ShieldAlert className="size-4" /> Relatório de Itens a Serem Removidos:
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="bg-background/60 p-2.5 rounded-xl border border-border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Cursos</span>
                      <strong className="text-base font-black text-foreground">{allCourses.length}</strong>
                    </div>
                    <div className="bg-background/60 p-2.5 rounded-xl border border-border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Módulos</span>
                      <strong className="text-base font-black text-foreground">{allModules.length}</strong>
                    </div>
                    <div className="bg-background/60 p-2.5 rounded-xl border border-border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Aulas Reais</span>
                      <strong className="text-base font-black text-foreground">{allLessons.length}</strong>
                    </div>
                    <div className="bg-background/60 p-2.5 rounded-xl border border-border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Fontes/Playlists</span>
                      <strong className="text-base font-black text-foreground">{contentSources.length + importedPlaylists.length}</strong>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                    <ShieldCheck className="size-4" /> Garantia de Segurança de Usuários:
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Usuários cadastrados, contas de autenticação, perfis pessoais e configurações dos alunos <strong>NÃO SERÃO APAGADOS</strong>.
                  </p>
                </div>
              </CardContent>

              <div className="p-4 border-t border-border/60 flex items-center justify-end gap-2 bg-muted/20">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isResetting}
                  onClick={() => setIsResetModalOpen(false)}
                  className="text-xs font-semibold"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  disabled={isResetting}
                  onClick={handleResetCatalog}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold text-xs gap-1.5"
                >
                  <Trash2 className="size-3.5" />
                  {isResetting ? 'Resetando...' : 'Confirmar Reset Total do Catálogo'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  )
}
