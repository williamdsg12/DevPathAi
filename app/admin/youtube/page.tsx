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
  X,
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
  CourseLevel,
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

const CATEGORY_OPTIONS = [
  'Fundamentos da Programação',
  'Web & Front-end',
  'Front-end Moderno',
  'Back-end & APIs',
  'Full Stack',
  'Mobile (Flutter / React Native)',
  'Data Science & Analytics',
  'Inteligência Artificial & GenAI',
  'DevOps & CI/CD',
  'Cloud Computing (AWS / GCP / Azure)',
  'Banco de Dados (SQL & NoSQL)',
  'Cybersecurity & Segurança',
  'Engenharia de Software & Arquitetura',
  'Quality Assurance & Testes (QA)',
  'Ferramentas & Git',
]

const LEVEL_OPTIONS: Array<{ value: CourseLevel; label: string }> = [
  { value: 'iniciante-absoluto', label: 'Iniciante Absoluto' },
  { value: 'iniciante', label: 'Iniciante' },
  { value: 'basico', label: 'Básico' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
]

const STATUS_OPTIONS = [
  { value: 'ativo', label: 'Ativo (Disponível para Alunos)' },
  { value: 'em_revisao', label: 'Em Revisão Pedagógica' },
  { value: 'inativo', label: 'Inativo / Oculto' },
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
    importCourseFromPlaylist,
    syncPlaylistInStore,
    updateTechnologySource,
    updatePlaylistClassification,
    addCustomCourse,
    updateCourse,
    deleteCourse,
    deletePlaylist,
    validateCatalogIntegrity,
    resetEducationalCatalog,
    syncOfficialTrustedChannels,
    profile,
  } = useAppStore()

  const [activeTab, setActiveTab] = useState<'channels' | 'library' | 'playlists' | 'sources' | 'validation' | 'logs'>('library')
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [validatingPlaylistId, setValidatingPlaylistId] = useState<string | null>(null)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all')

  // Edit Course / Playlist Modal State
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editTechnology, setEditTechnology] = useState('')
  const [editLevel, setEditLevel] = useState<CourseLevel>('iniciante')
  const [editStatus, setEditStatus] = useState<'ativo' | 'em_revisao' | 'inativo'>('ativo')
  const [editThumbnailUrl, setEditThumbnailUrl] = useState('')
  const [editChannelTitle, setEditChannelTitle] = useState('')
  const [editTotalHours, setEditTotalHours] = useState<number>(1)

  // Delete Course Confirmation State
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Add Course Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addMode, setAddMode] = useState<'youtube' | 'manual'>('youtube')
  const [importPlaylistUrl, setImportPlaylistUrl] = useState('')
  const [isImportingPlaylist, setIsImportingPlaylist] = useState(false)

  // Manual course form states
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newCategory, setNewCategory] = useState('Fundamentos da Programação')
  const [newTechnology, setNewTechnology] = useState('Lógica & Algoritmos')
  const [newLevel, setNewLevel] = useState<CourseLevel>('iniciante')
  const [newChannel, setNewChannel] = useState('DevPath AI')
  const [newThumbnailUrl, setNewThumbnailUrl] = useState('')
  const [newTotalHours, setNewTotalHours] = useState(10)
  const [newLessonCount, setNewLessonCount] = useState(10)

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

  // Technology Source Edit State
  const [editingTechSource, setEditingTechSource] = useState<TechnologySource | null>(null)
  const [techUrl, setTechUrl] = useState('')

  // Validation Report
  const consistencyReport = validateCatalogIntegrity()

  // Filtered courses for library and playlists view
  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch =
      searchQuery === '' ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.technology.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.channelTitle && course.channelTitle.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory =
      selectedCategoryFilter === 'all' ||
      course.category === selectedCategoryFilter ||
      (selectedCategoryFilter === 'Web & Front-end' && course.category.includes('Web'))

    return matchesSearch && matchesCategory
  })

  // Open Edit Modal
  function handleOpenEditCourse(course: Course) {
    setEditingCourse(course)
    setEditTitle(course.title)
    setEditDescription(course.description || '')
    setEditCategory(course.category || 'Fundamentos da Programação')
    setEditTechnology(course.technology || 'Geral')
    setEditLevel(course.level || 'iniciante')
    setEditStatus((course.status as any) || 'ativo')
    setEditThumbnailUrl(course.thumbnailUrl || '')
    setEditChannelTitle(course.channelTitle || '')
    setEditTotalHours(course.totalHours || 1)
  }

  // Save Edit Course
  function handleSaveCourseEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingCourse) return

    updateCourse(editingCourse.id, {
      title: editTitle,
      description: editDescription,
      category: editCategory,
      technology: editTechnology,
      level: editLevel,
      status: editStatus,
      thumbnailUrl: editThumbnailUrl || editingCourse.thumbnailUrl,
      channelTitle: editChannelTitle,
      totalHours: Number(editTotalHours) || 1,
    })

    if (editingCourse.playlistId) {
      updatePlaylistClassification(editingCourse.playlistId, {
        title: editTitle,
        category: editCategory,
        technology: editTechnology,
        level: editLevel,
        status: editStatus,
      })
    }

    toast.success(`Curso "${editTitle}" atualizado com sucesso!`)
    setEditingCourse(null)
  }

  // Open Delete Confirmation
  function handleOpenDeleteCourse(course: Course) {
    setDeletingCourse(course)
  }

  // Confirm Delete Course
  function handleConfirmDeleteCourse() {
    if (!deletingCourse) return
    setIsDeleting(true)

    try {
      deleteCourse(deletingCourse.id)
      if (deletingCourse.playlistId) {
        deletePlaylist(deletingCourse.playlistId)
      }
      toast.success(`Curso "${deletingCourse.title}" e seus módulos foram excluídos com sucesso.`)
      setDeletingCourse(null)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir curso.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Import New Playlist Submit
  async function handleImportPlaylistSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!importPlaylistUrl.trim()) {
      toast.error('Insira o link ou ID da playlist do YouTube.')
      return
    }

    setIsImportingPlaylist(true)
    toast.info('Buscando playlist e vídeos na API do YouTube...')

    try {
      const res = await fetch('/api/youtube/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': profile?.email || 'williamdev36@gmail.com',
          'x-user-role': profile?.role || 'SUPER_ADMIN',
          'x-admin-email': 'williamdev36@gmail.com',
        },
        body: JSON.stringify({ playlistUrl: importPlaylistUrl }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao importar playlist.')
      }

      if (data.isChannel && data.channel) {
        ingestFullChannelToStore({
          channel: data.channel,
          playlists: data.playlists,
          courses: data.courses,
          modules: data.modules,
          lessons: data.lessons,
          report: data.report,
        })
        toast.success(`Canal "${data.channel.name}" importado com ${data.courses.length} cursos e ${data.lessons.length} aulas!`)
      } else if (data.course) {
        importCourseFromPlaylist({
          course: data.course,
          modules: data.modules,
          lessons: data.lessons,
          playlist: data.playlist,
        })
        toast.success(`Curso "${data.course.title}" importado com sucesso com ${data.lessons.length} aulas!`)
      }

      setIsAddModalOpen(false)
      setImportPlaylistUrl('')
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } })
      setActiveTab('library')
    } catch (err: any) {
      toast.error(err.message || 'Erro na importação da playlist.')
    } finally {
      setIsImportingPlaylist(false)
    }
  }

  // Create Manual Course Submit
  function handleCreateManualCourseSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) {
      toast.error('O título do curso é obrigatório.')
      return
    }

    const courseId = `crs-manual-${Date.now()}`
    const moduleId = `mod-manual-${Date.now()}`
    const slug = newTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const newCourse: Course = {
      id: courseId,
      title: newTitle,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      description: newDescription || `Formação completa em ${newTechnology}.`,
      level: newLevel,
      technology: newTechnology,
      category: newCategory,
      thumbnailUrl: newThumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
      status: 'ativo',
      channelTitle: newChannel,
      modulesCount: 1,
      lessonsCount: Number(newLessonCount) || 1,
      totalHours: Number(newTotalHours) || 1,
      prerequisites: ['Fundamentos de Computação'],
      skills: [newTechnology, newCategory, 'Boas Práticas'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const newModule: LearningModule = {
      id: moduleId,
      courseId: courseId,
      title: `${newTitle} — Módulo Principal`,
      description: newDescription || `Conteúdo estruturado de ${newTechnology}.`,
      technology: newTechnology,
      order: 1,
      estimatedHours: Number(newTotalHours) || 1,
      phase: newCategory,
      lessonIds: [],
      skills: [newTechnology, newCategory],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Generate initial structured lesson shells
    const initialLessons: Lesson[] = Array.from({ length: Number(newLessonCount) || 1 }, (_, i) => ({
      id: `l-${courseId}-${i + 1}`,
      moduleId: moduleId,
      order: i + 1,
      title: `Aula ${i + 1}: Introdução a ${newTechnology} - Parte ${i + 1}`,
      type: 'video',
      durationMin: Math.max(10, Math.round((Number(newTotalHours) * 60) / Number(newLessonCount))),
      description: `Aula ${i + 1} do curso ${newTitle}.`,
      sourceType: 'youtube',
      availabilityStatus: 'available',
      youtubeExists: true,
      embedAvailable: true,
      source: newChannel,
      technology: newTechnology,
      topic: `${newTechnology} - Aula ${i + 1}`,
      thumbnailUrl: newCourse.thumbnailUrl,
      isUnavailable: false,
    }))

    newModule.lessonIds = initialLessons.map((l) => l.id)

    addCustomCourse(newCourse, [newModule], initialLessons)

    setIsAddModalOpen(false)
    setNewTitle('')
    setNewDescription('')
    setNewThumbnailUrl('')
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } })
    toast.success(`Curso "${newTitle}" criado com sucesso!`)
    setActiveTab('library')
  }

  // Handle Channel Ingestion
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
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
        toast.success(`Canal ${data.channel.name} ingerido! ${data.courses.length} cursos e ${data.lessons.length} aulas integradas.`)
      }, 600)
    } catch (err: any) {
      clearInterval(interval)
      setIsIngesting(false)
      toast.error(err.message || 'Falha ao ingerir canal.')
    }
  }

  // Handle Sync Single Playlist
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

      const videoList = Array.isArray(data.videos) ? data.videos : []
      syncPlaylistInStore(playlistId, videoList)
      setSyncingId(null)
      toast.success(`Playlist sincronizada! ${videoList.length} vídeos verificados.`)
    } catch (err: any) {
      setSyncingId(null)
      toast.error(err.message || 'Erro ao sincronizar.')
    }
  }

  // Handle Revalidate Playlist Videos
  async function handleRevalidatePlaylist(course: Course) {
    const plId = course.playlistId
    if (!plId) {
      toast.error('Este curso não possui playlistId associado.')
      return
    }

    setValidatingPlaylistId(plId)
    toast.info(`Analisando os vídeos do curso "${course.title}"...`)

    try {
      const res = await fetch('/api/youtube/validate-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId: plId }),
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

      toast.success('Validação de integridade concluída!')
    } catch (err: any) {
      setValidatingPlaylistId(null)
      toast.error(err.message || 'Erro ao validar vídeos da playlist.')
    }
  }

  // Handle Validate Single Video
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

  // Handle Sync Channel
  async function handleSyncChannel(channel: ContentSource) {
    toast.info(`Sincronizando canal ${channel.name}...`)
    try {
      const res = await fetch('/api/youtube/channel/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: channel.channelId || channel.id }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao sincronizar canal.')
      }

      if (data.courses && data.courses.length > 0) {
        ingestFullChannelToStore({
          channel: data.channel,
          playlists: data.playlists,
          courses: data.courses,
          modules: data.modules,
          lessons: data.lessons,
          report: data.report,
        })
      }

      toast.success(`Canal ${channel.name} sincronizado com sucesso! ${data.courses?.length || 0} cursos verificados.`)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao sincronizar.')
    }
  }

  // Handle Reprocess Single Failed Playlist
  async function handleReprocessFailedPlaylist(playlistId: string) {
    toast.info(`Reprocessando playlist ${playlistId}...`)
    try {
      const res = await fetch('/api/youtube/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao reprocessar playlist.')
      }

      if (data.course) {
        importCourseFromPlaylist({
          course: data.course,
          modules: data.modules,
          lessons: data.lessons,
          playlist: data.playlist,
        })
        toast.success(`Playlist reprocessada com sucesso! Curso "${data.course.title}" catalogado com ${data.lessons.length} aulas.`)

        if (ingestionReport) {
          setIngestionReport({
            ...ingestionReport,
            coursesGenerated: (ingestionReport.coursesGenerated || 0) + 1,
            playlistsImported: (ingestionReport.playlistsImported || 0) + 1,
            playlistsFailed: Math.max(0, (ingestionReport.playlistsFailed || 1) - 1),
            failedPlaylistsList: (ingestionReport.failedPlaylistsList || []).filter(
              (f) => f.playlistId !== playlistId,
            ),
          })
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Falha ao reprocessar playlist.')
    }
  }

  // Handle Save Tech Source
  async function handleSaveTechSource(e: React.FormEvent) {
    e.preventDefault()
    if (!editingTechSource || !techUrl.trim()) return

    try {
      const plId = techUrl.includes('list=') ? techUrl.split('list=')[1]?.split('&')[0] : techUrl
      updateTechnologySource({
        ...editingTechSource,
        primaryPlaylistUrl: techUrl,
        primaryPlaylistId: plId || editingTechSource.primaryPlaylistId,
        updatedAt: new Date().toISOString(),
      })

      toast.success(`Fonte oficial de ${editingTechSource.technology} atualizada!`)
      setEditingTechSource(null)
      setTechUrl('')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar fonte oficial.')
    }
  }

  // Handle Reset Catalog Safely
  async function handleResetCatalog() {
    setIsResetting(true)
    try {
      const res = await resetEducationalCatalog()
      setIsResetting(false)
      setIsResetModalOpen(false)

      if (res.success) {
        toast.success(
          `Catálogo limpo com sucesso! ${res.deletedCounts.courses} cursos e ${res.deletedCounts.lessons} aulas foram resetados. Seus dados de usuários foram preservados.`,
        )
      } else {
        toast.error('Erro ao resetar catálogo.')
      }
    } catch (err: any) {
      setIsResetting(false)
      toast.error(err.message || 'Falha ao executar reset.')
    }
  }

  // Handle Sync Official Trusted Channels
  async function handleSyncOfficial() {
    setIsSyncingOfficial(true)
    toast.info('Sincronizando canais oficiais confiáveis via YouTube API...')

    try {
      const ok = await syncOfficialTrustedChannels()
      setIsSyncingOfficial(false)
      if (ok) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } })
        toast.success('Fontes oficiais sincronizadas com sucesso!')
      } else {
        toast.error('Não foi possível sincronizar algumas fontes.')
      }
    } catch (err: any) {
      setIsSyncingOfficial(false)
      toast.error(err.message || 'Erro ao sincronizar fontes oficiais.')
    }
  }

  return (
    <AppShell
      title="Biblioteca Central de Conteúdo & YouTube"
      subtitle="Gerenciamento completo do catálogo educacional, ingestão automática, edição e exclusão de cursos e playlists"
    >
      <div className="space-y-8">
        {/* Top Navigation & Action Bar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mr-2 shrink-0"
            >
              <ArrowLeft className="size-3.5" /> Painel Admin
            </Link>

            <div className="flex items-center gap-1 rounded-xl bg-muted/40 p-1 border border-border overflow-x-auto">
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
                Playlists & Cursos ({allCourses.length})
              </Button>
              <Button
                variant={activeTab === 'channels' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('channels')}
                className="text-xs font-semibold shrink-0"
              >
                Canais & Ingestão ({contentSources.length})
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
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md"
            >
              <Plus className="size-4" /> Adicionar Curso / Playlist
            </Button>

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
          </div>
        </div>

        {/* Tab 1: Central Library */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            {/* Header banner */}
            <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 space-y-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground font-bold">Biblioteca Central</Badge>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {allCourses.length} cursos cadastrados • {allLessons.length} aulas reais no banco
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Catálogo Estruturado de Formações</h2>
                <p className="text-xs text-muted-foreground">
                  Gerencie todo o ecossistema de cursos: edite metadados, valide integridade ou remova formações com segurança.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setIsAddModalOpen(true)}
                  className="font-bold text-xs gap-1.5 bg-primary text-primary-foreground"
                >
                  <Plus className="size-3.5" /> Novo Curso
                </Button>
              </div>
            </div>

            {/* Search & Category Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por curso, tecnologia, categoria ou canal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs h-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="h-10 px-3 rounded-md border border-input bg-background text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="all">Todas as Áreas ({allCourses.length})</option>
                  {CATEGORY_OPTIONS.map((cat) => {
                    const count = allCourses.filter((c) => c.category === cat || (cat === 'Web & Front-end' && c.category.includes('Web'))).length
                    return (
                      <option key={cat} value={cat}>
                        {cat} ({count})
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>

            {/* Empty state */}
            {filteredCourses.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-2 space-y-4">
                <div className="size-12 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                  <BookOpen className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground">Nenhum curso encontrado</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {searchQuery || selectedCategoryFilter !== 'all'
                      ? 'Nenhum curso corresponde aos filtros de busca atuais.'
                      : 'O catálogo está vazio. Adicione cursos manualmente ou importe de playlists do YouTube.'}
                  </p>
                </div>
                <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="font-bold text-xs gap-1.5">
                  <Plus className="size-3.5" /> Adicionar Primeiro Curso
                </Button>
              </Card>
            ) : (
              /* Grouped or Grid Courses List */
              <div className="space-y-8">
                {CATEGORY_OPTIONS.map((cat) => {
                  const catCourses = filteredCourses.filter(
                    (c) => c.category === cat || (cat === 'Web & Front-end' && c.category.includes('Web')),
                  )
                  if (catCourses.length === 0) return null

                  return (
                    <div key={cat} className="space-y-3">
                      <div className="flex items-center justify-between border-b border-border/60 pb-2">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <Layers className="size-4 text-primary" /> {cat} ({catCourses.length})
                        </h3>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {catCourses.map((course) => (
                          <Card
                            key={course.id}
                            className="border-border/80 hover:border-primary/40 transition-all p-5 space-y-3 flex flex-col justify-between shadow-sm group"
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <Badge variant="secondary" className="text-[10px] font-bold truncate">
                                  {course.technology}
                                </Badge>
                                <Badge
                                  className={
                                    course.status === 'ativo'
                                      ? 'bg-emerald-500/10 text-emerald-600 border-0 text-[10px] font-bold'
                                      : course.status === 'em_revisao'
                                      ? 'bg-amber-500/10 text-amber-600 border-0 text-[10px] font-bold'
                                      : 'bg-muted text-muted-foreground border-0 text-[10px] font-bold'
                                  }
                                >
                                  {course.status === 'ativo' ? '🟢 Ativo' : course.status === 'em_revisao' ? '🟡 Revisão' : '⚪ Inativo'}
                                </Badge>
                              </div>

                              <h4 className="text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                {course.title}
                              </h4>
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {course.description || 'Sem descrição cadastrada.'}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                Canal: <strong>{course.channelTitle || 'DevPath AI'}</strong>
                              </p>
                            </div>

                            <div className="pt-3 border-t border-border/60 space-y-2.5">
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                                <span>{course.lessonsCount} aulas sequenciais</span>
                                <span>{course.totalHours}h de duração</span>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center justify-between gap-1.5 pt-1">
                                <div className="flex items-center gap-1">
                                  {course.playlistId ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRevalidatePlaylist(course)}
                                      disabled={validatingPlaylistId === course.playlistId}
                                      className="h-7 px-2 text-[11px] font-semibold gap-1"
                                      title="Validar se todos os vídeos estão disponíveis"
                                    >
                                      {validatingPlaylistId === course.playlistId ? (
                                        <RefreshCw className="size-3 animate-spin" />
                                      ) : (
                                        <ShieldCheck className="size-3 text-primary" />
                                      )}
                                      Validar
                                    </Button>
                                  ) : null}

                                  {course.playlistId ? (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleSyncPlaylist(course.playlistId!)}
                                      disabled={syncingId === course.playlistId}
                                      className="h-7 px-2 text-[11px] font-semibold gap-1"
                                      title="Sincronizar vídeos com YouTube"
                                    >
                                      <RefreshCw className={`size-3 ${syncingId === course.playlistId ? 'animate-spin' : ''}`} />
                                    </Button>
                                  ) : null}
                                </div>

                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleOpenEditCourse(course)}
                                    className="h-7 px-2.5 text-[11px] font-bold gap-1 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                                  >
                                    <Edit className="size-3" /> Editar
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleOpenDeleteCourse(course)}
                                    className="h-7 px-2 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    title="Excluir curso"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>

                                  <Link href={`/courses/${course.slug}`}>
                                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                                      <ArrowRight className="size-3" />
                                    </Button>
                                  </Link>
                                </div>
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
          </div>
        )}

        {/* Tab 2: Playlists & Classification Review */}
        {activeTab === 'playlists' && (
          <div className="space-y-6">
            <Card className="border-border/80 shadow-md">
              <CardHeader className="pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-bold">Gerenciamento de Playlists & Cursos Importados</CardTitle>
                  <CardDescription className="text-xs">
                    Edite títulos, tecnologias, categorias e status de qualquer formação, ou exclua cursos do catálogo.
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="font-bold text-xs gap-1.5 shrink-0">
                  <Plus className="size-3.5" /> Adicionar Playlist / Curso
                </Button>
              </CardHeader>

              <CardContent className="p-0">
                {allCourses.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    Nenhuma playlist ou curso cadastrado no momento.
                  </div>
                ) : (
                  <div className="divide-y divide-border/60">
                    {allCourses.map((course) => (
                      <div
                        key={course.id}
                        className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:bg-muted/20 transition-colors"
                      >
                        <div className="space-y-1 max-w-xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <strong className="text-foreground font-bold text-sm">{course.title}</strong>
                            <Badge variant="secondary" className="text-[10px]">
                              {course.technology}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {course.category}
                            </Badge>
                            <Badge
                              className={
                                course.status === 'ativo'
                                  ? 'bg-emerald-500/10 text-emerald-600 border-0 text-[10px]'
                                  : 'bg-amber-500/10 text-amber-600 border-0 text-[10px]'
                              }
                            >
                              {course.status === 'ativo' ? 'Aprovado' : 'Em Revisão'}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">
                            Canal: <strong>{course.channelTitle || 'DevPath AI'}</strong> • {course.lessonsCount} aulas sequenciais • {course.totalHours}h
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {course.playlistId ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevalidatePlaylist(course)}
                              disabled={validatingPlaylistId === course.playlistId}
                              className="h-8 text-xs gap-1.5 font-semibold"
                            >
                              <ShieldCheck className="size-3.5 text-primary" /> Validar Vídeos
                            </Button>
                          ) : null}

                          {course.playlistId ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSyncPlaylist(course.playlistId!)}
                              disabled={syncingId === course.playlistId}
                              className="h-8 text-xs gap-1.5 font-semibold"
                            >
                              <RefreshCw className={`size-3 ${syncingId === course.playlistId ? 'animate-spin' : ''}`} /> Sincronizar
                            </Button>
                          ) : null}

                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleOpenEditCourse(course)}
                            className="h-8 text-xs gap-1.5 font-bold"
                          >
                            <Edit className="size-3.5" /> Editar
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDeleteCourse(course)}
                            className="h-8 text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                          >
                            <Trash2 className="size-3.5" /> Excluir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 3: Channel Ingestion */}
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
                    className="font-bold text-xs sm:text-sm shrink-0 h-11 px-6 gap-2 bg-red-600 hover:bg-red-700 text-white shadow-md"
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

                {/* Progress Step Bar */}
                {isIngesting ? (
                  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-bold text-primary">
                      <span>Processamento em Andamento</span>
                      <span>Etapa {currentStepIndex + 1} de {INGESTION_STEPS.length}</span>
                    </div>

                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${((currentStepIndex + 1) / INGESTION_STEPS.length) * 100}%` }}
                      />
                    </div>

                    <p className="text-xs font-mono text-muted-foreground animate-pulse">
                      ⏳ {INGESTION_STEPS[currentStepIndex]}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Ingestion Report Card */}
            {ingestionReport ? (
              <Card className="border-success/40 bg-success/5 p-6 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-success font-bold text-base">
                    <CheckCircle2 className="size-5" /> Relatório de Ingestão: {ingestionReport.channelName}
                  </div>
                  <Badge className="bg-success text-success-foreground font-bold text-xs">
                    {ingestionReport.coursesGenerated || ingestionReport.playlistsImported || 0} Cursos Criados
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-background/80 p-3 rounded-xl border border-border">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Playlists Analisadas</span>
                    <p className="text-lg font-black text-foreground">{ingestionReport.playlistsFound}</p>
                  </div>
                  <div className="bg-background/80 p-3 rounded-xl border border-border">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Cursos Formados</span>
                    <p className="text-lg font-black text-foreground">{ingestionReport.coursesGenerated || ingestionReport.playlistsImported || 0}</p>
                  </div>
                  <div className="bg-background/80 p-3 rounded-xl border border-border">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Aulas Cadastradas</span>
                    <p className="text-lg font-black text-foreground">{ingestionReport.videosImported || 0}</p>
                  </div>
                  <div className="bg-background/80 p-3 rounded-xl border border-border">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Playlists com Falha</span>
                    <p className={`text-lg font-black ${(ingestionReport.playlistsFailed || 0) > 0 ? 'text-destructive' : 'text-foreground'}`}>
                      {ingestionReport.playlistsFailed || 0}
                    </p>
                  </div>
                </div>

                {/* Failed Playlists Section with Retry Buttons */}
                {ingestionReport.failedPlaylistsList && ingestionReport.failedPlaylistsList.length > 0 && (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-destructive text-xs font-bold">
                      <AlertTriangle className="size-4" />
                      <span>Playlists que necessitam de atenção ({ingestionReport.failedPlaylistsList.length})</span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {ingestionReport.failedPlaylistsList.map((failed) => (
                        <div
                          key={failed.playlistId}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-background/90 border border-border text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate">{failed.title || failed.playlistId}</p>
                            <p className="text-[10px] text-destructive font-mono">{failed.error}</p>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReprocessFailedPlaylist(failed.playlistId)}
                            className="text-xs h-7 gap-1 font-bold shrink-0 border-primary/40 text-primary hover:bg-primary/10"
                          >
                            <RefreshCw className="size-3" /> Reprocessar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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

        {/* ========================================================= */}
        {/* MODAL: EDIT COURSE / PLAYLIST (FULL FUNCTIONAL)           */}
        {/* ========================================================= */}
        {editingCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <Card className="w-full max-w-2xl border-primary/40 shadow-2xl bg-card max-h-[90vh] flex flex-col">
              <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Edit className="size-4 text-primary" />
                    <CardTitle className="text-base font-bold">Editar Curso / Playlist</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Modifique os dados cadastrais, classificação pedagógica e nível da formação.
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setEditingCourse(null)} className="size-8 p-0">
                  <X className="size-4" />
                </Button>
              </CardHeader>

              <form onSubmit={handleSaveCourseEdit} className="overflow-y-auto p-6 space-y-4 flex-1">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Título do Curso</label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Ex: Curso de Segurança da Informação"
                    className="text-xs font-semibold"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Descrição Pedagógica</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground font-normal focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Breve resumo do conteúdo ensinado no curso..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Área / Categoria</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Technology */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Tecnologia Principal</label>
                    <Input
                      value={editTechnology}
                      onChange={(e) => setEditTechnology(e.target.value)}
                      placeholder="Ex: Python, React, Docker..."
                      className="text-xs"
                      required
                    />
                  </div>

                  {/* Level */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Nível de Dificuldade</label>
                    <select
                      value={editLevel}
                      onChange={(e) => setEditLevel(e.target.value as CourseLevel)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {LEVEL_OPTIONS.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Status no Catálogo</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Channel Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Canal / Instrutor</label>
                    <Input
                      value={editChannelTitle}
                      onChange={(e) => setEditChannelTitle(e.target.value)}
                      placeholder="Ex: Curso em Vídeo"
                      className="text-xs"
                    />
                  </div>

                  {/* Total Hours */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Carga Horária (horas)</label>
                    <Input
                      type="number"
                      min={1}
                      value={editTotalHours}
                      onChange={(e) => setEditTotalHours(Number(e.target.value))}
                      className="text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Thumbnail URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">URL da Imagem / Thumbnail</label>
                  <Input
                    value={editThumbnailUrl}
                    onChange={(e) => setEditThumbnailUrl(e.target.value)}
                    placeholder="https://..."
                    className="text-xs font-mono"
                  />
                </div>

                <div className="p-4 border-t border-border/60 flex items-center justify-end gap-2 bg-muted/10 -mx-6 -mb-6 mt-6">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditingCourse(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" className="font-bold text-xs gap-1.5 bg-primary text-primary-foreground">
                    <CheckCircle2 className="size-3.5" /> Salvar Alterações
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: DELETE CONFIRMATION                                */}
        {/* ========================================================= */}
        {deletingCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
            <Card className="w-full max-w-md border-destructive/40 shadow-2xl bg-card">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-destructive/15 flex items-center justify-center text-destructive">
                    <Trash2 className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-destructive">
                      Excluir Curso do Catálogo
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Tem certeza que deseja remover este curso?
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-3">
                <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-1">
                  <h4 className="text-sm font-bold text-foreground">{deletingCourse.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    Canal: <strong>{deletingCourse.channelTitle || 'DevPath AI'}</strong> • {deletingCourse.lessonsCount} aulas sequenciais
                  </p>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Esta ação removerá o curso, seus módulos e aulas associadas do catálogo. O progresso pessoal de usuários em outros cursos será mantido com segurança.
                </p>
              </CardContent>

              <div className="p-4 border-t border-border/60 flex items-center justify-end gap-2 bg-muted/20">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isDeleting}
                  onClick={() => setDeletingCourse(null)}
                  className="text-xs font-semibold"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  disabled={isDeleting}
                  onClick={handleConfirmDeleteCourse}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold text-xs gap-1.5"
                >
                  <Trash2 className="size-3.5" />
                  {isDeleting ? 'Excluindo...' : 'Excluir Definitivamente'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ADD COURSE / PLAYLIST (DUAL MODE: YOUTUBE / MANUAL) */}
        {/* ========================================================= */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <Card className="w-full max-w-2xl border-primary/40 shadow-2xl bg-card max-h-[90vh] flex flex-col">
              <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Plus className="size-4 text-primary" />
                    <CardTitle className="text-base font-bold">Adicionar Conteúdo ao Catálogo</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Importe automaticamente de uma playlist do YouTube ou crie um novo curso estruturado.
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)} className="size-8 p-0">
                  <X className="size-4" />
                </Button>
              </CardHeader>

              {/* Mode switch */}
              <div className="px-6 pt-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted/40 rounded-xl border border-border">
                  <Button
                    type="button"
                    variant={addMode === 'youtube' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setAddMode('youtube')}
                    className="text-xs font-bold gap-1.5"
                  >
                    <YoutubeIcon className="size-4" /> Importar do YouTube
                  </Button>
                  <Button
                    type="button"
                    variant={addMode === 'manual' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setAddMode('manual')}
                    className="text-xs font-bold gap-1.5"
                  >
                    <BookOpen className="size-4" /> Criar Curso Manualmente
                  </Button>
                </div>
              </div>

              {/* Mode 1: Import from YouTube */}
              {addMode === 'youtube' ? (
                <form onSubmit={handleImportPlaylistSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Link ou ID da Playlist do YouTube</label>
                    <Input
                      placeholder="Ex: https://www.youtube.com/playlist?list=PLHz_AreHm4dkZ9-atkcmcBaMZdmLHft8n"
                      value={importPlaylistUrl}
                      onChange={(e) => setImportPlaylistUrl(e.target.value)}
                      disabled={isImportingPlaylist}
                      className="text-xs font-mono h-10"
                      required
                    />
                    <p className="text-[11px] text-muted-foreground">
                      A plataforma buscará todos os vídeos, calculará as durações reais e classificará a tecnologia automaticamente.
                    </p>
                  </div>

                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-primary">
                      <Sparkles className="size-4" /> O que acontece na importação:
                    </div>
                    <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                      <li>Busca de todos os vídeos da playlist pública no YouTube</li>
                      <li>Criação de curso, módulo sequencial e aulas com IDs canônicos</li>
                      <li>Classificação pedagógica automática por inteligência artificial</li>
                    </ul>
                  </div>

                  <div className="p-4 border-t border-border/60 flex items-center justify-end gap-2 bg-muted/10 -mx-6 -mb-6 mt-6">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isImportingPlaylist}
                      size="sm"
                      className="font-bold text-xs gap-1.5 bg-red-600 hover:bg-red-700 text-white shadow-md"
                    >
                      {isImportingPlaylist ? (
                        <>
                          <RefreshCw className="size-3.5 animate-spin" /> Importando Vídeos...
                        </>
                      ) : (
                        <>
                          <YoutubeIcon className="size-4" /> Importar Playlist Agora
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                /* Mode 2: Manual Course Creation */
                <form onSubmit={handleCreateManualCourseSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Título do Curso</label>
                    <Input
                      placeholder="Ex: Arquitetura de Microsserviços com Node.js"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="text-xs font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Descrição</label>
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground font-normal focus:outline-none focus:ring-1 focus:ring-ring"
                      placeholder="Objetivos e competências desenvolvidas no curso..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Área / Categoria</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Tecnologia</label>
                      <Input
                        value={newTechnology}
                        onChange={(e) => setNewTechnology(e.target.value)}
                        placeholder="Ex: TypeScript, Go, Flutter..."
                        className="text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Nível</label>
                      <select
                        value={newLevel}
                        onChange={(e) => setNewLevel(e.target.value as CourseLevel)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {LEVEL_OPTIONS.map((l) => (
                          <option key={l.value} value={l.value}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Canal / Instrutor</label>
                      <Input
                        value={newChannel}
                        onChange={(e) => setNewChannel(e.target.value)}
                        placeholder="Ex: DevPath AI"
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Carga Horária (horas)</label>
                      <Input
                        type="number"
                        min={1}
                        value={newTotalHours}
                        onChange={(e) => setNewTotalHours(Number(e.target.value))}
                        className="text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Número Inicial de Aulas</label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={newLessonCount}
                        onChange={(e) => setNewLessonCount(Number(e.target.value))}
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">URL da Imagem / Thumbnail (opcional)</label>
                    <Input
                      placeholder="https://..."
                      value={newThumbnailUrl}
                      onChange={(e) => setNewThumbnailUrl(e.target.value)}
                      className="text-xs font-mono"
                    />
                  </div>

                  <div className="p-4 border-t border-border/60 flex items-center justify-end gap-2 bg-muted/10 -mx-6 -mb-6 mt-6">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" size="sm" className="font-bold text-xs gap-1.5 bg-primary text-primary-foreground">
                      <Plus className="size-3.5" /> Criar Curso
                    </Button>
                  </div>
                </form>
              )}
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
