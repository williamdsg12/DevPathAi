'use client'

/**
 * AppStore — Unified Data & State Access Layer for DevPath AI.
 *
 * Provides real-time state management, YouTube Channel & Course Catalog integration,
 * Supabase Auth & Database synchronization, sequential module locking/prerequisite enforcement,
 * LearningPathEngine adaptive trail synthesis, Knowledge Gaps, Skill Mastery,
 * and zero-fictitious initial state for all students.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getSupabaseClient, isSupabaseConfigured } from './supabase/client'
import {
  defaultContentSources,
  defaultOfficialCourses,
  defaultOfficialLessons,
  defaultOfficialModules,
  defaultTechnologySources,
  mockAchievements,
  mockPath,
} from './mock-data'
import { learningPathEngine } from './ai/learning-path-engine'
import { validateContentMapping } from './youtube/service'
import type {
  Achievement,
  CertificateData,
  ContentConsistencyReport,
  ContentSource,
  Course,
  DailyStudyPlan,
  DailyStudyRecord,
  Difficulty,
  ImportLog,
  IngestionReport,
  InterviewReport,
  KnowledgeGap,
  LearningModule,
  LearningPath,
  LearningProfile,
  Lesson,
  LessonProgress,
  ModuleMasteryScore,
  ModuleProgress,
  ModuleStatus,
  NotificationItem,
  OnboardingData,
  PlacementResult,
  SpacedReviewItem,
  TechnologySource,
  TrailAdaptationNotice,
  UserProfile,
  UserProject,
  YouTubePlaylist,
  YouTubeVideo,
} from './types'

const STORAGE_KEY = 'devpath-ai-state-v11-clean'

interface PersistedState {
  profile: UserProfile | null
  authed: boolean
  learningProfile: LearningProfile | null
  onboarding: OnboardingData | null
  placement: PlacementResult | null
  activePath: LearningPath
  moduleProgress: Record<string, ModuleProgress>
  lessonProgressMap: Record<string, LessonProgress>
  completedLessons: string[]
  lessonNotes: Record<string, string>
  completedExercises: string[]
  projects: UserProject[]
  achievements: Achievement[]
  difficulties: Difficulty[]
  streak: number
  studiedMinutes: number
  todayStudiedMinutes: number
  weeklyStudyRecords: DailyStudyRecord[]
  spacedReviews: SpacedReviewItem[]
  interviewReports: InterviewReport[]
  certificates: CertificateData[]
  notifications: NotificationItem[]
  // YouTube Educational Catalog & Channels
  contentSources: ContentSource[]
  courses: Course[]
  importedPlaylists: YouTubePlaylist[]
  customModules: LearningModule[]
  customLessons: Lesson[]
  technologySources: TechnologySource[]
  importLogs: ImportLog[]
}

function createInitialAchievements(): Achievement[] {
  return mockAchievements.map((a) => ({
    ...a,
    unlocked: false,
  }))
}

function createInitialWeeklyStudy(): DailyStudyRecord[] {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  return days.map((day) => ({
    day,
    date: new Date().toISOString(),
    minutes: 0,
  }))
}

function createCleanInitialState(): PersistedState {
  return {
    profile: null,
    authed: false,
    learningProfile: null,
    onboarding: null,
    placement: null,
    activePath: {
      id: 'path-init',
      title: 'Trilha Personalizada',
      goal: 'primeiro-emprego',
      area: 'fullstack',
      description: 'Sua formação estruturada a partir dos cursos e módulos reais do catálogo.',
      moduleIds: [],
      items: [],
    },
    moduleProgress: {},
    lessonProgressMap: {},
    completedLessons: [],
    lessonNotes: {},
    completedExercises: [],
    projects: [],
    achievements: createInitialAchievements(),
    difficulties: [],
    streak: 0,
    studiedMinutes: 0,
    todayStudiedMinutes: 0,
    weeklyStudyRecords: createInitialWeeklyStudy(),
    spacedReviews: [],
    interviewReports: [],
    certificates: [],
    notifications: [
      {
        id: 'notif-welcome',
        title: 'Bem-vindo ao DevPath AI! 🚀',
        message: 'Importe canais ou playlists do YouTube para alimentar seu catálogo educacional em tempo real.',
        type: 'info',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ],
    contentSources: defaultContentSources,
    courses: [],
    importedPlaylists: [],
    customModules: [],
    customLessons: [],
    technologySources: defaultTechnologySources,
    importLogs: [],
  }
}

export interface AppStoreValue extends PersistedState {
  ready: boolean
  isSupabaseOnline: boolean
  allCourses: Course[]
  allModules: LearningModule[]
  allLessons: Lesson[]
  dailyStudyPlan: DailyStudyPlan
  // Authentication & Session
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>
  signUp: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  // Onboarding & Nivelamento
  completeOnboarding: (data: OnboardingData) => void
  completePlacement: (result: PlacementResult) => void
  generateCustomPath: (customTitle?: string, customDesc?: string) => void
  resetActivePathToAdaptive: () => void
  // Educational Content Layer Management
  ingestFullChannelToStore: (payload: {
    channel: ContentSource
    playlists: YouTubePlaylist[]
    courses: Course[]
    modules: LearningModule[]
    lessons: Lesson[]
    report: IngestionReport
  }) => void
  importCourseFromPlaylist: (payload: {
    course: Course
    modules: LearningModule[]
    lessons: Lesson[]
    playlist: YouTubePlaylist
  }) => void
  importChannelPlaylists: (channel: ContentSource, playlists: YouTubePlaylist[]) => void
  syncPlaylistInStore: (playlistId: string, updatedVideos: YouTubeVideo[]) => void
  updateTechnologySource: (source: TechnologySource) => void
  updatePlaylistClassification: (playlistId: string, patch: Partial<YouTubePlaylist>) => void
  validateCatalogIntegrity: () => ContentConsistencyReport
  resetEducationalCatalog: () => Promise<{
    success: boolean
    deletedCounts: {
      courses: number
      modules: number
      lessons: number
      playlists: number
      sources: number
    }
  }>
  syncOfficialTrustedChannels: () => Promise<boolean>
  // Lessons & Exercises
  completeLesson: (lessonId: string) => void
  recordVideoProgress: (lessonId: string, watchPercentage: number, lastPositionSeconds: number) => void
  saveLessonNote: (lessonId: string, note: string) => void
  completeExercise: (exerciseId: string) => void
  recordDifficulty: (topic: string) => void
  // Assessments & Projects
  submitAssessment: (moduleId: string, score: number) => void
  submitModuleProject: (moduleId: string, submission: { githubUrl: string; deployUrl?: string; description?: string }) => void
  addProject: (p: Omit<UserProject, 'id' | 'createdAt'>) => void
  updateProject: (id: string, patch: Partial<UserProject>) => void
  deleteProject: (id: string) => void
  // Reviews & Study Sessions
  completeSpacedReview: (reviewId: string) => void
  recordStudySession: (minutes: number, type?: string) => void
  addInterviewReport: (report: InterviewReport) => void
  generateCertificate: (pathTitle?: string) => CertificateData
  // Profile & Settings
  updateProfile: (patch: Partial<UserProfile>) => void
  markNotificationAsRead: (id: string) => void
  clearAllNotifications: () => void
  // Derived state & progression engine
  moduleStatus: (moduleId: string) => ModuleStatus
  isModuleUnlocked: (moduleId: string) => boolean
  getModuleMastery: (moduleId: string) => ModuleMasteryScore
  overallProgress: number
  xp: number
  level: number
  currentModuleId: string | null
  nextPendingLessonId: string | null
}

const AppStoreContext = createContext<AppStoreValue | null>(null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(createCleanInitialState)
  const [ready, setReady] = useState(false)
  const [isSupabaseOnline, setIsSupabaseOnline] = useState(false)

  // Initialize and load persisted data
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setState((prev) => ({
          ...prev,
          ...parsed,
          contentSources: parsed.contentSources?.length ? parsed.contentSources : defaultContentSources,
          courses: Array.isArray(parsed.courses) ? parsed.courses : [],
          customModules: Array.isArray(parsed.customModules) ? parsed.customModules : [],
          customLessons: Array.isArray(parsed.customLessons) ? parsed.customLessons : [],
          technologySources: parsed.technologySources?.length ? parsed.technologySources : defaultTechnologySources,
        }))
      }
    } catch (e) {
      console.warn('Could not load cached state:', e)
    }

    const client = getSupabaseClient()
    if (client && isSupabaseConfigured()) {
      setIsSupabaseOnline(true)
      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setState((s) => ({
            ...s,
            authed: true,
            profile: {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Desenvolvedor',
              email: session.user.email || '',
              avatarUrl: session.user.user_metadata?.avatar_url,
              createdAt: session.user.created_at,
              onboarded: s.profile?.onboarded ?? false,
              placementDone: s.profile?.placementDone ?? false,
            },
          }))
        }
      }).catch((err) => {
        console.warn('Supabase auth session notice:', err)
      })

      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setState((s) => ({
            ...s,
            authed: true,
            profile: s.profile
              ? { ...s.profile, id: session.user.id, email: session.user.email || s.profile.email }
              : {
                  id: session.user.id,
                  name: session.user.user_metadata?.name || 'Desenvolvedor',
                  email: session.user.email || '',
                  createdAt: session.user.created_at,
                  onboarded: false,
                  placementDone: false,
                },
          }))
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }

    setReady(true)
  }, [])

  // Persist state
  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // quota safeguard
    }
  }, [state, ready])

  // Single Source of Truth for Educational Catalog: State/Database 100%
  const allCourses = useMemo(() => {
    return state.courses
  }, [state.courses])

  const allModules = useMemo(() => {
    return state.customModules
  }, [state.customModules])

  const allLessons = useMemo(() => {
    return state.customLessons
  }, [state.customLessons])

  // --- Auth Handlers ---
  const signIn = useCallback(async (email: string, password?: string) => {
    const client = getSupabaseClient()
    if (client && isSupabaseConfigured() && password) {
      const { data, error } = await client.auth.signInWithPassword({ email, password })
      if (error) {
        return { success: false, error: error.message }
      }
      if (data.user) {
        setState((s) => ({
          ...s,
          authed: true,
          profile: {
            id: data.user.id,
            name: data.user.user_metadata?.name || email.split('@')[0],
            email: data.user.email || email,
            createdAt: data.user.created_at,
            onboarded: s.profile?.onboarded ?? false,
            placementDone: s.profile?.placementDone ?? false,
          },
        }))
        return { success: true }
      }
    }

    setState((s) => ({
      ...s,
      authed: true,
      profile: s.profile ?? {
        id: `user-${Date.now()}`,
        name: email.split('@')[0] || 'Desenvolvedor',
        email,
        createdAt: new Date().toISOString(),
        onboarded: false,
        placementDone: false,
      },
    }))
    return { success: true }
  }, [])

  const signUp = useCallback(async (name: string, email: string, password?: string) => {
    const client = getSupabaseClient()
    if (client && isSupabaseConfigured() && password) {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (error) {
        return { success: false, error: error.message }
      }
      if (data.user) {
        const cleanState = createCleanInitialState()
        setState({
          ...cleanState,
          authed: true,
          profile: {
            id: data.user.id,
            name,
            email,
            createdAt: new Date().toISOString(),
            onboarded: false,
            placementDone: false,
          },
        })
        return { success: true }
      }
    }

    const cleanState = createCleanInitialState()
    setState({
      ...cleanState,
      authed: true,
      profile: {
        id: `user-${Date.now()}`,
        name,
        email,
        createdAt: new Date().toISOString(),
        onboarded: false,
        placementDone: false,
      },
    })
    return { success: true }
  }, [])

  const signOut = useCallback(async () => {
    const client = getSupabaseClient()
    if (client && isSupabaseConfigured()) {
      await client.auth.signOut()
    }
    setState((s) => ({
      ...s,
      authed: false,
    }))
  }, [])

  // --- Onboarding & Placement & Adaptive Path Generation ---
  const completeOnboarding = useCallback((data: OnboardingData) => {
    setState((s) => {
      const learningProfile: LearningProfile = {
        userId: s.profile?.id || 'user-anon',
        programmingLevel: data.currentKnowledge,
        careerGoal: data.goal,
        desiredArea: data.area,
        desiredSpecialization: data.area === 'frontend' ? 'React & Next.js' : data.area === 'backend' ? 'Node.js & SQL' : 'Full Stack JavaScript',
        preferredTechnology: data.technologies[0] || 'JavaScript',
        secondaryTechnologies: data.technologies.slice(1),
        studyTimePerDay: data.hoursPerDay,
        studyDaysPerWeek: data.daysPerWeek,
        hasComputer: data.hasComputer,
        priorExperience: data.knownTopics.join(', '),
        knownTopics: data.knownTopics,
        unknownTopics: [],
        mainDifficulty: data.biggestDifficulty,
        learningPreference: data.learningStyle,
        professionalGoal: data.biggestGoal,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return {
        ...s,
        onboarding: data,
        learningProfile,
        profile: s.profile
          ? {
              ...s.profile,
              onboarded: true,
              desiredRole: data.goal === 'primeiro-emprego' ? 'Desenvolvedor Full Stack Júnior' : 'Desenvolvedor de Software',
              targetTechnologies: data.technologies,
            }
          : s.profile,
      }
    })
  }, [])

  const completePlacement = useCallback((result: PlacementResult) => {
    setState((s) => ({
      ...s,
      placement: result,
      profile: s.profile ? { ...s.profile, placementDone: true } : s.profile,
    }))
  }, [])

  const generateCustomPath = useCallback((customTitle?: string, customDesc?: string) => {
    setState((s) => {
      const generated = learningPathEngine.generateAdaptiveTrail(
        s.profile,
        s.onboarding,
        s.placement,
        s.courses,
        s.customModules,
        s.customLessons,
      )

      const moduleProgress = { ...s.moduleProgress }
      if (generated.path.items) {
        for (const item of generated.path.items) {
          if (!moduleProgress[item.moduleId]) {
            moduleProgress[item.moduleId] = {
              moduleId: item.moduleId,
              lessonsCompleted: 0,
              exercisesCompleted: 0,
              projectSubmitted: false,
              assessmentScore: null,
              masteryScore: 0,
              status: item.locked ? 'locked' : item.status === 'concluido' ? 'completed' : 'available',
            }
          }
        }
      }

      return {
        ...s,
        activePath: {
          ...generated.path,
          title: customTitle || generated.path.title,
          description: customDesc || generated.path.description,
        },
        moduleProgress,
        notifications: [
          ...s.notifications,
          {
            id: `notif-path-${Date.now()}`,
            title: 'Sua Trilha Adaptativa foi gerada!',
            message: 'Inicie pelo seu primeiro módulo disponível. Bons estudos!',
            type: 'success',
            read: false,
            createdAt: new Date().toISOString(),
          },
        ],
      }
    })
  }, [])

  const resetActivePathToAdaptive = useCallback(() => {
    generateCustomPath()
  }, [generateCustomPath])

  // --- Educational Catalog Ingestion & Sincronização ---
  const ingestFullChannelToStore = useCallback((payload: {
    channel: ContentSource
    playlists: YouTubePlaylist[]
    courses: Course[]
    modules: LearningModule[]
    lessons: Lesson[]
    report: IngestionReport
  }) => {
    setState((s) => {
      const existingSources = s.contentSources.filter((cs) => cs.channelId !== payload.channel.channelId)
      const existingPlIds = new Set(payload.playlists.map((p) => p.youtubePlaylistId))
      const remainingPlaylists = s.importedPlaylists.filter((p) => !existingPlIds.has(p.youtubePlaylistId))
      const existingCourseIds = new Set(payload.courses.map((c) => c.id))
      const remainingCourses = s.courses.filter((c) => !existingCourseIds.has(c.id))
      const existingModIds = new Set(payload.modules.map((m) => m.id))
      const remainingModules = s.customModules.filter((m) => !existingModIds.has(m.id))
      const existingLessonIds = new Set(payload.lessons.map((l) => l.id))
      const remainingLessons = s.customLessons.filter((l) => !existingLessonIds.has(l.id))

      const moduleProgress = { ...s.moduleProgress }
      for (const m of payload.modules) {
        if (!moduleProgress[m.id]) {
          moduleProgress[m.id] = {
            moduleId: m.id,
            lessonsCompleted: 0,
            exercisesCompleted: 0,
            projectSubmitted: false,
            assessmentScore: null,
            masteryScore: 0,
            status: m.order === 1 ? 'available' : 'locked',
          }
        }
      }

      const log: ImportLog = {
        id: `log-ingest-${Date.now()}`,
        playlistId: payload.channel.channelId || payload.channel.id,
        playlistTitle: `Catálogo de ${payload.channel.name}`,
        channelTitle: payload.channel.name,
        status: 'sucesso',
        videosFound: payload.report.totalVideosFound,
        videosImported: payload.report.totalVideosImported,
        videosUnavailable: payload.report.totalUnavailable,
        duplicatesIgnored: 0,
        message: `Canal ${payload.channel.name} ingerido com sucesso: ${payload.courses.length} cursos e ${payload.lessons.length} aulas reais catalogadas.`,
        createdAt: new Date().toISOString(),
      }

      const updatedCourses = [...payload.courses, ...remainingCourses]
      const updatedModules = [...payload.modules, ...remainingModules]
      const updatedLessons = [...payload.lessons, ...remainingLessons]

      // Auto-refresh trail if currently empty
      const generated = learningPathEngine.generateAdaptiveTrail(
        s.profile,
        s.onboarding,
        s.placement,
        updatedCourses,
        updatedModules,
        updatedLessons,
      )

      return {
        ...s,
        contentSources: [payload.channel, ...existingSources],
        importedPlaylists: [...payload.playlists, ...remainingPlaylists],
        courses: updatedCourses,
        customModules: updatedModules,
        customLessons: updatedLessons,
        moduleProgress,
        activePath: generated.path,
        importLogs: [log, ...s.importLogs],
        notifications: [
          ...s.notifications,
          {
            id: `notif-ingest-${Date.now()}`,
            title: `Canal "${payload.channel.name}" ingerido!`,
            message: `${payload.courses.length} cursos e ${payload.lessons.length} aulas integradas à plataforma.`,
            type: 'success',
            read: false,
            createdAt: new Date().toISOString(),
          },
        ],
      }
    })
  }, [])

  const importCourseFromPlaylist = useCallback((payload: {
    course: Course
    modules: LearningModule[]
    lessons: Lesson[]
    playlist: YouTubePlaylist
  }) => {
    setState((s) => {
      const filteredCourses = s.courses.filter((c) => c.id !== payload.course.id && c.playlistId !== payload.playlist.youtubePlaylistId)
      const filteredPlaylists = s.importedPlaylists.filter((p) => p.youtubePlaylistId !== payload.playlist.youtubePlaylistId)
      const existingLessonIds = new Set(payload.lessons.map((l) => l.id))
      const filteredCustomLessons = s.customLessons.filter((l) => !existingLessonIds.has(l.id))
      const existingModIds = new Set(payload.modules.map((m) => m.id))
      const filteredCustomModules = s.customModules.filter((m) => !existingModIds.has(m.id))

      const moduleProgress = { ...s.moduleProgress }
      for (const m of payload.modules) {
        if (!moduleProgress[m.id]) {
          moduleProgress[m.id] = {
            moduleId: m.id,
            lessonsCompleted: 0,
            exercisesCompleted: 0,
            projectSubmitted: false,
            assessmentScore: null,
            masteryScore: 0,
            status: 'available',
          }
        }
      }

      const newLog: ImportLog = {
        id: `log-${Date.now()}`,
        playlistId: payload.playlist.youtubePlaylistId,
        playlistTitle: payload.playlist.title,
        channelTitle: payload.playlist.channelTitle,
        status: 'sucesso',
        videosFound: payload.playlist.itemCount,
        videosImported: payload.lessons.length,
        videosUnavailable: 0,
        duplicatesIgnored: 0,
        message: `Curso "${payload.course.title}" importado com sucesso com ${payload.lessons.length} aulas reais.`,
        createdAt: new Date().toISOString(),
      }

      const updatedCourses = [payload.course, ...filteredCourses]
      const updatedModules = [...payload.modules, ...filteredCustomModules]
      const updatedLessons = [...payload.lessons, ...filteredCustomLessons]

      const generated = learningPathEngine.generateAdaptiveTrail(
        s.profile,
        s.onboarding,
        s.placement,
        updatedCourses,
        updatedModules,
        updatedLessons,
      )

      return {
        ...s,
        courses: updatedCourses,
        importedPlaylists: [payload.playlist, ...filteredPlaylists],
        customModules: updatedModules,
        customLessons: updatedLessons,
        moduleProgress,
        activePath: generated.path,
        importLogs: [newLog, ...s.importLogs],
        notifications: [
          ...s.notifications,
          {
            id: `notif-import-${Date.now()}`,
            title: `Novo curso importado: ${payload.course.title}`,
            message: `${payload.lessons.length} aulas integradas e organizadas pela IA.`,
            type: 'success',
            read: false,
            createdAt: new Date().toISOString(),
          },
        ],
      }
    })
  }, [])

  const importChannelPlaylists = useCallback((channel: ContentSource, playlists: YouTubePlaylist[]) => {
    setState((s) => {
      const existingSources = s.contentSources.filter((cs) => cs.channelId !== channel.channelId)
      const existingPlIds = new Set(playlists.map((p) => p.youtubePlaylistId))
      const remainingPlaylists = s.importedPlaylists.filter((p) => !existingPlIds.has(p.youtubePlaylistId))

      const log: ImportLog = {
        id: `log-ch-${Date.now()}`,
        playlistId: channel.channelId || channel.id,
        playlistTitle: `Catálogo de ${channel.name}`,
        channelTitle: channel.name,
        status: 'sucesso',
        videosFound: playlists.reduce((acc, p) => acc + p.itemCount, 0),
        videosImported: playlists.length,
        videosUnavailable: 0,
        duplicatesIgnored: 0,
        message: `Canal ${channel.name} importado: ${playlists.length} playlists públicas registradas.`,
        createdAt: new Date().toISOString(),
      }

      return {
        ...s,
        contentSources: [channel, ...existingSources],
        importedPlaylists: [...playlists, ...remainingPlaylists],
        importLogs: [log, ...s.importLogs],
      }
    })
  }, [])

  const syncPlaylistInStore = useCallback((playlistId: string, updatedVideos: YouTubeVideo[]) => {
    setState((s) => {
      const pl = s.importedPlaylists.find((p) => p.youtubePlaylistId === playlistId)
      const updatedPlaylists = s.importedPlaylists.map((p) =>
        p.youtubePlaylistId === playlistId ? { ...p, lastSyncedAt: new Date().toISOString(), itemCount: updatedVideos.length } : p
      )

      const targetCourse = s.courses.find((c) => c.playlistId === playlistId || c.id === `crs-${playlistId}`)
      const totalSeconds = updatedVideos.reduce((acc, v) => acc + (v.durationSeconds || 0), 0)
      const totalHours = Math.max(1, Math.round(totalSeconds / 3600))

      const updatedCourses = s.courses.map((c) =>
        c.playlistId === playlistId || c.id === `crs-${playlistId}`
          ? {
              ...c,
              lessonsCount: updatedVideos.length,
              totalHours,
              updatedAt: new Date().toISOString(),
            }
          : c
      )

      // Map new / updated lessons strictly ordered by position ASC
      const modId = `mod-${playlistId}`
      const syncedLessons: Lesson[] = updatedVideos.map((vid, idx) => ({
        id: `l-${playlistId}-${vid.youtubeVideoId}`,
        moduleId: modId,
        order: idx + 1,
        title: vid.title,
        type: 'video',
        durationMin: Math.max(5, Math.round(vid.durationSeconds / 60)),
        description: vid.description ? vid.description.slice(0, 200) + '...' : `Aula ${idx + 1} do curso ${pl?.title || targetCourse?.title || ''}.`,
        videoId: vid.youtubeVideoId,
        externalVideoId: vid.youtubeVideoId,
        videoUrl: `https://www.youtube.com/watch?v=${vid.youtubeVideoId}`,
        sourceType: 'youtube',
        availabilityStatus: 'available',
        youtubeExists: true,
        embedAvailable: true,
        source: vid.channelTitle || pl?.channelTitle || 'YouTube',
        playlistId,
        technology: vid.technology || pl?.technology || 'Desenvolvimento Web',
        topic: vid.title,
        thumbnailUrl: vid.thumbnailUrl,
        isUnavailable: false,
        lastCheckedAt: new Date().toISOString(),
      }))

      const existingLessonIds = new Set(syncedLessons.map((l) => l.id))
      const remainingCustomLessons = s.customLessons.filter((l) => l.playlistId !== playlistId && !existingLessonIds.has(l.id))

      // Update customModules to match the exact lessonIds sequence
      const updatedCustomModules = s.customModules.map((m) =>
        m.courseId === `crs-${playlistId}` || m.id === modId
          ? {
              ...m,
              lessonIds: syncedLessons.map((l) => l.id),
              estimatedHours: totalHours,
            }
          : m
      )

      const log: ImportLog = {
        id: `log-sync-${Date.now()}`,
        playlistId,
        playlistTitle: pl?.title || targetCourse?.title || playlistId,
        channelTitle: pl?.channelTitle || targetCourse?.channelTitle || 'YouTube',
        status: 'sucesso',
        videosFound: updatedVideos.length,
        videosImported: updatedVideos.length,
        videosUnavailable: 0,
        duplicatesIgnored: 0,
        message: `Sincronização executada com sucesso. ${updatedVideos.length} vídeos ordenados e sincronizados de 1 a ${updatedVideos.length}.`,
        createdAt: new Date().toISOString(),
      }

      return {
        ...s,
        courses: updatedCourses,
        importedPlaylists: updatedPlaylists,
        customModules: updatedCustomModules,
        customLessons: [...syncedLessons, ...remainingCustomLessons],
        importLogs: [log, ...s.importLogs],
      }
    })
  }, [])

  const updateTechnologySource = useCallback((source: TechnologySource) => {
    setState((s) => ({
      ...s,
      technologySources: s.technologySources.map((ts) => (ts.id === source.id ? source : ts)),
    }))
  }, [])

  const updatePlaylistClassification = useCallback((playlistId: string, patch: Partial<YouTubePlaylist>) => {
    setState((s) => ({
      ...s,
      importedPlaylists: s.importedPlaylists.map((p) =>
        p.youtubePlaylistId === playlistId ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
      ),
      courses: s.courses.map((c) =>
        c.playlistId === playlistId
          ? {
              ...c,
              technology: patch.technology || c.technology,
              category: patch.category || c.category,
              level: patch.level || c.level,
              status: (patch.status as any) || c.status,
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    }))
  }, [])

  const validateCatalogIntegrity = useCallback(() => {
    return validateContentMapping(allCourses, allModules, allLessons)
  }, [allCourses, allModules, allLessons])

  // --- Reset Educational Catalog Safely (Preserves Users & Auth) ---
  const resetEducationalCatalog = useCallback(async (): Promise<{
    success: boolean
    deletedCounts: {
      courses: number
      modules: number
      lessons: number
      playlists: number
      sources: number
    }
  }> => {
    const counts = {
      courses: state.courses.length,
      modules: state.customModules.length,
      lessons: state.customLessons.length,
      playlists: state.importedPlaylists.length,
      sources: state.contentSources.length,
    }

    const client = getSupabaseClient()
    if (client && isSupabaseConfigured()) {
      try {
        await client.rpc('reset_educational_catalog')
      } catch (err) {
        console.warn('Could not call reset_educational_catalog RPC on Supabase:', err)
      }
    }

    setState((s) => ({
      ...s,
      courses: [],
      customModules: [],
      customLessons: [],
      importedPlaylists: [],
      contentSources: [],
      importLogs: [],
      moduleProgress: {},
      completedLessons: [],
      lessonProgressMap: {},
      activePath: {
        id: `path-empty-${Date.now()}`,
        title: 'Trilha em Construção',
        goal: s.onboarding?.goal || 'primeiro-emprego',
        area: s.onboarding?.area || 'fullstack',
        description: 'O catálogo educacional ainda não possui cursos cadastrados pelo administrador.',
        moduleIds: [],
        items: [],
      },
      notifications: [
        ...s.notifications,
        {
          id: `notif-reset-${Date.now()}`,
          title: 'Catálogo Educacional Resetado',
          message: 'Todos os cursos, módulos e aulas foram removidos com sucesso. Perfis e usuários foram preservados.',
          type: 'info',
          read: false,
          createdAt: new Date().toISOString(),
        },
      ],
    }))

    return {
      success: true,
      deletedCounts: counts,
    }
  }, [state])

  // --- 1-Click Sync for Official Verified YouTube Sources ---
  const syncOfficialTrustedChannels = useCallback(async (): Promise<boolean> => {
    setState((s) => {
      const moduleProgress: Record<string, ModuleProgress> = {}
      for (const m of defaultOfficialModules) {
        moduleProgress[m.id] = {
          moduleId: m.id,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          projectSubmitted: false,
          assessmentScore: null,
          masteryScore: 0,
          status: m.order === 1 ? 'available' : 'locked',
        }
      }

      const generated = learningPathEngine.generateAdaptiveTrail(
        s.profile,
        s.onboarding,
        s.placement,
        defaultOfficialCourses,
        defaultOfficialModules,
        defaultOfficialLessons,
      )

      return {
        ...s,
        contentSources: defaultContentSources,
        courses: [...defaultOfficialCourses],
        customModules: [...defaultOfficialModules],
        customLessons: [...defaultOfficialLessons],
        moduleProgress,
        activePath: generated.path,
        notifications: [
          ...s.notifications,
          {
            id: `notif-official-${Date.now()}`,
            title: 'Fontes Oficiais Sincronizadas!',
            message: `${defaultOfficialCourses.length} cursos e ${defaultOfficialLessons.length} aulas reais importadas e catalogadas com sucesso.`,
            type: 'success',
            read: false,
            createdAt: new Date().toISOString(),
          },
        ],
      }
    })
    return true
  }, [])

  // --- Lessons & Exercises Progression ---
  const completeLesson = useCallback((lessonId: string) => {
    setState((s) => {
      if (s.completedLessons.includes(lessonId)) return s
      const allMods = s.customModules
      const lessonMod = allMods.find((m) => m.lessonIds.includes(lessonId))
      const completedLessons = [...s.completedLessons, lessonId]
      const moduleProgress = { ...s.moduleProgress }

      if (lessonMod) {
        const currentModProgress = moduleProgress[lessonMod.id] || {
          moduleId: lessonMod.id,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          projectSubmitted: false,
          assessmentScore: null,
          masteryScore: 0,
          status: 'in-progress',
        }

        const countDone = lessonMod.lessonIds.filter((id) => completedLessons.includes(id)).length
        const mastery = learningPathEngine.calculateModuleMastery(lessonMod.id, {
          ...currentModProgress,
          lessonsCompleted: countDone,
        }, lessonMod)

        moduleProgress[lessonMod.id] = {
          ...currentModProgress,
          lessonsCompleted: countDone,
          masteryScore: mastery.totalMastery,
          status: currentModProgress.status === 'locked' ? 'in-progress' : currentModProgress.status,
        }
      }

      const newReview: SpacedReviewItem = {
        id: `rev-${lessonId}-${Date.now()}`,
        topic: lessonMod?.title || 'Conceitos Fundamentais',
        moduleId: lessonMod?.id || 'mod-logica',
        moduleTitle: lessonMod?.title || 'Lógica de Programação',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        intervalDays: 1,
        question: `Qual o conceito principal abordado na aula "${lessonId}"?`,
        answer: 'Revise o conteúdo da aula e certifique-se de conseguir explicar o código com suas próprias palavras.',
        completed: false,
      }

      const studiedMinutes = s.studiedMinutes + 15
      const todayStudiedMinutes = s.todayStudiedMinutes + 15

      const achievements = s.achievements.map((ach) =>
        ach.id === 'ach-1' ? { ...ach, unlocked: true } : ach
      )

      return {
        ...s,
        completedLessons,
        moduleProgress,
        spacedReviews: [...s.spacedReviews, newReview],
        studiedMinutes,
        todayStudiedMinutes,
        streak: s.streak === 0 ? 1 : s.streak,
        achievements,
      }
    })
  }, [])

  const recordVideoProgress = useCallback((lessonId: string, watchPercentage: number, lastPositionSeconds: number) => {
    setState((s) => ({
      ...s,
      lessonProgressMap: {
        ...s.lessonProgressMap,
        [lessonId]: {
          lessonId,
          completed: watchPercentage >= 90 || s.completedLessons.includes(lessonId),
          watchedSeconds: lastPositionSeconds,
          lastPositionSeconds,
          watchPercentage,
        },
      },
    }))
  }, [])

  const saveLessonNote = useCallback((lessonId: string, note: string) => {
    setState((s) => ({
      ...s,
      lessonNotes: { ...s.lessonNotes, [lessonId]: note },
    }))
  }, [])

  const completeExercise = useCallback((exerciseId: string) => {
    setState((s) => {
      if (s.completedExercises.includes(exerciseId)) return s
      return {
        ...s,
        completedExercises: [...s.completedExercises, exerciseId],
      }
    })
  }, [])

  const recordDifficulty = useCallback((topic: string) => {
    setState((s) => {
      const existing = s.difficulties.find((d) => d.topic.toLowerCase() === topic.toLowerCase())
      let updatedDiffs: Difficulty[]
      if (existing) {
        updatedDiffs = s.difficulties.map((d) =>
          d.topic.toLowerCase() === topic.toLowerCase() ? { ...d, count: d.count + 1 } : d
        )
      } else {
        updatedDiffs = [...s.difficulties, { topic, count: 1 }]
      }
      return { ...s, difficulties: updatedDiffs }
    })
  }, [])

  // --- Assessments & Projects & Adaptive Post-Assessment ---
  const submitAssessment = useCallback((moduleId: string, score: number) => {
    setState((s) => {
      const current = s.moduleProgress[moduleId]
      const allMods = s.customModules
      const mod = allMods.find((m) => m.id === moduleId)
      const passed = score >= 50

      const mastery = learningPathEngine.calculateModuleMastery(moduleId, {
        ...current,
        assessmentScore: score,
      }, mod)

      const { updatedPath, adaptationNotice } = learningPathEngine.adaptTrailPostAssessment(
        s.activePath,
        moduleId,
        score,
        s.placement?.weakTopics || ['Conceitos do Módulo'],
        allMods,
      )

      const updatedNotifications = [...s.notifications]
      if (adaptationNotice) {
        updatedNotifications.push({
          id: `notif-adapt-${Date.now()}`,
          title: adaptationNotice.reason,
          message: adaptationNotice.changesMade,
          type: passed ? 'success' : 'warning',
          read: false,
          createdAt: new Date().toISOString(),
        })
      }

      return {
        ...s,
        activePath: updatedPath,
        moduleProgress: {
          ...s.moduleProgress,
          [moduleId]: {
            ...current,
            moduleId,
            lessonsCompleted: current?.lessonsCompleted ?? 0,
            exercisesCompleted: current?.exercisesCompleted ?? 0,
            projectSubmitted: current?.projectSubmitted ?? false,
            assessmentScore: score,
            masteryScore: mastery.totalMastery,
            status: passed ? 'completed' : 'in-progress',
          },
        },
        notifications: updatedNotifications,
      }
    })
  }, [])

  const submitModuleProject = useCallback((moduleId: string, submission: { githubUrl: string; deployUrl?: string; description?: string }) => {
    setState((s) => {
      const current = s.moduleProgress[moduleId]
      const allMods = s.customModules
      const mod = allMods.find((m) => m.id === moduleId)
      const newProj: UserProject = {
        id: `proj-mod-${Date.now()}`,
        title: `Projeto: ${mod?.title || moduleId}`,
        description: submission.description || `Projeto obrigatório entregue para o módulo ${mod?.title}.`,
        tech: mod?.skills || ['JavaScript'],
        github: submission.githubUrl,
        deploy: submission.deployUrl,
        status: 'concluido',
        createdAt: new Date().toISOString(),
        tags: ['modulo', mod?.slug || 'web'],
      }

      const mastery = learningPathEngine.calculateModuleMastery(moduleId, {
        ...current,
        projectSubmitted: true,
      }, mod)

      return {
        ...s,
        projects: [newProj, ...s.projects],
        moduleProgress: {
          ...s.moduleProgress,
          [moduleId]: {
            ...current,
            moduleId,
            lessonsCompleted: current?.lessonsCompleted ?? 0,
            exercisesCompleted: current?.exercisesCompleted ?? 0,
            assessmentScore: current?.assessmentScore ?? null,
            projectSubmitted: true,
            masteryScore: mastery.totalMastery,
            status: current?.status ?? 'in-progress',
          },
        },
      }
    })
  }, [])

  const addProject = useCallback((p: Omit<UserProject, 'id' | 'createdAt'>) => {
    setState((s) => ({
      ...s,
      projects: [{ ...p, id: `proj-${Date.now()}`, createdAt: new Date().toISOString() }, ...s.projects],
    }))
  }, [])

  const updateProject = useCallback((id: string, patch: Partial<UserProject>) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((pr) => (pr.id === id ? { ...pr, ...patch } : pr)),
    }))
  }, [])

  const deleteProject = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      projects: s.projects.filter((pr) => pr.id !== id),
    }))
  }, [])

  // --- Spaced Reviews & Study Tracking ---
  const completeSpacedReview = useCallback((reviewId: string) => {
    setState((s) => ({
      ...s,
      spacedReviews: s.spacedReviews.map((r) =>
        r.id === reviewId ? { ...r, completed: true, lastReviewedAt: new Date().toISOString() } : r
      ),
    }))
  }, [])

  const recordStudySession = useCallback((minutes: number, _type?: string) => {
    setState((s) => ({
      ...s,
      studiedMinutes: s.studiedMinutes + minutes,
      todayStudiedMinutes: s.todayStudiedMinutes + minutes,
    }))
  }, [])

  const addInterviewReport = useCallback((report: InterviewReport) => {
    setState((s) => ({
      ...s,
      interviewReports: [report, ...s.interviewReports],
    }))
  }, [])

  const generateCertificate = useCallback((pathTitle?: string): CertificateData => {
    const cert: CertificateData = {
      id: `CERT-${Date.now().toString(36).toUpperCase()}`,
      studentName: state.profile?.name || 'Desenvolvedor Formado',
      trackTitle: pathTitle || state.activePath.title,
      totalHours: state.customModules.reduce((acc, m) => acc + (m.estimatedHours || 10), 0) || 60,
      skills: ['JavaScript', 'Algoritmos', 'Web Front-end', 'APIs REST', 'Bancos de Dados'],
      issuedAt: new Date().toLocaleDateString('pt-BR'),
      verificationCode: `DP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      qrUrl: 'https://devpath.ai/certificados/validar',
    }
    setState((s) => ({
      ...s,
      certificates: [cert, ...s.certificates],
    }))
    return cert
  }, [state.profile, state.activePath, state.customModules])

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setState((s) => ({
      ...s,
      profile: s.profile ? { ...s.profile, ...patch } : null,
    }))
  }, [])

  const markNotificationAsRead = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }))
  }, [])

  // --- Module Mastery & Prerequisite Progression Engine ---
  const getModuleMastery = useCallback(
    (moduleId: string): ModuleMasteryScore => {
      const allMods = state.customModules
      const mod = allMods.find((m) => m.id === moduleId)
      const p = state.moduleProgress[moduleId]
      return learningPathEngine.calculateModuleMastery(moduleId, p, mod)
    },
    [state.moduleProgress, state.customModules],
  )

  const isModuleComplete = useCallback(
    (moduleId: string, mp: Record<string, ModuleProgress>): boolean => {
      const allMods = state.customModules
      const mod = allMods.find((m) => m.id === moduleId)
      const p = mp[moduleId]
      if (!mod || !p) return false
      const mastery = learningPathEngine.calculateModuleMastery(moduleId, p, mod)
      return mastery.isUnlocked || (p.assessmentScore !== null && p.assessmentScore >= 50)
    },
    [state.customModules],
  )

  const isModuleUnlocked = useCallback(
    (moduleId: string): boolean => {
      const allMods = state.customModules
      const mod = allMods.find((m) => m.id === moduleId)
      if (!mod) return false

      // 1. Check activePath sequential constraint if activePath exists
      const pathItems = state.activePath?.items || []
      const itemIndex = pathItems.findIndex((it) => it.moduleId === moduleId)
      if (itemIndex === 0) {
        return !pathItems[0].locked
      }
      if (itemIndex > 0) {
        const prevItem = pathItems[itemIndex - 1]
        const isPrevComplete = isModuleComplete(prevItem.moduleId, state.moduleProgress)
        if (!isPrevComplete) {
          return false
        }
      }

      // 2. Check explicit prerequisites on module
      if (mod.prerequisites && mod.prerequisites.length > 0) {
        return mod.prerequisites.every((pr) => isModuleComplete(pr, state.moduleProgress))
      }

      return true
    },
    [state.moduleProgress, state.customModules, state.activePath, isModuleComplete],
  )

  const moduleStatus = useCallback(
    (moduleId: string): ModuleStatus => {
      const allMods = state.customModules
      const mod = allMods.find((m) => m.id === moduleId)
      const p = state.moduleProgress[moduleId]
      if (!mod) return 'locked'
      if (p && isModuleComplete(moduleId, state.moduleProgress)) return 'completed'
      if (!isModuleUnlocked(moduleId)) return 'locked'
      const hasProgress = p && (p.lessonsCompleted > 0 || p.exercisesCompleted > 0 || p.assessmentScore !== null)
      return hasProgress ? 'in-progress' : 'available'
    },
    [state.moduleProgress, state.customModules, isModuleComplete, isModuleUnlocked],
  )

  // Derived metrics
  const overallProgress = useMemo(() => {
    const allMods = state.customModules
    const totalLessons = allMods.reduce((a, m) => a + m.lessonIds.length, 0)
    if (totalLessons === 0) return 0
    return Math.min(100, Math.round((state.completedLessons.length / totalLessons) * 100))
  }, [state.completedLessons, state.customModules])

  const xp = useMemo(() => {
    const allMods = state.customModules
    const completedModulesCount = allMods.filter((m) =>
      isModuleComplete(m.id, state.moduleProgress),
    ).length
    return (
      state.completedLessons.length * 50 +
      state.completedExercises.length * 20 +
      state.projects.length * 150 +
      completedModulesCount * 500
    )
  }, [state.completedLessons, state.completedExercises, state.projects, state.moduleProgress, state.customModules, isModuleComplete])

  const level = useMemo(() => Math.floor(xp / 1000) + 1, [xp])

  const currentModuleId = useMemo(() => {
    const pathItems = state.activePath?.items || []
    if (pathItems.length > 0) {
      const inProg = pathItems.find((it) => moduleStatus(it.moduleId) === 'in-progress')
      if (inProg) return inProg.moduleId
      const avail = pathItems.find((it) => moduleStatus(it.moduleId) === 'available')
      if (avail) return avail.moduleId
      return pathItems[0].moduleId
    }

    const allMods = state.customModules
    const ordered = [...allMods].sort((a, b) => a.order - b.order)
    const inProg = ordered.find((m) => moduleStatus(m.id) === 'in-progress')
    if (inProg) return inProg.id
    const avail = ordered.find((m) => moduleStatus(m.id) === 'available')
    return avail?.id ?? ordered[0]?.id ?? null
  }, [moduleStatus, state.activePath, state.customModules])

  const nextPendingLessonId = useMemo(() => {
    // 1. Check current active module first
    if (currentModuleId) {
      const curMod = state.customModules.find((m) => m.id === currentModuleId)
      if (curMod) {
        const pending = curMod.lessonIds.find((lid) => !state.completedLessons.includes(lid))
        if (pending) return pending
      }
    }

    // 2. Otherwise iterate along active path sequence
    const pathItems = state.activePath?.items || []
    if (pathItems.length > 0) {
      for (const item of pathItems) {
        if (moduleStatus(item.moduleId) !== 'locked') {
          const mod = state.customModules.find((m) => m.id === item.moduleId)
          const pending = mod?.lessonIds.find((lid) => !state.completedLessons.includes(lid))
          if (pending) return pending
        }
      }
    }

    // 3. Fallback to first available module
    const allMods = state.customModules
    const ordered = [...allMods].sort((a, b) => a.order - b.order)
    for (const mod of ordered) {
      if (moduleStatus(mod.id) !== 'locked') {
        const pending = mod.lessonIds.find((lid) => !state.completedLessons.includes(lid))
        if (pending) return pending
      }
    }
    return state.customLessons[0]?.id ?? null
  }, [currentModuleId, moduleStatus, state.completedLessons, state.activePath, state.customModules, state.customLessons])

  // Daily Study Plan derived dynamically
  const dailyStudyPlan = useMemo(() => {
    const allMods = state.customModules
    const curMod = allMods.find((m) => m.id === currentModuleId) || allMods[0]
    const allL = state.customLessons
    const pendingLesson = allL.find((l) => l.id === nextPendingLessonId) || null
    return learningPathEngine.generateDailyStudyPlan(
      state.profile,
      curMod,
      pendingLesson,
      state.spacedReviews.filter((r) => !r.completed),
    )
  }, [currentModuleId, nextPendingLessonId, state.profile, state.customModules, state.customLessons, state.spacedReviews])

  const value: AppStoreValue = {
    ...state,
    ready,
    isSupabaseOnline,
    allCourses,
    allModules,
    allLessons,
    dailyStudyPlan,
    signIn,
    signUp,
    signOut,
    completeOnboarding,
    completePlacement,
    generateCustomPath,
    resetActivePathToAdaptive,
    ingestFullChannelToStore,
    importCourseFromPlaylist,
    importChannelPlaylists,
    syncPlaylistInStore,
    updateTechnologySource,
    updatePlaylistClassification,
    validateCatalogIntegrity,
    resetEducationalCatalog,
    syncOfficialTrustedChannels,
    completeLesson,
    recordVideoProgress,
    saveLessonNote,
    completeExercise,
    recordDifficulty,
    submitAssessment,
    submitModuleProject,
    addProject,
    updateProject,
    deleteProject,
    completeSpacedReview,
    recordStudySession,
    addInterviewReport,
    generateCertificate,
    updateProfile,
    markNotificationAsRead,
    clearAllNotifications,
    moduleStatus,
    isModuleUnlocked,
    getModuleMastery,
    overallProgress,
    xp,
    level,
    currentModuleId,
    nextPendingLessonId,
  }

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export function useAppStore() {
  const context = useContext(AppStoreContext)
  if (!context) {
    throw new Error('useAppStore must be used within an AppStoreProvider')
  }
  return context
}
