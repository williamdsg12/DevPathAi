'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Lock,
  Maximize,
  Play,
  PlayCircle,
  RefreshCw,
  Sparkles,
  Tv,
  Volume2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { normalizeYouTubeVideoUrl } from '@/lib/video/normalizer'
import type { VideoAvailabilityStatus, VideoSourceType } from '@/lib/types'

export interface VideoPlayerProps {
  lessonId: string
  videoId?: string
  externalVideoId?: string
  videoUrl?: string
  sourceType?: VideoSourceType
  title: string
  source?: string
  thumbnailUrl?: string
  durationMin?: number
  availabilityStatus?: VideoAvailabilityStatus
  youtubeExists?: boolean
  embedAvailable?: boolean
  initialPositionSeconds?: number
  isCompleted?: boolean
  onProgress?: (progress: { watchedPercentage: number; lastPositionSeconds: number }) => void
  onComplete?: () => void
}

export function VideoPlayer({
  lessonId,
  videoId,
  externalVideoId,
  videoUrl,
  sourceType = 'youtube',
  title,
  source,
  thumbnailUrl,
  durationMin = 15,
  availabilityStatus = 'available',
  youtubeExists = true,
  embedAvailable = true,
  initialPositionSeconds = 0,
  isCompleted = false,
  onProgress,
  onComplete,
}: VideoPlayerProps) {
  // Normalize YouTube ID and canonical URLs
  const rawId = videoId || externalVideoId || videoUrl || ''
  const normalized = normalizeYouTubeVideoUrl(rawId)

  const [hasEmbedError, setHasEmbedError] = useState(
    availabilityStatus === 'embed_disabled' || availabilityStatus === 'external_only' || !embedAvailable
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [copied, setCopied] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Listen to YouTube Iframe postMessage events for error detection (e.g. Error 101/150 = embedding restricted)
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data)
          if (data.event === 'onError') {
            const errorCode = data.info
            // Error 101 or 150: The owner of the requested video does not allow it to be played in embedded players.
            if (errorCode === 101 || errorCode === 150) {
              setHasEmbedError(true)
            } else if (errorCode === 100 || errorCode === 2) {
              setHasEmbedError(true)
            }
          }
          if (data.event === 'onStateChange' && data.info === 1) {
            setIsPlaying(true)
            if (onProgress) {
              onProgress({ watchedPercentage: 25, lastPositionSeconds: 60 })
            }
          }
        } catch {
          // not youtube json postMessage
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onProgress])

  // Reset embed error if lesson changes
  useEffect(() => {
    setHasEmbedError(
      availabilityStatus === 'embed_disabled' ||
      availabilityStatus === 'external_only' ||
      !embedAvailable
    )
    setIsPlaying(false)
  }, [lessonId, availabilityStatus, embedAvailable])

  function handleCopyLink() {
    if (normalized.watchUrl) {
      navigator.clipboard.writeText(normalized.watchUrl)
      setCopied(true)
      toast.success('Link do vídeo copiado para a área de transferência!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Fallback UI for embed-restricted or external-only YouTube videos
  if (hasEmbedError || availabilityStatus === 'embed_disabled' || availabilityStatus === 'external_only') {
    const thumb = thumbnailUrl || normalized.thumbnailUrl || `https://img.youtube.com/vi/${normalized.videoId}/hqdefault.jpg`

    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 border border-amber-500/30 shadow-2xl flex flex-col justify-between p-6 text-white">
        {/* Background Blurred Thumbnail */}
        {thumb ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-md pointer-events-none"
            style={{ backgroundImage: `url(${thumb})` }}
          />
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/40 pointer-events-none" />

        {/* Top Info Bar */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold gap-1.5 px-3 py-1">
            <Tv className="size-3.5" /> Disponível no YouTube
          </Badge>

          {source ? (
            <span className="text-xs text-zinc-400 font-medium truncate">
              Origem: {source}
            </span>
          ) : null}
        </div>

        {/* Center Main Message & Call to Action */}
        <div className="relative z-10 my-auto text-center max-w-xl mx-auto space-y-4 py-4">
          <div className="size-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 grid place-items-center mx-auto text-amber-400 shadow-lg">
            <ExternalLink className="size-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-zinc-100">
              Este vídeo não pode ser reproduzido diretamente aqui
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              O autor deste canal desativou a incorporação externa. O vídeo existe normalmente e está liberado para você assistir no YouTube oficial.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={normalized.watchUrl || `https://www.youtube.com/watch?v=${normalized.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button className="bg-red-600 hover:bg-red-700 text-white font-bold gap-2 text-xs sm:text-sm shadow-xl shadow-red-600/30 px-6 py-5">
                <Play className="size-4 fill-white" /> Assistir no YouTube Oficial ↗
              </Button>
            </a>

            {onComplete && !isCompleted ? (
              <Button
                variant="outline"
                onClick={onComplete}
                className="text-xs font-semibold gap-1.5 border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 py-5"
              >
                <CheckCircle2 className="size-4 text-emerald-400" /> Marcar como Assistida (+50 XP)
              </Button>
            ) : null}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-800/80">
          <span>ID Canônico: <code className="text-zinc-300 font-mono">{normalized.videoId || 'N/A'}</code></span>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="text-xs text-zinc-400 hover:text-zinc-200 gap-1 h-7 px-2"
            >
              <Copy className="size-3" /> {copied ? 'Copiado!' : 'Copiar Link'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHasEmbedError(false)}
              className="text-xs text-zinc-400 hover:text-zinc-200 gap-1 h-7 px-2"
            >
              <RefreshCw className="size-3" /> Tentar Player Interno
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 1. YouTube Player Mode
  if (sourceType === 'youtube' && normalized.isValid) {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-border/60 group">
        <iframe
          ref={iframeRef}
          src={`https://www.youtube-nocookie.com/embed/${normalized.videoId}?rel=0&enablejsapi=1&modestbranding=1&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      </div>
    )
  }

  // 2. Owned / Licensed / Custom HTML5 Video Player Mode
  if (sourceType === 'owned' || sourceType === 'licensed') {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-primary/30 group">
        <video
          ref={videoRef}
          src={videoUrl || ''}
          poster={thumbnailUrl}
          controls
          className="size-full object-contain"
          onPlay={() => setIsPlaying(true)}
          onEnded={onComplete}
        >
          Seu navegador não suporta a tag de vídeo.
        </video>

        <div className="absolute top-3 left-3 pointer-events-none">
          <Badge className="bg-primary/90 text-primary-foreground font-bold text-[10px] shadow">
            {sourceType === 'licensed' ? 'Conteúdo Licenciado' : 'Conteúdo Exclusivo DevPath'}
          </Badge>
        </div>
      </div>
    )
  }

  // 3. Removed or Invalid ID State
  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 border border-destructive/40 shadow-xl flex flex-col items-center justify-center p-8 text-center text-white space-y-3">
      <div className="size-12 rounded-2xl bg-destructive/10 border border-destructive/30 grid place-items-center text-destructive">
        <AlertTriangle className="size-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold">Conteúdo Indisponível</h3>
        <p className="text-xs text-zinc-400 max-w-md">
          Não foi possível localizar o identificador válido desta aula. A equipe de moderação foi notificada.
        </p>
      </div>

      <div className="flex items-center gap-2 pt-2">
        {normalized.watchUrl ? (
          <a
            href={normalized.watchUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="text-xs gap-1.5 font-bold">
              <ExternalLink className="size-3.5" /> Verificar no YouTube
            </Button>
          </a>
        ) : null}

        {onComplete ? (
          <Button size="sm" onClick={onComplete} className="text-xs font-bold bg-primary text-primary-foreground">
            Avançar para Próxima Aula
          </Button>
        ) : null}
      </div>
    </div>
  )
}
