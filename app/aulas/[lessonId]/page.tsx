'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Download,
  ExternalLink,
  FileCode2,
  FileText,
  Filter,
  Flame,
  HelpCircle,
  Info,
  Layers,
  Lock,
  MessageSquare,
  MoreHorizontal,
  Play,
  PlayCircle,
  Save,
  SlidersHorizontal,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Tv,
  Video,
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
    allCourses,
    completedLessons,
    completeLesson,
    recordVideoProgress,
    lessonNotes,
    saveLessonNote,
    moduleStatus,
    activities,
    completedActivities,
    submitActivityAnswer,
    generateActivitiesForLesson,
    activityAttempts,
  } = useAppStore()

  const lesson: Lesson =
    allLessons.find((l) => l.id === lessonId) ||
    allLessons.find((l) => l.id === 'l-logica-1') ||
    allLessons[0]
  const currentModule =
    allModules.find((m) => m.id === lesson.moduleId || m.lessonIds.includes(lesson.id)) ||
    allModules.find((m) => m.id === 'mod-logica') ||
    allModules[0]
  const currentCourse =
    allCourses.find((c) => c.id === currentModule?.courseId || (lesson.playlistId && c.playlistId === lesson.playlistId)) ||
    allCourses.find((c) => c.id === 'crs-logica') ||
    allCourses[0]

  const moduleLessons = allLessons
    .filter((l) => currentModule.lessonIds.includes(l.id) || l.moduleId === currentModule.id)
    .sort((a, b) => a.order - b.order)

  const isCompleted = completedLessons.includes(lesson.id)
  const lessonActivities = activities.filter((a) => a.lessonId === lesson.id)
  const doneLessonActivities = lessonActivities.filter((a) => completedActivities.includes(a.id))

  const [activeTab, setActiveTab] = useState<'sobre' | 'atividades' | 'materiais' | 'transcricao'>('sobre')
  const [autoPlay, setAutoPlay] = useState<boolean>(true)
  const [isLiked, setIsLiked] = useState<boolean | null>(null)
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false)
  const [note, setNote] = useState(lessonNotes[lesson.id] || '')
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({})
  const [codeAnswers, setCodeAnswers] = useState<Record<string, string>>({})
  const [submissionFeedback, setSubmissionFeedback] = useState<Record<string, { isCorrect: boolean; feedback: string; hint?: string }>>({})
  const [isGeneratingActivities, setIsGeneratingActivities] = useState(false)

  useEffect(() => {
    setNote(lessonNotes[lesson.id] || '')
  }, [lesson.id, lessonNotes])

  // Sequential Next & Prev Lessons
  const currentIdx = moduleLessons.findIndex((l) => l.id === lesson.id)
  const prevLesson = currentIdx > 0 ? moduleLessons[currentIdx - 1] : null
  const nextLesson = currentIdx < moduleLessons.length - 1 ? moduleLessons[currentIdx + 1] : null

  // Calculate total module duration
  const totalModuleMinutes = moduleLessons.reduce((acc, l) => acc + (l.durationMin || 20), 0)
  const totalHours = Math.floor(totalModuleMinutes / 60)
  const remainingMinutes = totalModuleMinutes % 60
  const formattedModuleDuration = `${totalHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:00`

  function handleComplete() {
    completeLesson(lesson.id)
    toast.success('Aula concluída! +50 XP adicionados.')
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      })
    } catch {
      // ignore
    }

    if (autoPlay && nextLesson) {
      setTimeout(() => {
        router.push(`/aulas/${nextLesson.id}`)
      }, 1500)
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

  async function handleGenerateLessonActivities() {
    setIsGeneratingActivities(true)
    try {
      await generateActivitiesForLesson(lesson.id)
      toast.success('Atividades práticas geradas com sucesso pela IA para esta aula!')
      setActiveTab('atividades')
    } catch {
      toast.error('Erro ao gerar atividades.')
    } finally {
      setIsGeneratingActivities(false)
    }
  }

  function handleAnswerActivity(actId: string, type: string) {
    const act = activities.find((a) => a.id === actId)
    if (!act) return

    let answer: string | number
    if (type === 'multiple_choice' || type === 'true_false') {
      const opt = selectedOptions[actId]
      if (opt === undefined) {
        toast.error('Selecione uma opção antes de responder.')
        return
      }
      answer = opt
    } else {
      const code = codeAnswers[actId] || act.codeStarter || ''
      if (!code.trim()) {
        toast.error('Insira seu código antes de submeter.')
        return
      }
      answer = code.trim()
    }

    const res = submitActivityAnswer(actId, answer, 45)
    setSubmissionFeedback((prev) => ({
      ...prev,
      [actId]: { isCorrect: res.isCorrect, feedback: res.feedback, hint: res.hint },
    }))

    if (res.isCorrect) {
      toast.success(`Atividade concluída com sucesso! (+${res.xpEarned} XP)`)
      try {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } })
      } catch {}
    } else {
      toast.error('Resposta incorreta. Veja a dica e tente novamente.')
    }
  }

  return (
    <AppShell title={lesson.title} subtitle={`${currentCourse?.title || 'Curso'} • ${currentModule.title}`}>
      <div className="space-y-4 pb-12">
        {/* SECOND NAVIGATION / COURSE SUB-HEADER */}
        <div className="flex items-center justify-between gap-4 py-2 px-1 border-b border-white/5 text-xs">
          {/* LEFT: Back arrow + Course title / Aulas */}
          <div className="flex items-center gap-2.5 text-zinc-400 min-w-0">
            <Link
              href="/trilha"
              className="grid size-8 place-items-center rounded-xl bg-white/[0.03] border border-white/5 text-zinc-400 hover:text-white hover:border-violet-500/40 transition-colors"
              title="Voltar para a Trilha"
            >
              <ArrowLeft className="size-4" />
            </Link>

            <div className="flex items-center gap-2 truncate">
              <span className="grid size-6 place-items-center rounded-lg bg-violet-950/60 border border-violet-500/30 text-violet-400">
                <Code2 className="size-3.5" />
              </span>
              <span className="font-bold text-white text-xs sm:text-sm truncate">
                {currentCourse?.title || currentModule.title}
              </span>
              <span className="text-zinc-600">/</span>
              <span className="font-semibold text-zinc-400">Aulas</span>
            </div>
          </div>

          {/* RIGHT: Reprodução automática + Toggle Switch */}
          <div className="flex items-center gap-3 shrink-0">
            <label htmlFor="autoplay-toggle" className="hidden sm:inline text-xs font-semibold text-zinc-400 cursor-pointer">
              Reprodução automática
            </label>
            <button
              id="autoplay-toggle"
              type="button"
              role="switch"
              aria-checked={autoPlay}
              onClick={() => setAutoPlay(!autoPlay)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoPlay ? 'bg-violet-600' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  autoPlay ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* MAIN STUDY AREA (TWO-COLUMN 75% / 25% LAYOUT) */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* LEFT SIDE: Approximately 75% of screen width (lg:col-span-8 or col-span-9) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            {/* 1. Large Cinema Video Player */}
            <div className="overflow-hidden rounded-2xl bg-black border border-white/5 shadow-2xl">
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
                <div className="aspect-video w-full grid place-items-center bg-[#0d0c14] text-center p-8">
                  <div className="space-y-3">
                    <BookOpen className="size-10 mx-auto text-violet-400" />
                    <h3 className="text-base font-bold text-white">Conteúdo Teórico</h3>
                    <p className="text-xs text-zinc-400 max-w-sm">
                      Acompanhe os conceitos estruturados abaixo e pratique os exercícios.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Horizontal Lesson Tab Bar & Action Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-2">
              {/* Left Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab('sobre')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative shrink-0 ${
                    activeTab === 'sobre'
                      ? 'text-white bg-white/[0.04] border border-white/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <Info className="size-3.5 text-violet-400" />
                  <span>Sobre a aula</span>
                  {activeTab === 'sobre' && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-violet-500 rounded-full" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('atividades')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative shrink-0 ${
                    activeTab === 'atividades'
                      ? 'text-white bg-white/[0.04] border border-white/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <Code2 className="size-3.5 text-violet-400" />
                  <span>Atividades Práticas</span>
                  <span
                    className={`size-4 rounded-full text-[9px] font-black grid place-items-center ${
                      doneLessonActivities.length === lessonActivities.length && lessonActivities.length > 0
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-violet-950/80 border border-violet-500/40 text-violet-300'
                    }`}
                  >
                    {lessonActivities.length}
                  </span>
                  {activeTab === 'atividades' && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-violet-500 rounded-full" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('materiais')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative shrink-0 ${
                    activeTab === 'materiais'
                      ? 'text-white bg-white/[0.04] border border-white/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <FileText className="size-3.5 text-violet-400" />
                  <span>Materiais</span>
                  <span className="size-4 rounded-full bg-violet-950/80 border border-violet-500/40 text-[9px] font-black text-violet-300 grid place-items-center">
                    2
                  </span>
                  {activeTab === 'materiais' && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-violet-500 rounded-full" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('transcricao')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative shrink-0 ${
                    activeTab === 'transcricao'
                      ? 'text-white bg-white/[0.04] border border-white/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <FileCode2 className="size-3.5 text-violet-400" />
                  <span>Transcrição</span>
                  {activeTab === 'transcricao' && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-violet-500 rounded-full" />
                  )}
                </button>
              </div>

              {/* Right Action Icons & Completion Button */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Like / Dislike */}
                <div className="flex items-center rounded-xl bg-white/[0.03] border border-white/5 p-0.5">
                  <button
                    type="button"
                    onClick={() => setIsLiked(isLiked === true ? null : true)}
                    className={`p-2 rounded-lg text-xs transition-colors ${
                      isLiked === true ? 'text-violet-400 bg-violet-950/40' : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Gostei da aula"
                  >
                    <ThumbsUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLiked(isLiked === false ? null : false)}
                    className={`p-2 rounded-lg text-xs transition-colors ${
                      isLiked === false ? 'text-rose-400 bg-rose-950/40' : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Não gostei"
                  >
                    <ThumbsDown className="size-3.5" />
                  </button>
                </div>

                {/* Bookmark */}
                <button
                  type="button"
                  onClick={() => {
                    setIsBookmarked(!isBookmarked)
                    toast.success(isBookmarked ? 'Removido dos salvos' : 'Aula salva nos favoritos!')
                  }}
                  className={`p-2.5 rounded-xl border text-xs transition-colors ${
                    isBookmarked
                      ? 'bg-violet-950/40 border-violet-500/40 text-violet-400'
                      : 'bg-white/[0.03] border-white/5 text-zinc-400 hover:text-white'
                  }`}
                  title="Salvar aula"
                >
                  {isBookmarked ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
                </button>

                {/* Mark as Completed Button */}
                <Button
                  onClick={handleComplete}
                  className={`gap-2 font-bold text-xs px-4 py-2 rounded-xl transition-all ${
                    isCompleted
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-md shadow-purple-600/30 border border-violet-400/30'
                  }`}
                >
                  <CheckCircle2 className={`size-3.5 ${isCompleted ? 'text-emerald-400' : ''}`} />
                  {isCompleted ? 'Marcar como assistida' : 'Marcar como assistida (+50 XP)'}
                </Button>
              </div>
            </div>

            {/* 3. Bottom Tab Content Area */}
            {activeTab === 'sobre' && (
              <div className="space-y-5 rounded-3xl border border-white/5 bg-[#12111a] p-6 sm:p-7 shadow-xl">
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-violet-400">
                    Sobre a aula
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">{lesson.title}</h2>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                    {lesson.description || 'Aprenda como utilizar estruturas lógicas para criar programas mais inteligentes e eficientes.'}
                  </p>
                </div>

                {/* Clean Meta Information Section */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Dificuldade</span>
                    <strong className="text-xs text-white font-bold">Iniciante</strong>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Duração</span>
                    <strong className="text-xs text-white font-bold">{lesson.durationMin || 25} min</strong>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Módulo</span>
                    <strong className="text-xs text-white font-bold">01</strong>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Aula</span>
                    <strong className="text-xs text-violet-400 font-bold">{lesson.order.toString().padStart(2, '0')}</strong>
                  </div>
                </div>

                {/* Markdown / Lesson Summary if available */}
                {lesson.contentMarkdown && (
                  <div className="pt-4 border-t border-white/5 text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap">
                    {lesson.contentMarkdown}
                  </div>
                )}

                {/* Navigation Between Lessons */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  {prevLesson ? (
                    <Link href={`/aulas/${prevLesson.id}`}>
                      <Button variant="outline" size="sm" className="gap-2 text-xs font-bold rounded-xl border-white/10 text-zinc-300 hover:text-white">
                        <ArrowLeft className="size-3.5" /> Aula Anterior ({prevLesson.order.toString().padStart(2, '0')})
                      </Button>
                    </Link>
                  ) : (
                    <div />
                  )}

                  {nextLesson ? (
                    <Link href={`/aulas/${nextLesson.id}`}>
                      <Button size="sm" className="gap-2 text-xs font-black px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-purple-600/30">
                        Próxima Aula ({nextLesson.order.toString().padStart(2, '0')}) <ArrowRight className="size-3.5" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/exercicios">
                      <Button size="sm" className="gap-2 text-xs font-black px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30">
                        Ir para Atividades Práticas <ArrowRight className="size-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'atividades' && (
              <div className="space-y-6 rounded-3xl border border-white/5 bg-[#12111a] p-6 sm:p-7 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-violet-400">
                        Fixação Pedagógica
                      </span>
                      <Badge className="bg-violet-950 border border-violet-500/30 text-violet-300 text-[10px] font-bold">
                        {doneLessonActivities.length}/{lessonActivities.length} Concluídas
                      </Badge>
                    </div>
                    <h3 className="text-lg font-black text-white">Atividades Práticas da Aula</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleGenerateLessonActivities}
                      disabled={isGeneratingActivities}
                      className="text-xs font-bold rounded-xl border-violet-500/30 bg-violet-950/20 text-violet-300 hover:bg-violet-900/30 gap-1.5"
                    >
                      <Sparkles className="size-3.5" />
                      {isGeneratingActivities ? 'Gerando com IA...' : 'Gerar Novas Atividades'}
                    </Button>

                    <Link href="/exercicios">
                      <Button size="sm" variant="ghost" className="text-xs font-bold text-zinc-400 hover:text-white gap-1">
                        Abrir Laboratório <ChevronRight className="size-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {lessonActivities.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center space-y-3 bg-black/20">
                    <Code2 className="size-8 text-violet-400 mx-auto" />
                    <h4 className="text-sm font-bold text-white">Nenhuma atividade gerada ainda para esta aula</h4>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto font-medium">
                      O motor pedagógico de IA pode gerar desafios e perguntas práticas contextualizadas exatamente com base no conteúdo desta aula.
                    </p>
                    <Button
                      size="sm"
                      onClick={handleGenerateLessonActivities}
                      disabled={isGeneratingActivities}
                      className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs gap-1.5"
                    >
                      <Sparkles className="size-3.5" />
                      {isGeneratingActivities ? 'Gerando Atividades...' : 'Gerar Atividades Agora'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {lessonActivities.map((act, index) => {
                      const isDone = completedActivities.includes(act.id)
                      const fb = submissionFeedback[act.id]

                      return (
                        <div
                          key={act.id}
                          className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-4 shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className="bg-violet-950 border border-violet-500/30 text-violet-300 text-[10px] font-bold">
                                Atividade #{index + 1}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] border-white/10 text-zinc-400 font-bold">
                                {act.difficulty.toUpperCase()}
                              </Badge>
                              <span className="text-[11px] font-semibold text-zinc-400">{act.technology}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-violet-400">+{act.xpReward} XP</span>
                              {isDone && (
                                <Badge className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold gap-1">
                                  <CheckCircle2 className="size-3" /> Concluída
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="text-sm font-bold text-white">{act.title}</h4>
                            <p className="text-xs text-zinc-300 font-medium leading-relaxed whitespace-pre-wrap">
                              {act.statement}
                            </p>
                          </div>

                          {/* Options or Code Editor */}
                          {act.type === 'multiple_choice' || act.type === 'true_false' ? (
                            <div className="space-y-2 pt-1">
                              {(act.options || []).map((opt, oIdx) => {
                                const isSelected = selectedOptions[act.id] === oIdx
                                return (
                                  <div
                                    key={oIdx}
                                    onClick={() => setSelectedOptions((prev) => ({ ...prev, [act.id]: oIdx }))}
                                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                                      isSelected
                                        ? 'border-violet-500 bg-violet-950/40 text-white font-semibold'
                                        : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:border-white/15'
                                    }`}
                                  >
                                    <div
                                      className={`size-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                                        isSelected
                                          ? 'border-violet-500 bg-violet-600 text-white'
                                          : 'border-white/20 bg-white/5 text-zinc-500'
                                      }`}
                                    >
                                      {String.fromCharCode(65 + oIdx)}
                                    </div>
                                    <span className="leading-snug">{opt}</span>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="space-y-2 pt-1">
                              <Textarea
                                value={codeAnswers[act.id] !== undefined ? codeAnswers[act.id] : act.codeStarter || ''}
                                onChange={(e) =>
                                  setCodeAnswers((prev) => ({ ...prev, [act.id]: e.target.value }))
                                }
                                placeholder="// Digite seu código de resposta aqui..."
                                className="font-mono text-xs text-emerald-300 min-h-[120px] bg-black/60 border-white/10 rounded-xl"
                              />
                            </div>
                          )}

                          {/* Feedback / Hints */}
                          {fb && (
                            <div
                              className={`p-3 rounded-xl border text-xs leading-relaxed ${
                                fb.isCorrect
                                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                                  : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                              }`}
                            >
                              <p className="font-semibold">{fb.feedback}</p>
                              {fb.hint && (
                                <p className="mt-1 text-[11px] text-amber-300">
                                  💡 <strong>Dica:</strong> {fb.hint}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => handleAnswerActivity(act.id, act.type)}
                              className="text-xs font-bold rounded-xl bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 gap-1.5 shadow-md shadow-violet-600/20"
                            >
                              <Play className="size-3 fill-white" /> Enviar Resposta
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'materiais' && (
              <div className="space-y-4 rounded-3xl border border-white/5 bg-[#12111a] p-6 shadow-xl">
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-violet-400">
                    Materiais Complementares
                  </span>
                  <h3 className="text-base font-black text-white">Recursos e Arquivos para Download</h3>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 pt-2">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-violet-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-xl bg-violet-950/60 text-violet-400 border border-violet-500/30">
                        <FileText className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Slides da Aula #{lesson.order}</p>
                        <span className="text-[10px] text-zinc-500">PDF • 2.4 MB</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white p-2" title="Baixar material">
                      <Download className="size-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-violet-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-xl bg-violet-950/60 text-violet-400 border border-violet-500/30">
                        <FileCode2 className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Código Fonte do Exemplo</p>
                        <span className="text-[10px] text-zinc-500">ZIP • 140 KB</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white p-2" title="Baixar código">
                      <Download className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transcricao' && (
              <div className="space-y-4 rounded-3xl border border-white/5 bg-[#12111a] p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-violet-400">
                      Transcrição & Notas
                    </span>
                    <h3 className="text-base font-black text-white">Anotações da Aula</h3>
                  </div>

                  <Button
                    size="sm"
                    onClick={handleSaveNote}
                    disabled={isSavingNote}
                    className="gap-1.5 text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white rounded-xl"
                  >
                    <Save className="size-3.5" /> {isSavingNote ? 'Salvando...' : 'Salvar Nota'}
                  </Button>
                </div>

                <Textarea
                  rows={6}
                  placeholder="Escreva suas anotações pessoais desta aula..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="text-xs font-mono bg-black/40 border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus-visible:ring-violet-500"
                />
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: Fixed dark course-content panel (~25% width) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4 lg:sticky lg:top-20">
            <div className="rounded-3xl border border-white/5 bg-[#12111a] shadow-2xl overflow-hidden">
              {/* Sidebar Header: "Conteúdo" + Filter icon */}
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.01]">
                <h3 className="text-sm font-black text-white">Conteúdo</h3>
                <button
                  type="button"
                  className="grid size-7 place-items-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  title="Filtros de conteúdo"
                >
                  <SlidersHorizontal className="size-3.5" />
                </button>
              </div>

              {/* Course Chapter / Module Header: "Aulas" | "18 aulas • 02:36:06" */}
              <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-extrabold text-white">Aulas</h4>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {moduleLessons.length} aulas • {formattedModuleDuration}
                  </span>
                </div>
              </div>

              {/* Scrollable Lesson List */}
              <div className="max-h-[640px] overflow-y-auto p-2 space-y-1 scrollbar-thin">
                {moduleLessons.map((l) => {
                  const isCurrent = l.id === lesson.id
                  const isDone = completedLessons.includes(l.id)
                  const isLocked = false // All current official lessons unlocked in player

                  return (
                    <Link
                      key={l.id}
                      href={`/aulas/${l.id}`}
                      className={`flex items-center justify-between gap-3 rounded-xl p-3 text-xs transition-all duration-200 group ${
                        isCurrent
                          ? 'border border-violet-500/60 bg-violet-950/40 text-white shadow-lg shadow-purple-950/40 font-bold'
                          : isDone
                          ? 'border border-transparent bg-white/[0.01] text-zinc-300 hover:bg-white/[0.03] hover:text-white'
                          : 'border border-transparent text-zinc-400 hover:bg-white/[0.03] hover:text-white'
                      }`}
                    >
                      {/* Left: Video / Check Icon + Lesson Title */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="shrink-0">
                          {isDone ? (
                            <CheckCircle2 className="size-4 text-emerald-400" />
                          ) : isCurrent ? (
                            <Video className="size-4 text-violet-400 fill-violet-400/20" />
                          ) : isLocked ? (
                            <Lock className="size-3.5 text-zinc-600" />
                          ) : (
                            <Video className="size-4 text-zinc-600 group-hover:text-zinc-400" />
                          )}
                        </span>
                        <span className="truncate text-xs font-medium group-hover:font-semibold">
                          {l.title}
                        </span>
                      </div>

                      {/* Right: Duration */}
                      <span className="shrink-0 text-[10px] font-mono text-zinc-500 group-hover:text-zinc-400">
                        00:{l.durationMin ? l.durationMin.toString().padStart(2, '0') : '25'}:00
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
