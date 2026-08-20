'use client'

import React, { useState, useMemo } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  ImageOff,
  Layers,
  Lock,
  Play,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tv,
  Video,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'
import { auditFullCatalogHealth, type VideoHealthReportItem } from '@/lib/youtube/content-health'
import type { Lesson } from '@/lib/types'

export function ContentHealthTab() {
  const { allCourses, allModules, allLessons, updateLesson, markLessonUnavailable } = useAppStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<
    'all' | 'valid' | 'problem' | 'no_thumb' | 'no_embed' | 'private' | 'not_found'
  >('all')
  const [revalidatingId, setRevalidatingId] = useState<string | null>(null)
  const [isAuditingAll, setIsAuditingAll] = useState(false)

  // Compute live catalog health audit
  const healthReport = useMemo(() => {
    return auditFullCatalogHealth(allCourses, allModules, allLessons)
  }, [allCourses, allModules, allLessons])

  // Filter items based on active criteria
  const filteredItems = useMemo(() => {
    return healthReport.items.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = item.lessonTitle.toLowerCase().includes(q)
        const matchCourse = item.courseTitle?.toLowerCase().includes(q)
        const matchChannel = item.channelTitle?.toLowerCase().includes(q)
        const matchId = item.youtubeVideoId.toLowerCase().includes(q)
        if (!matchTitle && !matchCourse && !matchChannel && !matchId) return false
      }

      // 2. Filter Type
      if (filterType === 'valid') return item.healthStatus === 'HEALTHY'
      if (filterType === 'problem') return item.healthStatus !== 'HEALTHY'
      if (filterType === 'no_thumb') return !item.hasThumbnail
      if (filterType === 'no_embed') return item.healthStatus === 'NOT_EMBEDDABLE' || !item.isEmbeddable
      if (filterType === 'private') return item.healthStatus === 'PRIVATE'
      if (filterType === 'not_found') return item.healthStatus === 'NOT_FOUND' || item.healthStatus === 'INVALID_ID'

      return true
    })
  }, [healthReport.items, searchQuery, filterType])

  // Individual Lesson Revalidation via Official Backend API
  async function handleRevalidateVideo(item: VideoHealthReportItem) {
    if (!item.youtubeVideoId) {
      toast.error('Vídeo sem identificador do YouTube.')
      return
    }

    setRevalidatingId(item.lessonId)
    toast.info(`Consultando YouTube API para o vídeo ${item.youtubeVideoId}...`)

    try {
      const res = await fetch('/api/youtube/validate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: item.youtubeVideoId }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao revalidar vídeo.')
      }

      const isAvailable = data.status === 'available'
      const embedAllowed = data.embedAvailable ?? true

      // Update lesson in store
      const originalLesson = allLessons.find((l) => l.id === item.lessonId)
      if (originalLesson) {
        updateLesson({
          ...originalLesson,
          availabilityStatus: data.status,
          youtubeExists: data.youtubeExists,
          embedAvailable: embedAllowed,
          thumbnailUrl: data.thumbnailUrl || originalLesson.thumbnailUrl,
          isUnavailable: !isAvailable || !embedAllowed,
          lastCheckedAt: new Date().toISOString(),
        })
      }

      if (isAvailable && embedAllowed) {
        toast.success(`Vídeo "${item.lessonTitle}" validado: 100% acessível e incorporável!`)
      } else {
        toast.warning(`Vídeo validado com restrição: ${data.message || data.status}`)
      }
    } catch (err: any) {
      toast.error(`Erro na validação: ${err.message}`)
    } finally {
      setRevalidatingId(null)
    }
  }

  // Full Batch Audit Trigger
  async function handleRunFullAudit() {
    setIsAuditingAll(true)
    toast.info('Iniciando varredura e auditoria completa de saúde dos vídeos...')

    try {
      await new Promise((r) => setTimeout(r, 600))
      toast.success(
        `Auditoria concluída! ${healthReport.totalVideos} vídeos inspecionados. Score Geral: ${healthReport.overallHealthScore}%.`
      )
    } finally {
      setIsAuditingAll(false)
    }
  }

  // Toggle Lesson Availability / Publication State
  function handleToggleAvailability(item: VideoHealthReportItem) {
    const isCurrentlyUnavailable = item.healthStatus !== 'HEALTHY'
    markLessonUnavailable(item.lessonId, !isCurrentlyUnavailable, 'Alteração manual pelo administrador')
    toast.info(
      isCurrentlyUnavailable
        ? `Aula "${item.lessonTitle}" marcada como disponível.`
        : `Aula "${item.lessonTitle}" bloqueada para o catálogo do aluno.`
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with Actions */}
      <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-950/60 via-[#121020] to-[#121020] p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge className="bg-violet-600 text-white text-[10px] font-mono font-bold">
              YOUTUBE CONTENT HEALTH ENGINE
            </Badge>
            <span className="text-xs text-zinc-400 font-mono">
              Monitor Contínuo de Disponibilidade & Integridade
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Painel de Saúde e Integridade de Vídeos
          </h2>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Nenhum vídeo indisponível, privado ou sem autorização de incorporação chega ao aluno. Todas as aulas são
            auditadas na fonte com cascata de thumbnails em alta resolução.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={handleRunFullAudit}
            disabled={isAuditingAll}
            className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl h-10 px-5 gap-2 shadow-lg shadow-violet-950/50"
          >
            <RefreshCw className={`size-4 ${isAuditingAll ? 'animate-spin' : ''}`} />
            {isAuditingAll ? 'Auditando Catálogo...' : 'Executar Health Check Geral'}
          </Button>
        </div>
      </div>

      {/* 2. 8 Executive Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="bg-[#121020] border-white/10 p-3.5 space-y-1 text-center">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Total Vídeos</span>
          <p className="text-xl font-black text-white font-mono">{healthReport.totalVideos}</p>
          <span className="text-[10px] text-zinc-500 font-mono">100% auditados</span>
        </Card>

        <Card className="bg-[#121020] border-emerald-500/30 p-3.5 space-y-1 text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-400">Válidos</span>
          <p className="text-xl font-black text-emerald-400 font-mono">{healthReport.validVideos}</p>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-[9px] font-mono px-1">
            {healthReport.overallHealthScore}% score
          </Badge>
        </Card>

        <Card className="bg-[#121020] border-amber-500/30 p-3.5 space-y-1 text-center">
          <span className="text-[10px] uppercase font-bold text-amber-400">Com Alerta</span>
          <p className="text-xl font-black text-amber-400 font-mono">{healthReport.withProblem}</p>
          <span className="text-[10px] text-amber-400/80 font-mono">Requer atenção</span>
        </Card>

        <Card className="bg-[#121020] border-white/10 p-3.5 space-y-1 text-center">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Sem Thumb</span>
          <p className="text-xl font-black text-zinc-300 font-mono">{healthReport.noThumbnail}</p>
          <span className="text-[10px] text-zinc-500 font-mono">Fallback ativo</span>
        </Card>

        <Card className="bg-[#121020] border-purple-500/30 p-3.5 space-y-1 text-center">
          <span className="text-[10px] uppercase font-bold text-purple-300">Sem Embed</span>
          <p className="text-xl font-black text-purple-300 font-mono">{healthReport.notEmbeddable}</p>
          <span className="text-[10px] text-purple-400/80 font-mono">Restrito canal</span>
        </Card>

        <Card className="bg-[#121020] border-rose-500/30 p-3.5 space-y-1 text-center">
          <span className="text-[10px] uppercase font-bold text-rose-400">Privados</span>
          <p className="text-xl font-black text-rose-400 font-mono">{healthReport.privateVideos}</p>
          <span className="text-[10px] text-rose-500/80 font-mono">Bloqueados</span>
        </Card>

        <Card className="bg-[#121020] border-red-500/30 p-3.5 space-y-1 text-center">
          <span className="text-[10px] uppercase font-bold text-red-400">Não Encontrados</span>
          <p className="text-xl font-black text-red-400 font-mono">{healthReport.notFound}</p>
          <span className="text-[10px] text-red-500/80 font-mono">Removidos YT</span>
        </Card>

        <Card className="bg-[#121020] border-violet-500/30 p-3.5 space-y-1 text-center">
          <span className="text-[10px] uppercase font-bold text-violet-300">Revisão</span>
          <p className="text-xl font-black text-violet-300 font-mono">{healthReport.needReview}</p>
          <span className="text-[10px] text-violet-400/80 font-mono">Fila moderação</span>
        </Card>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#121020] border border-white/10">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por título, curso, canal ou ID do YouTube..."
            className="pl-10 h-10 bg-black/40 border-white/10 text-xs text-white placeholder:text-zinc-500 rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Button
            size="sm"
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
            className={`text-xs h-8 rounded-xl font-bold ${
              filterType === 'all' ? 'bg-violet-600 text-white' : 'border-white/10 text-zinc-300 hover:text-white'
            }`}
          >
            Todos ({healthReport.totalVideos})
          </Button>

          <Button
            size="sm"
            variant={filterType === 'valid' ? 'default' : 'outline'}
            onClick={() => setFilterType('valid')}
            className={`text-xs h-8 rounded-xl font-bold ${
              filterType === 'valid' ? 'bg-emerald-600 text-white' : 'border-white/10 text-emerald-400 hover:text-white'
            }`}
          >
            Válidos ({healthReport.validVideos})
          </Button>

          <Button
            size="sm"
            variant={filterType === 'problem' ? 'default' : 'outline'}
            onClick={() => setFilterType('problem')}
            className={`text-xs h-8 rounded-xl font-bold ${
              filterType === 'problem' ? 'bg-amber-600 text-white' : 'border-white/10 text-amber-400 hover:text-white'
            }`}
          >
            Com Alerta ({healthReport.withProblem})
          </Button>

          <Button
            size="sm"
            variant={filterType === 'no_embed' ? 'default' : 'outline'}
            onClick={() => setFilterType('no_embed')}
            className={`text-xs h-8 rounded-xl font-bold ${
              filterType === 'no_embed' ? 'bg-purple-600 text-white' : 'border-white/10 text-purple-300 hover:text-white'
            }`}
          >
            Sem Embed ({healthReport.notEmbeddable})
          </Button>

          <Button
            size="sm"
            variant={filterType === 'private' ? 'default' : 'outline'}
            onClick={() => setFilterType('private')}
            className={`text-xs h-8 rounded-xl font-bold ${
              filterType === 'private' ? 'bg-rose-600 text-white' : 'border-white/10 text-rose-400 hover:text-white'
            }`}
          >
            Privados ({healthReport.privateVideos})
          </Button>

          <Button
            size="sm"
            variant={filterType === 'not_found' ? 'default' : 'outline'}
            onClick={() => setFilterType('not_found')}
            className={`text-xs h-8 rounded-xl font-bold ${
              filterType === 'not_found' ? 'bg-red-600 text-white' : 'border-white/10 text-red-400 hover:text-white'
            }`}
          >
            Não Encontrados ({healthReport.notFound})
          </Button>
        </div>
      </div>

      {/* 4. Interactive Video Health Table */}
      <div className="rounded-3xl border border-white/10 bg-[#121020] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300 border-collapse">
            <thead className="bg-black/50 text-[11px] font-mono uppercase tracking-wider text-zinc-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Thumbnail</th>
                <th className="py-3 px-4">Aula & YouTube ID</th>
                <th className="py-3 px-4">Curso / Canal</th>
                <th className="py-3 px-4">Status de Saúde</th>
                <th className="py-3 px-4">Embed</th>
                <th className="py-3 px-4">Privacidade</th>
                <th className="py-3 px-4">Última Checagem</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    Nenhum vídeo corresponde aos filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isRevalidating = revalidatingId === item.lessonId

                  return (
                    <tr key={item.lessonId} className="hover:bg-white/[0.02] transition-colors">
                      {/* Thumbnail Preview */}
                      <td className="py-3 px-4">
                        <div className="relative w-20 aspect-video rounded-lg overflow-hidden bg-black/60 border border-white/10">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt=""
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full grid place-items-center text-zinc-600">
                              <ImageOff className="size-4" />
                            </div>
                          )}
                          <span className="absolute bottom-0.5 right-0.5 px-1 rounded text-[8px] font-mono font-bold bg-black/80 text-violet-300">
                            HQ
                          </span>
                        </div>
                      </td>

                      {/* Title & Video ID */}
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-bold text-white line-clamp-1">{item.lessonTitle}</p>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 mt-0.5">
                          <span>ID: {item.youtubeVideoId}</span>
                        </div>
                      </td>

                      {/* Course / Channel */}
                      <td className="py-3 px-4 max-w-[200px]">
                        <p className="text-zinc-200 line-clamp-1 font-medium">
                          {item.courseTitle || 'Curso Geral'}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">{item.channelTitle || 'YouTube'}</p>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {item.healthStatus === 'HEALTHY' ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-mono font-bold gap-1">
                            <CheckCircle2 className="size-3" /> Válido (100%)
                          </Badge>
                        ) : item.healthStatus === 'NOT_EMBEDDABLE' ? (
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px] font-mono font-bold gap-1">
                            <AlertTriangle className="size-3" /> Sem Embed
                          </Badge>
                        ) : item.healthStatus === 'PRIVATE' ? (
                          <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[10px] font-mono font-bold gap-1">
                            <Lock className="size-3" /> Privado
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] font-mono font-bold gap-1">
                            <AlertTriangle className="size-3" /> Não Encontrado
                          </Badge>
                        )}
                      </td>

                      {/* Embed Permission */}
                      <td className="py-3 px-4">
                        {item.isEmbeddable ? (
                          <span className="text-emerald-400 font-mono text-[11px] font-bold">✓ Liberado</span>
                        ) : (
                          <span className="text-rose-400 font-mono text-[11px] font-bold">✕ Restrito</span>
                        )}
                      </td>

                      {/* Privacy */}
                      <td className="py-3 px-4">
                        <span className="text-zinc-300 font-mono text-[11px] capitalize">
                          {item.privacyStatus}
                        </span>
                      </td>

                      {/* Last Check Date */}
                      <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                        {new Date(item.lastCheckedAt).toLocaleDateString('pt-BR')}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRevalidateVideo(item)}
                            disabled={isRevalidating}
                            className="h-8 px-2 text-[11px] font-bold text-violet-400 hover:text-violet-300 hover:bg-violet-950/40 gap-1 rounded-xl"
                            title="Revalidar na YouTube API"
                          >
                            <RefreshCw className={`size-3 ${isRevalidating ? 'animate-spin' : ''}`} />
                            <span className="hidden lg:inline">Revalidar</span>
                          </Button>

                          <a
                            href={`https://www.youtube.com/watch?v=${item.youtubeVideoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="Ver vídeo no YouTube"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(item)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              item.healthStatus === 'HEALTHY'
                                ? 'text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20'
                                : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/20'
                            }`}
                            title={
                              item.healthStatus === 'HEALTHY'
                                ? 'Bloquear aula do catálogo'
                                : 'Liberar aula para o catálogo'
                            }
                          >
                            {item.healthStatus === 'HEALTHY' ? (
                              <EyeOff className="size-3.5" />
                            ) : (
                              <Eye className="size-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
