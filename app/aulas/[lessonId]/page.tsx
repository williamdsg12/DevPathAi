'use client'

import { use, useEffect, useState, useMemo } from 'react'
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
  RotateCcw,
  Save,
  SlidersHorizontal,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Tv,
  Unlock,
  Video,
  Zap,
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
import { progressionEngine } from '@/lib/pedagogy/progression-engine'
import type { LearningActivity, Lesson } from '@/lib/types'

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
    activities,
    completedActivities,
    isLessonUnlocked,
  } = useAppStore()

  const lesson: Lesson =
    allLessons.find((l) => l.id === lessonId) ||
    allLessons.find((l) => l.id === 'l-logica-1') ||
    allLessons[0]

  const currentModule =
    allModules.find((m) => m.id === lesson?.moduleId || m.lessonIds.includes(lesson?.id)) ||
    allModules.find((m) => m.id === 'mod-logica') ||
    allModules[0]

  const currentCourse =
    allCourses.find((c) => c.id === currentModule?.courseId || (lesson?.playlistId && c.playlistId === lesson.playlistId)) ||
    allCourses.find((c) => c.id === 'crs-logica') ||
    allCourses[0]

  const moduleLessons: Lesson[] = useMemo(() => {
    return allLessons
      .filter((l) => currentModule.lessonIds.includes(l.id) || l.moduleId === currentModule.id)
      .sort((a, b) => a.order - b.order)
  }, [allLessons, currentModule])

  // Check if current lesson is unlocked according to sequential progression rules
  const isCurrentLessonUnlocked = useMemo(() => {
    if (!lesson) return true
    return isLessonUnlocked(lesson.id, moduleLessons)
  }, [lesson, isLessonUnlocked, moduleLessons])

  // Lesson status checks
  const isVideoCompleted = completedLessons.includes(lesson?.id)
  const requiresActivity = useMemo(() => {
    return progressionEngine.doesLessonRequireActivity(lesson, activities)
  }, [lesson, activities])

  const lessonActivities = activities.filter((a) => a.lessonId === lesson?.id)
  const primaryActivity = lessonActsFinder()
  function lessonActsFinder(): LearningActivity | undefined {
    return lessonActivities[0] || activities.find((a) => a.id === `act-${lesson?.id}`)
  }

  const isActivityCompleted = useMemo(() => {
    if (!requiresActivity) return true
    return progressionEngine.hasCompletedLessonActivity(lesson, completedActivities, activities, moduleLessons)
  }, [requiresActivity, lesson, completedActivities, activities, moduleLessons])

  const isMissionFullyCompleted = isVideoCompleted && isActivityCompleted

  // Tabs state: Sobre | Materiais (if any) | Anotações
  const hasRealMaterials = Boolean(lesson.resources && lesson.resources.length > 0)
  const [activeTab, setActiveTab] = useState<'sobre' | 'materiais' | 'anotacoes'>('sobre')
  const [isLiked, setIsLiked] = useState<boolean | null>(null)
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false)
  const [note, setNote] = useState(lessonNotes[lesson?.id] || '')
  const [isSavingNote, setIsSavingNote] = useState(false)

  useEffect(() => {
    if (lesson?.id) {
      setNote(lessonNotes[lesson.id] || '')
    }
  }, [lesson?.id, lessonNotes])

  // Sequential Next & Prev Lessons
  const currentIdx = moduleLessons.findIndex((l) => l.id === lesson?.id)
  const prevLesson = currentIdx > 0 ? moduleLessons[currentIdx - 1] : null
  const nextLesson = currentIdx < moduleLessons.length - 1 ? moduleLessons[currentIdx + 1] : null

  function handleCompleteVideo() {
    completeLesson(lesson.id)
    toast.success('🎉 Vídeo concluído! +50 XP adicionados.')
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      })
    } catch {}

    if (requiresActivity && !isActivityCompleted) {
      toast.info('Para desbloquear a próxima aula, realize a atividade prática desta missão!')
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

  // =========================================================================
  // ACCESS GUARD GATE: URL DIRETA EM AULA BLOQUEADA
  // =========================================================================
  if (!isCurrentLessonUnlocked) {
    return (
      <AppShell title="Aula Bloqueada" subtitle="Progressão sequencial obrigatória">
        <div className="max-w-3xl mx-auto py-12 space-y-6">
          <Card className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#181324] to-[#100d1a] p-8 sm:p-10 shadow-2xl text-center space-y-6">
            <div className="size-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 grid place-items-center mx-auto shadow-lg shadow-amber-950/30">
              <Lock className="size-8" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <Badge className="bg-amber-500/20 text-amber-300 border-0 font-bold text-xs">
                ETAPA BLOQUEADA
              </Badge>
              <h2 className="text-2xl font-black text-white">
                Aula {lesson.order}: {lesson.title}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                No DevPath AI, a jornada de aprendizagem é sequencial. Para desbloquear esta aula, você precisa primeiro concluir o vídeo e a atividade prática da etapa anterior.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <Link href={`/courses/${currentCourse?.slug || currentCourse?.id || 'crs-logica'}`}>
                <Button variant="outline" size="sm" className="border-white/10 text-xs font-bold rounded-xl">
                  <ArrowLeft className="size-3.5 mr-1.5" /> Ver Trilha do Curso
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </AppShell>
    )
  }

  const activityRoute = primaryActivity
    ? `/exercicios/${primaryActivity.id}`
    : `/exercicios?lessonId=${lesson.id}`

  return (
    <AppShell title={lesson.title} subtitle={`${currentCourse?.title || 'Curso'} • ${currentModule.title}`}>
      <div className="space-y-4 pb-16">
        {/* SECOND NAVIGATION / COURSE SUB-HEADER */}
        <div className="flex items-center justify-between gap-4 py-2 px-1 border-b border-white/5 text-xs">
          {/* LEFT: Back arrow + Course title */}
          <div className="flex items-center gap-2.5 text-zinc-400 min-w-0">
            <Link
              href={`/courses/${currentCourse?.slug || currentCourse?.id || 'crs-logica'}`}
              className="grid size-8 place-items-center rounded-xl bg-white/[0.03] border border-white/5 text-zinc-400 hover:text-white hover:border-violet-500/40 transition-colors"
              title="Voltar para a Trilha de Missões"
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
              <span className="text-zinc-600 hidden sm:inline">•</span>
              <span className="text-zinc-400 text-xs hidden sm:inline truncate">
                Aula {lesson.order || currentIdx + 1} de {moduleLessons.length}
              </span>
            </div>
          </div>

          {/* RIGHT: Prev / Next Navigation Arrows */}
          <div className="flex items-center gap-1.5 shrink-0">
            {prevLesson ? (
              <Link href={`/aulas/${prevLesson.id}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2.5 text-xs font-bold border-white/5 bg-white/[0.02] text-zinc-300 hover:text-white hover:border-violet-500/40 gap-1 rounded-xl"
                  title={`Aula anterior: ${prevLesson.title}`}
                >
                  <ArrowLeft className="size-3" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>
              </Link>
            ) : null}

            {nextLesson ? (
              isMissionFullyCompleted ? (
                <Link href={`/aulas/${nextLesson.id}`}>
                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs font-black bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-md shadow-violet-600/20 gap-1 rounded-xl"
                    title={`Próxima aula: ${nextLesson.title}`}
                  >
                    <span>Próxima</span>
                    <ArrowRight className="size-3" />
                  </Button>
                </Link>
              ) : (
                <Button
                  size="sm"
                  disabled
                  className="h-8 px-3 text-xs font-bold border border-white/5 bg-white/[0.02] text-zinc-600 gap-1 rounded-xl cursor-not-allowed"
                  title="Conclua a atividade da missão para liberar a próxima aula."
                >
                  <Lock className="size-3" />
                  <span className="hidden sm:inline">Próxima (Bloqueada)</span>
                </Button>
              )
            ) : null}
          </div>
        </div>

        {/* MAIN LAYOUT: VIDEO + TABS (LEFT) | PLAYLIST (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Video Player + Dynamic Lesson Actions */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            {/* YouTube Video Player Component */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/90 shadow-2xl relative group">
              <VideoPlayer
                lessonId={lesson.id}
                videoId={lesson.videoId}
                externalVideoId={lesson.externalVideoId}
                videoUrl={lesson.videoUrl}
                sourceType={lesson.sourceType || 'youtube'}
                title={lesson.title}
                source={lesson.source || currentCourse?.channelTitle}
                thumbnailUrl={lesson.thumbnailUrl}
                durationMin={lesson.durationMin}
                availabilityStatus={lesson.availabilityStatus || (lesson.isUnavailable ? 'removed' : 'available')}
                youtubeExists={lesson.youtubeExists ?? !lesson.isUnavailable}
                embedAvailable={lesson.embedAvailable ?? true}
                isCompleted={completedLessons.includes(lesson.id)}
                onProgress={(p) => recordVideoProgress(lesson.id, p.watchedPercentage, p.lastPositionSeconds)}
                onComplete={handleCompleteVideo}
              />
            </div>

            {/* ========================================================================= */}
            {/* POST-VIDEO DYNAMIC PROGRESSION BANNERS (SEPARATED STEP CTA)               */}
            {/* ========================================================================= */}
            {isVideoCompleted && requiresActivity && !isActivityCompleted && (
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-[#18131e] to-orange-950/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-amber-400" />
                    <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                      🎉 Aula Assistida! Próximo Passo Obrigatório:
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    Resolva a atividade prática desta missão para desbloquear a próxima aula
                  </h4>
                  <p className="text-xs text-zinc-300 font-medium">
                    A atividade é realizada em tela própria e focada na fixação do conteúdo.
                  </p>
                </div>

                <div className="shrink-0">
                  <Link href={activityRoute}>
                    <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-xs px-6 py-5 rounded-xl shadow-lg shadow-amber-950/50 cursor-pointer">
                      <Zap className="size-4 mr-1.5" /> Fazer Atividade da Missão (+25 XP) →
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {isVideoCompleted && !requiresActivity && (
              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-[#0f1814] to-teal-950/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider">
                      ✓ Aula Concluída (+50 XP)
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    Esta aula é demonstrativa/conceitual e não exige atividade prática.
                  </h4>
                  {nextLesson && (
                    <p className="text-xs text-zinc-300 font-medium">
                      A Aula {nextLesson.order} foi desbloqueada diretamente na sua trilha.
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  {nextLesson ? (
                    <Link href={`/aulas/${nextLesson.id}`}>
                      <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-5 rounded-xl shadow-lg shadow-emerald-950/50">
                        <span>Ir para Aula {nextLesson.order}</span>
                        <ArrowRight className="size-4 ml-1.5" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/courses/${currentCourse.slug || currentCourse.id}`}>
                      <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-5 rounded-xl shadow-lg shadow-emerald-950/50">
                        <span>Ver Trilha do Curso</span>
                        <ArrowRight className="size-4 ml-1.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {isMissionFullyCompleted && requiresActivity && (
              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-[#0f1814] to-teal-950/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider">
                      ✓ Missão 100% Concluída (+75 XP)
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    Vídeo assistido e atividade prática aprovada com sucesso!
                  </h4>
                  {nextLesson ? (
                    <p className="text-xs text-zinc-300 font-medium">
                      A Aula {nextLesson.order} foi desbloqueada na sua trilha.
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-300 font-medium">
                      Você concluiu a última aula do módulo! A Avaliação Oficial Final está liberada.
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  {nextLesson ? (
                    <Link href={`/aulas/${nextLesson.id}`}>
                      <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-5 rounded-xl shadow-lg shadow-emerald-950/50">
                        <span>Ir para Aula {nextLesson.order}</span>
                        <ArrowRight className="size-4 ml-1.5" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/avaliacoes/${currentModule.id}`}>
                      <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-5 rounded-xl shadow-lg shadow-emerald-950/50">
                        <span>Fazer Avaliação Oficial</span>
                        <ArrowRight className="size-4 ml-1.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* ACTION & TAB TOOLBAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-white/5 bg-[#12111a]">
              {/* Tab Navigation Pill Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab('sobre')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative shrink-0 ${
                    activeTab === 'sobre'
                      ? 'text-white bg-white/[0.06] border border-white/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <BookOpen className="size-3.5 text-violet-400" />
                  <span>Sobre a Aula</span>
                </button>

                {/* Real Materials Tab (rendered ONLY if real resources exist) */}
                {hasRealMaterials && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('materiais')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative shrink-0 ${
                      activeTab === 'materiais'
                        ? 'text-white bg-white/[0.06] border border-white/10'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    <FileText className="size-3.5 text-violet-400" />
                    <span>Materiais Anexados</span>
                    <span className="size-4 rounded-full text-[9px] font-black grid place-items-center bg-violet-950/80 border border-violet-500/40 text-violet-300">
                      {lesson.resources?.length || 0}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab('anotacoes')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative shrink-0 ${
                    activeTab === 'anotacoes'
                      ? 'text-white bg-white/[0.06] border border-white/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <FileCode2 className="size-3.5 text-violet-400" />
                  <span>Anotações Pessoais</span>
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

                {/* Dynamic Main Action Button */}
                {isMissionFullyCompleted ? (
                  <Button
                    onClick={handleCompleteVideo}
                    className="gap-2 font-bold text-xs px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25"
                  >
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    <span>✓ Aula Concluída</span>
                  </Button>
                ) : isVideoCompleted && requiresActivity ? (
                  <Link href={activityRoute}>
                    <Button className="gap-2 font-black text-xs px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-md shadow-amber-950/50 cursor-pointer">
                      <Zap className="size-3.5" />
                      <span>⚡ Fazer Atividade (+25 XP)</span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={handleCompleteVideo}
                    className="gap-2 font-bold text-xs px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-md shadow-purple-600/30 border border-violet-400/30 cursor-pointer"
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span>Marcar como assistida (+50 XP)</span>
                  </Button>
                )}
              </div>
            </div>

            {/* TAB CONTENTS */}
            {activeTab === 'sobre' && (
              <div className="space-y-5 rounded-3xl border border-white/5 bg-[#12111a] p-6 sm:p-7 shadow-xl">
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-violet-400">
                    Sobre a aula
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">{lesson.title}</h2>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                    {lesson.description || 'Assista a esta aula e consolide o conteúdo na atividade prática correspondente.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Dificuldade</span>
                    <strong className="text-xs text-white font-bold">Iniciante</strong>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Duração</span>
                    <strong className="text-xs text-white font-bold">{lesson.durationMin || 20} min</strong>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Atividade Prática</span>
                    <strong className="text-xs text-violet-300 font-bold">
                      {requiresActivity ? 'Obrigatória em tela própria' : 'Não exigida (Demonstrativa)'}
                    </strong>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Status da Missão</span>
                    <strong className={`text-xs font-bold ${isMissionFullyCompleted ? 'text-emerald-400' : isVideoCompleted ? 'text-amber-400' : 'text-zinc-400'}`}>
                      {isMissionFullyCompleted ? '100% Concluída' : isVideoCompleted ? 'Atividade Pendente' : 'Vídeo Pendente'}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'materiais' && hasRealMaterials && (
              <div className="space-y-4 rounded-3xl border border-white/5 bg-[#12111a] p-6 shadow-xl">
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-violet-400">
                    Materiais Oficiais
                  </span>
                  <h3 className="text-base font-black text-white">Recursos Reais Anexados pelo Instrutor</h3>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 pt-2">
                  {lesson.resources?.map((res, idx) => (
                    <a
                      key={idx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-violet-500/30 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-xl bg-violet-950/60 text-violet-400 border border-violet-500/30">
                          {res.type === 'pdf' ? <FileText className="size-5" /> : <FileCode2 className="size-5" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">
                            {res.title}
                          </p>
                          <span className="text-[10px] text-zinc-500 uppercase">{res.type} {res.size ? `• ${res.size}` : ''}</span>
                        </div>
                      </div>
                      <ExternalLink className="size-4 text-zinc-500 group-hover:text-white" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'anotacoes' && (
              <div className="space-y-4 rounded-3xl border border-white/5 bg-[#12111a] p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-violet-400">
                      Anotações Pessoais
                    </span>
                    <h3 className="text-base font-black text-white">Suas Notas de Estudo</h3>
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
                  placeholder="Escreva suas anotações pessoais sobre esta aula..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="text-xs font-mono bg-black/40 border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus-visible:ring-violet-500"
                />
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: Sequential Playlist Panel with Real Lock Status */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4 lg:sticky lg:top-20">
            <div className="rounded-3xl border border-white/5 bg-[#12111a] shadow-2xl overflow-hidden">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.01]">
                <h3 className="text-sm font-black text-white">Trilha do Módulo</h3>
                <span className="text-[11px] font-mono text-zinc-500">
                  {moduleLessons.length} aulas
                </span>
              </div>

              {/* Scrollable Lesson List */}
              <div className="max-h-[640px] overflow-y-auto p-2 space-y-1 scrollbar-thin">
                {moduleLessons.map((l) => {
                  const isCurrent = l.id === lesson.id
                  const isVidDone = completedLessons.includes(l.id)
                  const reqAct = progressionEngine.doesLessonRequireActivity(l, activities)
                  const isActDone = reqAct
                    ? progressionEngine.hasCompletedLessonActivity(l, completedActivities, activities, moduleLessons)
                    : true
                  const isUnlocked = isLessonUnlocked(l.id, moduleLessons)

                  return (
                    <Link
                      key={l.id}
                      href={isUnlocked ? `/aulas/${l.id}` : '#'}
                      onClick={(e) => {
                        if (!isUnlocked) {
                          e.preventDefault()
                          toast.error('Conclua as etapas anteriores para desbloquear esta aula.')
                        }
                      }}
                      className={`flex items-center justify-between gap-3 rounded-xl p-3 text-xs transition-all duration-200 group ${
                        isCurrent
                          ? 'border border-violet-500/60 bg-violet-950/40 text-white shadow-lg shadow-purple-950/40 font-bold'
                          : isVidDone && isActDone
                          ? 'border border-transparent bg-white/[0.01] text-zinc-300 hover:bg-white/[0.03] hover:text-white'
                          : isUnlocked
                          ? 'border border-transparent text-zinc-300 hover:bg-white/[0.03] hover:text-white'
                          : 'border border-transparent text-zinc-600 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      {/* Left: Video / Check Icon + Lesson Title */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="shrink-0">
                          {isVidDone && isActDone ? (
                            <CheckCircle2 className="size-4 text-emerald-400" />
                          ) : isCurrent ? (
                            <Video className="size-4 text-violet-400 fill-violet-400/20" />
                          ) : !isUnlocked ? (
                            <Lock className="size-3.5 text-zinc-600" />
                          ) : isVidDone && reqAct ? (
                            <Zap className="size-3.5 text-amber-400" />
                          ) : (
                            <Video className="size-4 text-zinc-500 group-hover:text-zinc-400" />
                          )}
                        </span>
                        <span className="truncate text-xs font-medium group-hover:font-semibold">
                          Aula {l.order}: {l.title}
                        </span>
                      </div>

                      {/* Right: Duration / State */}
                      <span className="shrink-0 text-[10px] font-mono text-zinc-500">
                        {l.durationMin || 20}m
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
