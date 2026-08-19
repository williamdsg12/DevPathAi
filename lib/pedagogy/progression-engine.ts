/**
 * Progression Engine — DevPath AI
 *
 * Implements the strict sequential EdTech LMS progression model:
 * APRENDER (Aula) -> PRATICAR (Atividade Obrigatória) -> DOMINAR -> AVANÇAR (Próxima Aula)
 *
 * Fundamental Business Rule:
 * lesson_completed AND activity_completed = next_lesson_unlocked
 *
 * A lesson N+1 CANNOT be unlocked solely by watching the video of lesson N.
 * It strictly requires completion of both the video and the mandatory activity.
 */

import type {
  Course,
  LearningActivity,
  LearningModule,
  Lesson,
  PersistedState,
  UserProfile,
} from '@/lib/types'
import { isSuperAdmin } from '@/lib/auth/rbac'

export type LessonStepStatus =
  | 'LOCKED'               // Preceding lesson/activity not completed. Access blocked.
  | 'AVAILABLE'            // Unlocked, ready to learn.
  | 'IN_PROGRESS'          // Video started / watched partially.
  | 'LESSON_COMPLETED'     // Video completed, but mandatory activity is pending.
  | 'ACTIVITY_PENDING'     // Alias for LESSON_COMPLETED.
  | 'ACTIVITY_IN_PROGRESS' // Activity opened/attempted.
  | 'ACTIVITY_COMPLETED'   // Activity submitted and approved.
  | 'COMPLETED'            // Both lesson video and activity 100% completed.

export interface LessonMissionDetails {
  lessonId: string
  lessonOrder: number
  title: string
  description?: string
  durationMin: number
  status: LessonStepStatus
  isUnlocked: boolean
  isVideoCompleted: boolean
  isActivityCompleted: boolean
  activitiesCount: number
  totalXp: number
  blockReason?: string
  ctaText: string
  ctaHref: string
}

export interface CourseProgressDetails {
  courseId: string
  courseTitle: string
  totalLessons: number
  completedLessonsCount: number
  totalActivities: number
  completedActivitiesCount: number
  totalSteps: number
  completedSteps: number
  progressPercent: number
  isAllLessonsCompleted: boolean
  isAllActivitiesCompleted: boolean
  canTakeAssessment: boolean
  isCourseCompleted: boolean
  assessmentScore: number | null
  passingScore: number
  currentActiveLesson: Lesson | null
  nextRecommendedStep: {
    type: 'LESSON' | 'ACTIVITY' | 'ASSESSMENT' | 'COMPLETED'
    title: string
    description: string
    href: string
    actionLabel: string
    lessonId?: string
    moduleId?: string
  }
}

export const DEFAULT_PASSING_SCORE = 70

export class ProgressionEngine {
  /**
   * Checks whether a lesson requires a mandatory activity based on explicit flags,
   * registered activities or smart pedagogical heuristics.
   */
  public doesLessonRequireActivity(
    lesson: Lesson,
    activities: LearningActivity[],
  ): boolean {
    if (!lesson) return false
    if (typeof lesson.hasActivity === 'boolean') {
      return lesson.hasActivity
    }
    const lessonActs = activities.filter((a) => a.lessonId === lesson.id)
    if (lessonActs.length > 0) return true

    const t = (lesson.title || '').toLowerCase()
    if (
      t.includes('seja bem vindo') ||
      t.includes('apresentação') ||
      t.includes('apresentacao') ||
      t.includes('o que é') ||
      t.includes('o que e') ||
      t.includes('instalação') ||
      t.includes('instalacao') ||
      t.includes('configuração') ||
      t.includes('configuracao') ||
      t.includes('introdução') ||
      t.includes('introducao')
    ) {
      return false
    }
    return true
  }

  /**
   * Checks if the student has completed the mandatory activity for a specific lesson.
   * If the lesson is purely demonstrative/conceptual and does not require an activity, returns true.
   */
  public hasCompletedLessonActivity(
    lesson: Lesson | string,
    completedActivities: string[],
    activities: LearningActivity[],
    allLessons?: Lesson[],
  ): boolean {
    const lessonObj = typeof lesson === 'string'
      ? (allLessons || []).find((l) => l.id === lesson)
      : lesson
    const lessonId = typeof lesson === 'string' ? lesson : lesson.id

    if (lessonObj && !this.doesLessonRequireActivity(lessonObj, activities)) {
      return true
    }

    const lessonActs = activities.filter((a) => a.lessonId === lessonId)
    // If there are activities registered for this lesson, at least 1 must be completed
    if (lessonActs.length > 0) {
      return lessonActs.some((act) => completedActivities.includes(act.id))
    }
    // If no activities were created yet for this lesson, check if exercise alias was marked
    return completedActivities.includes(`act-${lessonId}`) || completedActivities.includes(lessonId)
  }

  /**
   * Computes the real, canonical status of a lesson within its sequence.
   */
  public getLessonStepStatus(
    lesson: Lesson,
    sequenceLessons: Lesson[],
    state: {
      profile: UserProfile | null
      completedLessons: string[]
      completedActivities: string[]
      activities: LearningActivity[]
      lessonProgressMap?: Record<string, { watchPercentage: number }>
    },
  ): LessonStepStatus {
    const { profile, completedLessons, completedActivities, activities, lessonProgressMap } = state
    const requiresActivity = this.doesLessonRequireActivity(lesson, activities)

    // 1. Super Admin has unrestricted access to all lessons
    if (isSuperAdmin(profile)) {
      const isVidDone = completedLessons.includes(lesson.id)
      const isActDone = this.hasCompletedLessonActivity(lesson, completedActivities, activities, sequenceLessons)
      if (isVidDone && isActDone) return 'COMPLETED'
      if (isVidDone && requiresActivity) return 'ACTIVITY_PENDING'
      return 'AVAILABLE'
    }

    const isVideoDone = completedLessons.includes(lesson.id)
    const isActivityDone = this.hasCompletedLessonActivity(lesson, completedActivities, activities, sequenceLessons)

    // If both video and activity (or video alone if no activity required) are done -> COMPLETED
    if (isVideoDone && isActivityDone) {
      return 'COMPLETED'
    }

    // Check if this lesson is unlocked in the sequence
    const sorted = [...sequenceLessons].sort((a, b) => a.order - b.order)
    const lessonIdx = sorted.findIndex((l) => l.id === lesson.id)

    // First lesson in sequence is available by default
    if (lessonIdx === 0) {
      if (isVideoDone && !isActivityDone && requiresActivity) return 'ACTIVITY_PENDING'
      const progress = lessonProgressMap?.[lesson.id]?.watchPercentage ?? 0
      if (progress > 0) return 'IN_PROGRESS'
      return 'AVAILABLE'
    }

    // Preceding lesson in the sequence must have BOTH video and activity completed
    const prevLesson = sorted[lessonIdx - 1]
    if (prevLesson) {
      const prevVideoDone = completedLessons.includes(prevLesson.id)
      const prevActivityDone = this.hasCompletedLessonActivity(prevLesson, completedActivities, activities, sequenceLessons)

      if (!prevVideoDone || !prevActivityDone) {
        return 'LOCKED'
      }
    }

    // This lesson is unlocked:
    if (isVideoDone && !isActivityDone && requiresActivity) {
      return 'ACTIVITY_PENDING'
    }

    const progress = lessonProgressMap?.[lesson.id]?.watchPercentage ?? 0
    if (progress > 0) return 'IN_PROGRESS'
    return 'AVAILABLE'
  }

  /**
   * Returns whether a lesson is unlocked for the student.
   */
  public isLessonUnlocked(
    lessonId: string,
    sequenceLessons: Lesson[],
    state: {
      profile: UserProfile | null
      completedLessons: string[]
      completedActivities: string[]
      activities: LearningActivity[]
    },
  ): boolean {
    if (isSuperAdmin(state.profile)) return true

    const lesson = sequenceLessons.find((l) => l.id === lessonId)
    if (!lesson) return false

    const status = this.getLessonStepStatus(lesson, sequenceLessons, state)
    return status !== 'LOCKED'
  }

  /**
   * Generates mission details for a lesson card in a course syllabus.
   */
  public getLessonMissionDetails(
    lesson: Lesson,
    sequenceLessons: Lesson[],
    state: {
      profile: UserProfile | null
      completedLessons: string[]
      completedActivities: string[]
      activities: LearningActivity[]
      lessonProgressMap?: Record<string, { watchPercentage: number }>
    },
  ): LessonMissionDetails {
    const status = this.getLessonStepStatus(lesson, sequenceLessons, state)
    const isUnlocked = status !== 'LOCKED'
    const isVideoCompleted = state.completedLessons.includes(lesson.id)
    const isActivityCompleted = this.hasCompletedLessonActivity(lesson, state.completedActivities, state.activities, sequenceLessons)
    const requiresActivity = this.doesLessonRequireActivity(lesson, state.activities)
    const lessonActs = state.activities.filter((a) => a.lessonId === lesson.id)
    const primaryAct = lessonActs[0]

    let blockReason: string | undefined
    let ctaText = 'Começar Aula'
    let ctaHref = `/aulas/${lesson.id}`

    const sorted = [...sequenceLessons].sort((a, b) => a.order - b.order)
    const lessonIdx = sorted.findIndex((l) => l.id === lesson.id)

    if (status === 'LOCKED' && lessonIdx > 0) {
      const prev = sorted[lessonIdx - 1]
      const prevVid = state.completedLessons.includes(prev.id)
      const prevAct = this.hasCompletedLessonActivity(prev, state.completedActivities, state.activities, sequenceLessons)

      if (!prevVid) {
        blockReason = `Conclua o vídeo da Aula ${prev.order || lessonIdx} para continuar.`
      } else if (!prevAct) {
        blockReason = `Conclua a atividade da Aula ${prev.order || lessonIdx} para continuar.`
      } else {
        blockReason = `Conclua as etapas anteriores para desbloquear esta missão.`
      }
      ctaText = 'Bloqueada'
    } else if (status === 'ACTIVITY_PENDING' || (isVideoCompleted && !isActivityCompleted && requiresActivity)) {
      ctaText = '⚡ Fazer Atividade da Missão'
      ctaHref = primaryAct ? `/exercicios/${primaryAct.id}` : `/exercicios?lessonId=${lesson.id}`
    } else if (status === 'IN_PROGRESS') {
      ctaText = 'Continuar Assistindo'
      ctaHref = `/aulas/${lesson.id}`
    } else if (status === 'COMPLETED') {
      ctaText = 'Revisar Aula'
      ctaHref = `/aulas/${lesson.id}`
    }

    return {
      lessonId: lesson.id,
      lessonOrder: lesson.order || lessonIdx + 1,
      title: lesson.title,
      description: lesson.description,
      durationMin: lesson.durationMin || 20,
      status,
      isUnlocked,
      isVideoCompleted,
      isActivityCompleted,
      activitiesCount: Math.max(1, lessonActs.length),
      totalXp: 50 + (lessonActs.length > 0 ? lessonActs[0].xpReward : 25),
      blockReason,
      ctaText,
      ctaHref,
    }
  }

  /**
   * Computes the complete course progress metrics based on real database state.
   */
  public getCourseProgressDetails(
    course: Course,
    courseModules: LearningModule[],
    courseLessons: Lesson[],
    state: {
      profile: UserProfile | null
      completedLessons: string[]
      completedActivities: string[]
      activities: LearningActivity[]
      moduleProgress?: Record<string, { assessmentScore?: number | null }>
      assessments?: Record<string, { minScore?: number }>
    },
  ): CourseProgressDetails {
    const sortedLessons = [...courseLessons].sort((a, b) => a.order - b.order)
    const totalLessons = sortedLessons.length

    let completedLessonsCount = 0
    let completedActivitiesCount = 0

    sortedLessons.forEach((l) => {
      if (state.completedLessons.includes(l.id)) {
        completedLessonsCount++
      }
      if (this.hasCompletedLessonActivity(l.id, state.completedActivities, state.activities)) {
        completedActivitiesCount++
      }
    })

    const totalSteps = totalLessons * 2 // Each lesson = Video step + Activity step
    const completedSteps = completedLessonsCount + completedActivitiesCount
    const progressPercent = totalSteps > 0 ? Math.min(100, Math.round((completedSteps / totalSteps) * 100)) : 0

    const isAllLessonsCompleted = totalLessons > 0 && completedLessonsCount >= totalLessons
    const isAllActivitiesCompleted = totalLessons > 0 && completedActivitiesCount >= totalLessons
    const canTakeAssessment = isAllLessonsCompleted && isAllActivitiesCompleted

    // Assessment evaluation
    const primaryModule = courseModules[0]
    const moduleId = primaryModule?.id || course.id
    const modProg = state.moduleProgress?.[moduleId]
    const assessmentScore = modProg?.assessmentScore ?? null
    const passingScore = state.assessments?.[moduleId]?.minScore || DEFAULT_PASSING_SCORE
    const isCourseCompleted = canTakeAssessment && assessmentScore !== null && assessmentScore >= passingScore

    // Find current active lesson (first non-completed unlocked lesson or activity)
    let currentActiveLesson: Lesson | null = null
    for (const l of sortedLessons) {
      const isVid = state.completedLessons.includes(l.id)
      const isAct = this.hasCompletedLessonActivity(l.id, state.completedActivities, state.activities)
      if (!isVid || !isAct) {
        currentActiveLesson = l
        break
      }
    }
    if (!currentActiveLesson && sortedLessons.length > 0) {
      currentActiveLesson = sortedLessons[0]
    }

    // Determine the next recommended action
    let nextRecommendedStep: CourseProgressDetails['nextRecommendedStep']

    if (isCourseCompleted) {
      nextRecommendedStep = {
        type: 'COMPLETED',
        title: 'Curso Concluído com Sucesso!',
        description: 'Você dominou todas as aulas, atividades e passou na avaliação final.',
        href: `/certificados`,
        actionLabel: 'Ver Certificado Oficial',
      }
    } else if (canTakeAssessment) {
      nextRecommendedStep = {
        type: 'ASSESSMENT',
        title: 'Avaliação Final do Curso Liberada!',
        description: 'Você concluiu todas as aulas e atividades. Realize a prova final para certificar seu conhecimento.',
        href: `/avaliacoes/${moduleId}`,
        actionLabel: 'Fazer Avaliação Oficial',
        moduleId,
      }
    } else if (currentActiveLesson) {
      const isVidDone = state.completedLessons.includes(currentActiveLesson.id)
      if (isVidDone) {
        nextRecommendedStep = {
          type: 'ACTIVITY',
          title: `Atividade Obrigatória — Aula ${currentActiveLesson.order}: ${currentActiveLesson.title}`,
          description: 'Coloque em prática o que aprendeu no vídeo para desbloquear a próxima aula.',
          href: `/aulas/${currentActiveLesson.id}?tab=atividades`,
          actionLabel: 'Fazer Atividade (+25 XP)',
          lessonId: currentActiveLesson.id,
        }
      } else {
        nextRecommendedStep = {
          type: 'LESSON',
          title: `Aula ${currentActiveLesson.order}: ${currentActiveLesson.title}`,
          description: currentActiveLesson.description || 'Assista ao conteúdo desta aula.',
          href: `/aulas/${currentActiveLesson.id}`,
          actionLabel: 'Começar Aula',
          lessonId: currentActiveLesson.id,
        }
      }
    } else {
      nextRecommendedStep = {
        type: 'LESSON',
        title: 'Iniciar Curso',
        description: 'Comece pela primeira aula da trilha.',
        href: sortedLessons[0] ? `/aulas/${sortedLessons[0].id}` : `/cursos`,
        actionLabel: 'Iniciar Curso Agora',
      }
    }

    return {
      courseId: course.id,
      courseTitle: course.title,
      totalLessons,
      completedLessonsCount,
      totalActivities: totalLessons,
      completedActivitiesCount,
      totalSteps,
      completedSteps,
      progressPercent,
      isAllLessonsCompleted,
      isAllActivitiesCompleted,
      canTakeAssessment,
      isCourseCompleted,
      assessmentScore,
      passingScore,
      currentActiveLesson,
      nextRecommendedStep,
    }
  }
}

export const progressionEngine = new ProgressionEngine()
