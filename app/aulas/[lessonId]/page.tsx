'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  Lock,
  MessageSquare,
  PlayCircle,
  Save,
  Sparkles,
  Tv,
} from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { VideoPlayer } from '@/components/video/video-player'
import { useAppStore } from '@/lib/store'
import type { Lesson } from '@/lib/types'

export default function LessonPlayerPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const lessonId = resolvedParams.lessonId

  const {
    allLessons,
    allModules,
    completedLessons,
    completeLesson,
    recordVideoProgress,
    lessonNotes,
    saveLessonNote,
    moduleStatus,
  } = useAppStore()

  const lesson: Lesson = allLessons.find((l) => l.id === lessonId) || allLessons[0]
  const currentModule = allModules.find((m) => m.id === lesson.moduleId || m.lessonIds.includes(lesson.id)) || allModules[0]
  const moduleLessons = allLessons
    .filter((l) => currentModule.lessonIds.includes(l.id) || l.moduleId === currentModule.id)
    .sort((a, b) => a.order - b.order)

  const isCompleted = completedLessons.includes(lesson.id)
  const [note, setNote] = useState(lessonNotes[lesson.id] || '')
  const [isSavingNote, setIsSavingNote] = useState(false)

  useEffect(() => {
    setNote(lessonNotes[lesson.id] || '')
  }, [lesson.id, lessonNotes])

  // Sequential Next & Prev Lessons strictly following position ASC
  const currentIdx = moduleLessons.findIndex((l) => l.id === lesson.id)
  const prevLesson = currentIdx > 0 ? moduleLessons[currentIdx - 1] : null
  const nextLesson = currentIdx < moduleLessons.length - 1 ? moduleLessons[currentIdx + 1] : null

  function handleComplete() {
    completeLesson(lesson.id)
    toast.success('Aula concluída! +50 XP adicionados.')
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      })
    } catch {
      // ignore
    }
  }

  function handleSaveNote() {
    setIsSavingNote(true)
    saveLessonNote(lesson.id, note)
    setTimeout(() => {
      setIsSavingNote(false)
      toast.success('Anotação salva com sucesso!')
    }, 400)
  }

  return (
    <AppShell title={lesson.title} subtitle={`Módulo: ${currentModule.title}`}>
      <div className="space-y-6">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
          <Link
            href="/trilha"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Voltar para Minha Trilha
          </Link>

          <div className="flex items-center gap-2">
            {lesson.source ? (
              <Badge variant="outline" className="text-xs font-medium">
                Fonte: {lesson.source}
              </Badge>
            ) : null}
            <Badge variant="secondary" className="text-xs font-bold">
              Aula {lesson.order} de {moduleLessons.length}
            </Badge>
            <Badge className="bg-primary/10 text-primary border-0 text-xs gap-1 font-bold">
              <Clock className="size-3" /> {lesson.durationMin} min
            </Badge>
          </div>
        </div>

        {/* Player and Playlist Grid */}
        <div className="grid gap-8 lg:grid-cols-3 items-start">
          {/* Main Column: Video Player, Content, Notes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Centralized Video Player */}
            {lesson.type === 'video' ? (
              <VideoPlayer
                lessonId={lesson.id}
                videoId={lesson.videoId}
                externalVideoId={lesson.externalVideoId}
                videoUrl={lesson.videoUrl}
                sourceType={lesson.sourceType || 'youtube'}
                title={lesson.title}
                source={lesson.source}
                thumbnailUrl={lesson.thumbnailUrl}
                durationMin={lesson.durationMin}
                availabilityStatus={lesson.availabilityStatus}
                youtubeExists={lesson.youtubeExists ?? true}
                embedAvailable={lesson.embedAvailable ?? true}
                isCompleted={isCompleted}
                onProgress={(p) => recordVideoProgress(lesson.id, p.watchedPercentage, p.lastPositionSeconds)}
                onComplete={handleComplete}
              />
            ) : (
              <Card className="border-border/80 shadow-xl shadow-primary/5 p-8 text-center space-y-3 bg-muted/20">
                <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary mx-auto">
                  <BookOpen className="size-7" />
                </div>
                <h3 className="text-lg font-bold">Material Teórico e Prático de Estudo</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Acompanhe o conteúdo estruturado abaixo e pratique os exercícios no Code Lab.
                </p>
              </Card>
            )}

            {/* Lesson Info and Completion Action */}
            <Card className="border-border/80 shadow-md">
              <div className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{lesson.title}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{lesson.description}</p>
                  </div>

                  <Button
                    onClick={handleComplete}
                    variant={isCompleted ? 'secondary' : 'default'}
                    className="gap-2 shrink-0 font-bold"
                  >
                    <CheckCircle2 className={`size-4 ${isCompleted ? 'text-success' : ''}`} />
                    {isCompleted ? 'Aula Concluída ✓' : 'Marcar Concluída (+50 XP)'}
                  </Button>
                </div>

                {/* Lesson Notes & Theory Text */}
                {lesson.contentMarkdown ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none rounded-xl bg-muted/20 p-4 border border-border/60">
                    <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {lesson.contentMarkdown}
                    </p>
                  </div>
                ) : null}

                {/* Sequential Controls strictly moving by position (order) */}
                <div className="flex items-center justify-between pt-4">
                  {prevLesson ? (
                    <Link href={`/aulas/${prevLesson.id}`}>
                      <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold">
                        <ArrowLeft className="size-4" /> Aula Anterior ({prevLesson.order})
                      </Button>
                    </Link>
                  ) : (
                    <div />
                  )}

                  {nextLesson ? (
                    <Link href={`/aulas/${nextLesson.id}`}>
                      <Button size="sm" className="gap-2 shadow-md shadow-primary/20 text-xs font-bold bg-primary text-primary-foreground">
                        Próxima Aula ({nextLesson.order}) <ArrowRight className="size-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/exercicios`}>
                      <Button size="sm" className="gap-2 shadow-md shadow-primary/20 bg-success hover:bg-success/90 text-success-foreground text-xs font-bold">
                        Fazer Exercícios do Módulo <ArrowRight className="size-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>

            {/* Personal Student Notes Card */}
            <Card className="border-border/70">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    <CardTitle className="text-base font-bold">Meu Bloco de Anotações</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveNote}
                    disabled={isSavingNote}
                    className="gap-1.5 text-xs font-bold"
                  >
                    <Save className="size-3.5" />
                    {isSavingNote ? 'Salvando...' : 'Salvar Nota'}
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  Suas anotações ficam salvas e sincronizadas para consultas futuras.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={4}
                  placeholder="Escreva seus aprendizados, dúvidas ou trechos de código importantes desta aula..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="text-xs leading-relaxed font-mono bg-background"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Module Lesson Sequence Playlist */}
          <div className="space-y-6">
            <Card className="border-border/80 shadow-lg shadow-primary/5">
              <CardHeader className="pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Playlist do Módulo ({moduleLessons.length} Aulas)
                </span>
                <CardTitle className="text-base font-bold">{currentModule.title}</CardTitle>
                <CardDescription className="text-xs">
                  {moduleLessons.filter((l) => completedLessons.includes(l.id)).length} de {moduleLessons.length} concluídas
                </CardDescription>
              </CardHeader>

              <CardContent className="p-3 space-y-1.5 max-h-[600px] overflow-y-auto">
                {moduleLessons.map((l) => {
                  const isCur = l.id === lesson.id
                  const isDone = completedLessons.includes(l.id)

                  return (
                    <Link
                      key={l.id}
                      href={`/aulas/${l.id}`}
                      className={`flex items-center justify-between gap-2.5 rounded-xl border p-3 text-xs transition-all ${
                        isCur
                          ? 'border-primary bg-primary/10 font-bold text-primary ring-1 ring-primary'
                          : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className={`grid size-6 place-items-center rounded-lg text-[10px] font-extrabold shrink-0 ${
                            isDone
                              ? 'bg-success/20 text-success'
                              : isCur
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {l.order}
                        </div>
                        <span className="truncate">{l.title}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground">{l.durationMin}m</span>
                        {isDone ? (
                          <CheckCircle2 className="size-4 text-success" />
                        ) : isCur ? (
                          <PlayCircle className="size-4 text-primary" />
                        ) : null}
                      </div>
                    </Link>
                  )
                })}
              </CardContent>
            </Card>

            {/* AI Tutor Quick Access */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <h4 className="text-xs font-bold text-foreground">Dúvida nesta aula?</h4>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Pergunte ao DevMentor AI sobre os conceitos de <strong>{lesson.title}</strong>.
                </p>
                <Link href={`/mentor?q=${encodeURIComponent(`Tenho uma dúvida na aula "${lesson.title}": `)}`}>
                  <Button variant="outline" size="sm" className="w-full text-xs font-bold gap-1 mt-1">
                    <MessageSquare className="size-3.5 text-primary" /> Abrir DevMentor AI
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
