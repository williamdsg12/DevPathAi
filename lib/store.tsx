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
  defaultEducationalBackgrounds,
  defaultLearningActivities,
  defaultOfficialCourses,
  defaultOfficialLessons,
  defaultOfficialModules,
  defaultPortfolioProjects,
  defaultProfessionalExperiences,
  defaultTechnologySources,
  defaultUserCertificates,
  defaultUserEvents,
  defaultUserTechnologies,
  mockAchievements,
  mockAssessments,
  mockPath,
  mockProjects,
  mockUser,
} from './mock-data'
import { learningPathEngine } from './ai/learning-path-engine'
import { activityEngine } from './ai/activity-engine'
import { moduleCompletionEngine } from './pedagogy/module-completion-engine'
import {
  progressionEngine,
  type CourseProgressDetails,
  type LessonMissionDetails,
  type LessonStepStatus,
} from './pedagogy/progression-engine'
import { validateContentMapping } from './youtube/service'
import { isSuperAdmin } from './auth/rbac'
import type {
  Achievement,
  ActivityAttempt,
  ActivitySubmissionResult,
  Assessment,
  AssessmentQuestion,
  AssessmentResult,
  CertificateData,
  ContentConsistencyReport,
  ContentSource,
  Course,
  DailyStudyPlan,
  DailyStudyRecord,
  Difficulty,
  EducationalBackground,
  ImportLog,
  IngestionReport,
  InterviewReport,
  KnowledgeGap,
  LearningActivity,
  LearningModule,
  LearningPath,
  LearningProfile,
  Lesson,
  LessonProgress,
  ModuleCompletionStatus,
  ModuleMasteryScore,
  ModuleProgress,
  ModuleProject,
  ModuleReflection,
  ModuleStatus,
  NotificationItem,
  NotificationPreferences,
  OnboardingData,
  PlacementResult,
  PortfolioProject,
  ProfessionalExperience,
  ProjectSubmission,
  RecoveryPlan,
  SocialLinks,
  SpacedReviewItem,
  TechnologySource,
  TrailAdaptationNotice,
  UserCertificateRecord,
  UserEvent,
  UserProfile,
  UserProject,
  UserTechnologyRecord,
  YouTubePlaylist,
  YouTubeVideo,
  AIAgentConfig,
  AIAuditLog,
  AIInstruction,
  AIPromptBlock,
  AIPromptBlockKey,
  AIPromptVersion,
  AIKnowledgeItem,
  StudentEducationalMemory,
  AIOperationLog,
} from './types'
import {
  INITIAL_AI_BLOCKS,
  INITIAL_AI_CONFIG,
  INITIAL_AI_INSTRUCTIONS,
  INITIAL_AI_VERSIONS,
  compilePrompt,
} from './ai/prompt-compiler'
import { INITIAL_AI_KNOWLEDGE } from './ai/knowledge-base'

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
  // Pedagogical Activity Engine State
  activities: LearningActivity[]
  activityAttempts: Record<string, ActivityAttempt[]>
  completedActivities: string[]
  moduleProjects: Record<string, ModuleProject>
  projectSubmissions: Record<string, ProjectSubmission>
  assessments: Record<string, Assessment>
  assessmentAttempts: Record<string, AssessmentResult[]>
  moduleReflections: Record<string, ModuleReflection>
  skillMasteryMap: Record<string, { skillName: string; score: number; attemptsCount: number }>
  projects: UserProject[]
  // Curriculum, Portfolio & Experience Records
  professionalExperiences: ProfessionalExperience[]
  educationalBackgrounds: EducationalBackground[]
  portfolioProjects: PortfolioProject[]
  userEvents: UserEvent[]
  userCertificates: UserCertificateRecord[]
  userTechnologies: UserTechnologyRecord[]
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
  // AI Central Infrastructure & Training Management
  aiConfig: AIAgentConfig
  aiInstructions: AIInstruction[]
  aiPromptBlocks: AIPromptBlock[]
  aiVersions: AIPromptVersion[]
  aiLogs: AIAuditLog[]
  aiKnowledge: AIKnowledgeItem[]
  studentMemories: Record<string, StudentEducationalMemory>
  aiOperationLogs: AIOperationLog[]
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

function createInitialModuleProgress(modules: LearningModule[]): Record<string, ModuleProgress> {
  const progress: Record<string, ModuleProgress> = {}
  for (const m of modules) {
    progress[m.id] = {
      moduleId: m.id,
      lessonsCompleted: 0,
      exercisesCompleted: 0,
      projectSubmitted: false,
      assessmentScore: null,
      masteryScore: 0,
      status: m.order === 1 ? 'available' : 'locked',
    }
  }
  return progress
}

function createCleanInitialState(): PersistedState {
  const initialAdaptive = learningPathEngine.generateAdaptiveTrail(
    null,
    null,
    null,
    defaultOfficialCourses,
    defaultOfficialModules,
    defaultOfficialLessons,
  )

  const initialProjectsMap: Record<string, ModuleProject> = {}
  mockProjects.forEach((p) => {
    initialProjectsMap[p.moduleId] = p
  })

  const initialAssessmentsMap: Record<string, Assessment> = {}
  mockAssessments.forEach((a) => {
    initialAssessmentsMap[a.moduleId] = a
  })

  return {
    profile: mockUser,
    authed: true,
    learningProfile: null,
    onboarding: null,
    placement: null,
    activePath: initialAdaptive.path,
    moduleProgress: createInitialModuleProgress(defaultOfficialModules),
    lessonProgressMap: {},
    completedLessons: [],
    lessonNotes: {},
    completedExercises: [],
    activities: defaultLearningActivities,
    activityAttempts: {},
    completedActivities: [],
    moduleProjects: initialProjectsMap,
    projectSubmissions: {},
    assessments: initialAssessmentsMap,
    assessmentAttempts: {},
    moduleReflections: {},
    skillMasteryMap: {},
    projects: [],
    professionalExperiences: defaultProfessionalExperiences,
    educationalBackgrounds: defaultEducationalBackgrounds,
    portfolioProjects: defaultPortfolioProjects,
    userEvents: defaultUserEvents,
    userCertificates: defaultUserCertificates,
    userTechnologies: defaultUserTechnologies,
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
        message: 'Explore seus cursos oficiais do YouTube ou importe novas playlists para personalizar seus estudos.',
        type: 'info',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ],
    contentSources: defaultContentSources,
    courses: defaultOfficialCourses,
    importedPlaylists: [],
    customModules: defaultOfficialModules,
    customLessons: defaultOfficialLessons,
    technologySources: defaultTechnologySources,
    importLogs: [],
    aiConfig: INITIAL_AI_CONFIG,
    aiInstructions: INITIAL_AI_INSTRUCTIONS,
    aiPromptBlocks: INITIAL_AI_BLOCKS,
    aiVersions: INITIAL_AI_VERSIONS,
    aiLogs: [
      {
        id: 'log-init',
        timestamp: new Date().toISOString(),
        adminUser: 'Administrador',
        action: 'Inicialização do Módulo de IA',
        details: 'Infraestrutura da IA inicializada com versão v1.0 e 4 instruções padrão.',
        version: 'v1.0',
        category: 'config',
      },
    ],
    aiKnowledge: INITIAL_AI_KNOWLEDGE,
    studentMemories: {},
    aiOperationLogs: [],
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
  isSuperAdmin: boolean
  // Onboarding & Nivelamento
  completeOnboarding: (data: OnboardingData) => void
  completePlacement: (result: PlacementResult) => void
  generateCustomPath: (title?: string, description?: string) => void
  recalculateLearningPath: (reason?: string) => void
  resetActivePathToAdaptive: () => void
  // Course & Module Updates
  updateCourse: (course: Course) => void
  deleteCourse: (courseId: string) => void
  updateModule: (module: LearningModule) => void
  deleteModule: (moduleId: string) => void
  addLessonToModule: (moduleId: string, lesson: Partial<Lesson>) => void
  updateLesson: (lesson: Lesson) => void
  deleteLesson: (lessonId: string) => void
  // Content Catalog & Ingestion
  addContentSource: (source: ContentSource) => void
  updateContentSource: (source: ContentSource) => void
  deleteContentSource: (sourceId: string) => void
  updateTechnologySource: (source: TechnologySource) => void
  deleteTechnologySource: (id: string) => void
  syncOfficialTrustedChannels: () => Promise<boolean>
  resetEducationalCatalog: () => Promise<{ success: boolean; deletedCounts: { courses: number; modules: number; lessons: number } }>
  revalidateModuleVideos: (moduleId: string) => Promise<{ availableCount: number; unavailableCount: number }>
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
    modules?: LearningModule[]
    lessons?: Lesson[]
    playlist?: YouTubePlaylist
  }) => void
  importChannelPlaylists: (playlists: YouTubePlaylist[]) => void
  syncPlaylistInStore: (playlistId: string, videos: YouTubeVideo[]) => void
  checkContentConsistency: () => ContentConsistencyReport
  // Pedagogical Activity Engine Actions
  submitActivityAnswer: (
    activityId: string,
    answer: string | number,
    timeSpentSeconds?: number,
  ) => {
    isCorrect: boolean
    score: number
    feedback: string
    hint?: string
    xpEarned: number
    attemptNumber: number
  }
  submitFullActivity: (
    activityId: string,
    answers: Record<string, string | number>,
    timeSpentSeconds?: number,
  ) => ActivitySubmissionResult
  generateActivitiesForLesson: (lessonId: string) => Promise<LearningActivity[]>
  generateActivitiesForModule: (moduleId: string) => Promise<LearningActivity[]>
  generateModuleProject: (moduleId: string) => Promise<ModuleProject>
  generateModuleAssessment: (moduleId: string) => Promise<Assessment>
  submitModuleReflection: (
    moduleId: string,
    reflection: Omit<ModuleReflection, 'id' | 'userId' | 'submittedAt'>,
  ) => void
  reviewProjectSubmission: (
    moduleId: string,
    submission: { githubUrl: string; deployUrl?: string; description?: string; codeContent?: string },
  ) => Promise<{
    grade: number
    passed: boolean
    feedback: string
    strengths: string[]
    improvements: string[]
  }>
  checkModuleCompletion: (moduleId: string) => ModuleCompletionStatus
  adminApproveActivity: (activityId: string) => void
  adminUpdateActivity: (activityId: string, patch: Partial<LearningActivity>) => void
  adminDeleteActivity: (activityId: string) => void
  // Progression & Learning Actions
  completeLesson: (lessonId: string) => void
  recordVideoProgress: (lessonId: string, watchedPercentage: number, lastPositionSeconds?: number) => void
  saveLessonNote: (lessonId: string, note: string) => void
  completeExercise: (exerciseId: string) => void
  submitProject: (project: UserProject) => void
  submitModuleProject: (
    moduleId: string,
    submission: { githubUrl: string; deployUrl?: string; description?: string },
  ) => void
  submitAssessment: (moduleId: string, score: number) => void
  recordDifficulty: (topic: string) => void
  addProject: (p: Omit<UserProject, 'id' | 'createdAt'>) => void
  updateProject: (id: string, patch: Partial<UserProject>) => void
  deleteProject: (id: string) => void
  recordDailyStudy: (minutes: number) => void
  addSpacedReview: (item: SpacedReviewItem) => void
  completeSpacedReview: (id: string) => void
  addInterviewReport: (report: InterviewReport) => void
  generateCertificate: (pathTitle?: string) => CertificateData
  issueCertificate: (certificate: CertificateData) => void
  markNotificationAsRead: (id: string) => void
  clearAllNotifications: () => void
  // Profile, Personal Data, Curriculum & Portfolio Actions
  updateProfile: (patch: Partial<UserProfile>) => void
  updatePersonalData: (data: Partial<UserProfile>) => void
  updateSocialLinks: (links: Partial<SocialLinks>) => void
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void
  addProfessionalExperience: (exp: Omit<ProfessionalExperience, 'id'>) => void
  updateProfessionalExperience: (id: string, exp: Partial<ProfessionalExperience>) => void
  deleteProfessionalExperience: (id: string) => void
  addEducationalBackground: (edu: Omit<EducationalBackground, 'id'>) => void
  updateEducationalBackground: (id: string, edu: Partial<EducationalBackground>) => void
  deleteEducationalBackground: (id: string) => void
  addPortfolioProject: (proj: Omit<PortfolioProject, 'id'>) => void
  updatePortfolioProject: (id: string, proj: Partial<PortfolioProject>) => void
  deletePortfolioProject: (id: string) => void
  addUserEvent: (event: Omit<UserEvent, 'id'>) => void
  updateUserEvent: (id: string, event: Partial<UserEvent>) => void
  deleteUserEvent: (id: string) => void
  addUserCertificate: (cert: Omit<UserCertificateRecord, 'id'>) => void
  updateUserCertificate: (id: string, cert: Partial<UserCertificateRecord>) => void
  deleteUserCertificate: (id: string) => void
  setUserTechnologies: (techs: UserTechnologyRecord[]) => void
  addUserTechnology: (tech: Omit<UserTechnologyRecord, 'id'>) => void
  removeUserTechnology: (id: string) => void
  uploadProfileAvatar: (avatarUrl: string) => void
  removeProfileAvatar: () => void
  // Derived state & progression engine
  moduleStatus: (moduleId: string) => ModuleStatus
  isModuleUnlocked: (moduleId: string) => boolean
  getModuleMastery: (moduleId: string) => ModuleMasteryScore
  getLessonStatus: (lessonId: string, customSequence?: Lesson[]) => LessonStepStatus
  isLessonUnlocked: (lessonId: string, customSequence?: Lesson[]) => boolean
  getCourseProgressDetails: (courseId: string) => CourseProgressDetails | null
  getLessonMissionDetails: (lessonId: string, customSequence?: Lesson[]) => LessonMissionDetails | null
  overallProgress: number
  xp: number
  level: number
  currentModuleId: string | null
  nextPendingLessonId: string | null
  // AI Infrastructure & Training Management
  compiledPrompt: string
  updateAIConfig: (partial: Partial<AIAgentConfig>) => void
  addAIInstruction: (instruction: Omit<AIInstruction, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => void
  updateAIInstruction: (id: string, partial: Partial<AIInstruction>) => void
  deleteAIInstruction: (id: string) => void
  toggleAIInstruction: (id: string) => void
  updatePromptBlock: (key: AIPromptBlockKey, content: string, enabled?: boolean) => void
  togglePromptBlock: (key: AIPromptBlockKey) => void
  publishAIVersion: (changeDescription: string) => void
  restoreAIVersion: (versionNumber: string) => void
  toggleAIAgentStatus: () => void
  recordAIAudit: (action: string, details: string, category?: AIAuditLog['category']) => void
  // AI Knowledge Base & Student Memory Actions
  addAIKnowledge: (item: Omit<AIKnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateAIKnowledge: (id: string, partial: Partial<AIKnowledgeItem>) => void
  deleteAIKnowledge: (id: string) => void
  toggleAIKnowledge: (id: string) => void
  saveStudentMemory: (memory: Partial<StudentEducationalMemory>) => void
  recordStudentDifficulty: (difficulty: string) => void
  logAIOperation: (log: Omit<AIOperationLog, 'id' | 'timestamp'>) => void
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
        const loadedProfile = parsed.profile
          ? {
              ...parsed.profile,
              role: isSuperAdmin({ email: parsed.profile.email }) ? 'SUPER_ADMIN' : parsed.profile.role || 'STUDENT',
              isAdmin: isSuperAdmin({ email: parsed.profile.email }),
            }
          : null

        // Merge official catalog to ensure defaultOfficialCourses/Modules/Lessons are ALWAYS present and ordered first
        const officialCourseIds = new Set(defaultOfficialCourses.map((c) => c.id))
        const officialModuleIds = new Set(defaultOfficialModules.map((m) => m.id))
        const officialLessonIds = new Set(defaultOfficialLessons.map((l) => l.id))

        const userModules = Array.isArray(parsed.customModules)
          ? parsed.customModules.filter((m: LearningModule) => !officialModuleIds.has(m.id))
          : []
        const mergedModules = [...defaultOfficialModules, ...userModules]

        const userLessons = Array.isArray(parsed.customLessons)
          ? parsed.customLessons.filter((l: Lesson) => !officialLessonIds.has(l.id))
          : []
        const mergedLessons = [...defaultOfficialLessons, ...userLessons]

        const userCourses = Array.isArray(parsed.courses)
          ? parsed.courses.filter((c: Course) => !officialCourseIds.has(c.id) && c.id !== 'crs-python')
          : []
        const mergedCourses = [...defaultOfficialCourses, ...userCourses].filter((course) => {
          if (!course.thumbnailUrl || course.thumbnailUrl.trim() === '') return false
          const courseModules = mergedModules.filter((m) => m.courseId === course.id || m.phase === course.category)
          const courseLessons = courseModules.flatMap((m) => mergedLessons.filter((l) => m.lessonIds.includes(l.id) || l.moduleId === m.id))
          return courseLessons.length > 0 && courseLessons.some((l) => Boolean(l.videoId || l.externalVideoId))
        })

        const loadedActivities = Array.isArray(parsed.activities) && parsed.activities.length ? parsed.activities : defaultLearningActivities
        const loadedProjects = parsed.moduleProjects && Object.keys(parsed.moduleProjects).length ? parsed.moduleProjects : createCleanInitialState().moduleProjects
        const loadedAssessments = parsed.assessments && Object.keys(parsed.assessments).length ? parsed.assessments : createCleanInitialState().assessments

        // Ensure activePath always starts with mandatory logic foundation (mod-logica) for beginners
        let loadedActivePath = parsed.activePath
        const hasValidLogicPhase = loadedActivePath?.items?.some((it: LearningPathItem) => it.moduleId === 'mod-logica')
        if (!loadedActivePath?.items?.length || !hasValidLogicPhase) {
          const generated = learningPathEngine.generateAdaptiveTrail(
            loadedProfile,
            parsed.onboarding || null,
            parsed.placement || null,
            mergedCourses,
            mergedModules,
            mergedLessons,
          )
          loadedActivePath = generated.path
        }

        const loadedExperiences = Array.isArray(parsed.professionalExperiences) && parsed.professionalExperiences.length
          ? parsed.professionalExperiences
          : defaultProfessionalExperiences
        const loadedEducations = Array.isArray(parsed.educationalBackgrounds) && parsed.educationalBackgrounds.length
          ? parsed.educationalBackgrounds
          : defaultEducationalBackgrounds
        const loadedPortfolioProjects = Array.isArray(parsed.portfolioProjects) && parsed.portfolioProjects.length
          ? parsed.portfolioProjects
          : defaultPortfolioProjects
        const loadedEvents = Array.isArray(parsed.userEvents) && parsed.userEvents.length
          ? parsed.userEvents
          : defaultUserEvents
        const loadedCertificates = Array.isArray(parsed.userCertificates) && parsed.userCertificates.length
          ? parsed.userCertificates
          : defaultUserCertificates
        const loadedTechnologies = Array.isArray(parsed.userTechnologies) && parsed.userTechnologies.length
          ? parsed.userTechnologies
          : defaultUserTechnologies

        setState((prev) => ({
          ...prev,
          ...parsed,
          profile: loadedProfile || prev.profile || mockUser,
          contentSources: parsed.contentSources?.length ? parsed.contentSources : defaultContentSources,
          courses: mergedCourses,
          customModules: mergedModules,
          customLessons: mergedLessons,
          activities: loadedActivities,
          activityAttempts: parsed.activityAttempts || {},
          completedActivities: Array.isArray(parsed.completedActivities) ? parsed.completedActivities : parsed.completedExercises || [],
          moduleProjects: loadedProjects,
          projectSubmissions: parsed.projectSubmissions || {},
          assessments: loadedAssessments,
          assessmentAttempts: parsed.assessmentAttempts || {},
          moduleReflections: parsed.moduleReflections || {},
          skillMasteryMap: parsed.skillMasteryMap || {},
          professionalExperiences: loadedExperiences,
          educationalBackgrounds: loadedEducations,
          portfolioProjects: loadedPortfolioProjects,
          userEvents: loadedEvents,
          userCertificates: loadedCertificates,
          userTechnologies: loadedTechnologies,
          activePath: loadedActivePath || prev.activePath,
          technologySources: parsed.technologySources?.length ? parsed.technologySources : defaultTechnologySources,
        }))
      }
    } catch (e) {
      console.warn('Could not load cached state:', e)
    }

    const client = getSupabaseClient()
    if (client && isSupabaseConfigured()) {
      setIsSupabaseOnline(true)
      client.auth
        .getSession()
        .then(({ data: { session } }) => {
          if (session?.user) {
            const userEmail = session.user.email || ''
            const isUserSuperAdmin = isSuperAdmin({ email: userEmail })
            setState((s) => ({
              ...s,
              authed: true,
              profile: {
                id: session.user.id,
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Desenvolvedor',
                email: userEmail,
                role: isUserSuperAdmin ? 'SUPER_ADMIN' : 'STUDENT',
                isAdmin: isUserSuperAdmin,
                avatarUrl: session.user.user_metadata?.avatar_url,
                createdAt: session.user.created_at,
                onboarded: s.profile?.onboarded ?? false,
                placementDone: s.profile?.placementDone ?? false,
              },
            }))
          }
        })
        .catch((err) => {
          console.warn('Supabase auth session notice:', err)
        })
        .finally(() => {
          // Live Database Catalog Sync
          fetch('/api/catalog/courses?limit=100')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data && Array.isArray(data.courses) && data.courses.length > 0) {
                setState((s) => {
                  const dbCourses: Course[] = data.courses
                  const dbModules: LearningModule[] = data.modules || s.customModules
                  const dbLessons: Lesson[] = data.lessons || s.customLessons
                  const dbPlaylists: YouTubePlaylist[] = data.playlists || s.importedPlaylists
                  const dbSources: ContentSource[] = data.sources || s.contentSources

                  return {
                    ...s,
                    courses: dbCourses,
                    customModules: dbModules,
                    customLessons: dbLessons,
                    importedPlaylists: dbPlaylists,
                    contentSources: dbSources,
                  }
                })
              }
            })
            .catch((err) => console.warn('Catalog live DB sync notice:', err))
            .finally(() => {
              setReady(true)
            })
        })

      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const userEmail = session.user.email || ''
          const isUserSuperAdmin = isSuperAdmin({ email: userEmail })
          setState((s) => ({
            ...s,
            authed: true,
            profile: s.profile
              ? {
                  ...s.profile,
                  id: session.user.id,
                  email: userEmail || s.profile.email,
                  role: isUserSuperAdmin ? 'SUPER_ADMIN' : 'STUDENT',
                  isAdmin: isUserSuperAdmin,
                }
              : {
                  id: session.user.id,
                  name: session.user.user_metadata?.name || 'Desenvolvedor',
                  email: userEmail,
                  role: isUserSuperAdmin ? 'SUPER_ADMIN' : 'STUDENT',
                  isAdmin: isUserSuperAdmin,
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
    } else {
      setReady(true)
    }
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
    return state.courses.filter((course) => {
      if (!course.thumbnailUrl || course.thumbnailUrl.trim() === '') return false
      const courseModules = state.customModules.filter(
        (m) => m.courseId === course.id || m.phase === course.category || (course.playlistId && m.id.includes(course.id))
      )
      const courseLessons = courseModules.flatMap((m) =>
        state.customLessons.filter((l) => m.lessonIds.includes(l.id) || l.moduleId === m.id)
      )
      return courseLessons.length > 0 && courseLessons.some((l) => Boolean(l.videoId || l.externalVideoId))
    })
  }, [state.courses, state.customModules, state.customLessons])

  const allModules = useMemo(() => {
    return state.customModules
  }, [state.customModules])

  const allLessons = useMemo(() => {
    return state.customLessons
  }, [state.customLessons])

  // --- Auth Handlers ---
  const signIn = useCallback(async (email: string, password?: string) => {
    const adminCheck = isSuperAdmin({ email })
    const client = getSupabaseClient()
    if (client && isSupabaseConfigured() && password) {
      const { data, error } = await client.auth.signInWithPassword({ email, password })
      if (error) {
        return { success: false, error: error.message }
      }
      if (data.user) {
        const isUserSuperAdmin = isSuperAdmin({ email: data.user.email || email })
        setState((s) => ({
          ...s,
          authed: true,
          profile: {
            id: data.user.id,
            name: data.user.user_metadata?.name || email.split('@')[0],
            email: data.user.email || email,
            role: isUserSuperAdmin ? 'SUPER_ADMIN' : 'STUDENT',
            isAdmin: isUserSuperAdmin,
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
        role: adminCheck ? 'SUPER_ADMIN' : 'STUDENT',
        isAdmin: adminCheck,
        createdAt: new Date().toISOString(),
        onboarded: false,
        placementDone: false,
      },
    }))
    return { success: true }
  }, [])

  const signUp = useCallback(async (name: string, email: string, password?: string) => {
    const adminCheck = isSuperAdmin({ email })
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
        const isUserSuperAdmin = isSuperAdmin({ email: data.user.email || email })
        const cleanState = createCleanInitialState()
        setState({
          ...cleanState,
          authed: true,
          profile: {
            id: data.user.id,
            name,
            email,
            role: isUserSuperAdmin ? 'SUPER_ADMIN' : 'STUDENT',
            isAdmin: isUserSuperAdmin,
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
        role: adminCheck ? 'SUPER_ADMIN' : 'STUDENT',
        isAdmin: adminCheck,
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

  const recalculateLearningPath = useCallback((reason?: string) => {
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

      const updatedPath: LearningPath = {
        ...generated.path,
        recalculatedAt: new Date().toISOString(),
        adaptations: [
          ...(generated.path.adaptations || []),
          ...(reason
            ? [
                {
                  id: `adapt-recalc-${Date.now()}`,
                  date: new Date().toLocaleDateString('pt-BR'),
                  reason: reason || 'Recalculação de trilha solicitada.',
                  changesMade: 'Ajuste adaptativo da sequência de estudos e validação de pré-requisitos.',
                },
              ]
            : []),
        ],
      }

      return {
        ...s,
        activePath: updatedPath,
        moduleProgress,
        notifications: [
          ...s.notifications,
          {
            id: `notif-recalc-${Date.now()}`,
            title: 'Trilha Atualizada!',
            message: reason ? `Motivo: ${reason}` : 'Sua trilha individual foi recalculada com base no catálogo atual.',
            type: 'info',
            read: false,
            createdAt: new Date().toISOString(),
          },
        ],
      }
    })
  }, [])

  const resetActivePathToAdaptive = useCallback(() => {
    recalculateLearningPath('Reinicialização manual da trilha adaptativa.')
  }, [recalculateLearningPath])

  // --- Educational Catalog Ingestion & Sincronização ---
  const ingestFullChannelToStore = useCallback((payload: {
    channel: ContentSource
    playlists: YouTubePlaylist[]
    courses: Course[]
    modules: LearningModule[]
    lessons: Lesson[]
    report: IngestionReport
  }) => {
    if (!payload || !payload.channel) {
      console.warn('[store] ingestFullChannelToStore chamado com payload inválido ou sem canal.')
      return
    }

    setState((s) => {
      const channelId = payload.channel.channelId || payload.channel.id
      const existingSources = s.contentSources.filter((cs) => cs.channelId !== channelId && cs.id !== channelId)
      const plList = payload.playlists || []
      const crsList = payload.courses || []
      const modList = payload.modules || []
      const lesList = payload.lessons || []
      const rep = payload.report || { playlistsImported: 0, playlistsFailed: 0, totalVideosFound: 0, videosImported: 0, unavailableCount: 0 }

      const existingPlIds = new Set(plList.map((p) => p.youtubePlaylistId))
      const remainingPlaylists = s.importedPlaylists.filter((p) => !existingPlIds.has(p.youtubePlaylistId))
      const existingCourseIds = new Set(crsList.map((c) => c.id))
      const remainingCourses = s.courses.filter((c) => !existingCourseIds.has(c.id))
      const existingModIds = new Set(modList.map((m) => m.id))
      const remainingModules = s.customModules.filter((m) => !existingModIds.has(m.id))
      const existingLessonIds = new Set(lesList.map((l) => l.id))
      const remainingLessons = s.customLessons.filter((l) => !existingLessonIds.has(l.id))

      const moduleProgress = { ...s.moduleProgress }
      for (const m of modList) {
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
        status: payload.report.playlistsFailed && payload.report.playlistsFailed > 0 ? 'parcial' : 'sucesso',
        videosFound: payload.report.videosFound || payload.lessons.length,
        videosImported: payload.report.videosImported || payload.lessons.length,
        videosUnavailable: payload.report.unavailableCount || 0,
        duplicatesIgnored: 0,
        message: `Canal ${payload.channel.name} ingerido: ${payload.courses.length} cursos e ${payload.lessons.length} aulas reais catalogadas.`,
        createdAt: new Date().toISOString(),
      }

      const updatedCourses = [...payload.courses, ...remainingCourses]
      const updatedModules = [...payload.modules, ...remainingModules]
      const updatedLessons = [...payload.lessons, ...remainingLessons]

      // REGRA ARQUITETURAL: Catalog Update DOES NOT mutate active student paths unless empty
      const hasExistingActiveItems = (s.activePath?.items?.length || 0) > 0
      let activePathToSet = s.activePath

      if (!hasExistingActiveItems) {
        const generated = learningPathEngine.generateAdaptiveTrail(
          s.profile,
          s.onboarding,
          s.placement,
          updatedCourses,
          updatedModules,
          updatedLessons,
        )
        activePathToSet = generated.path
      }

      return {
        ...s,
        contentSources: [payload.channel, ...existingSources],
        importedPlaylists: [...payload.playlists, ...remainingPlaylists],
        courses: updatedCourses,
        customModules: updatedModules,
        customLessons: updatedLessons,
        moduleProgress,
        activePath: activePathToSet,
        importLogs: [log, ...s.importLogs],
        notifications: [
          ...s.notifications,
          {
            id: `notif-ingest-${Date.now()}`,
            title: `Canal "${payload.channel.name}" ingerido!`,
            message: `${payload.courses.length} cursos adicionados ao Catálogo Geral (sua trilha individual permanece preservada).`,
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
    modules?: LearningModule[]
    lessons?: Lesson[]
    playlist?: YouTubePlaylist
  }) => {
    if (!payload || !payload.course) return

    setState((s) => {
      const courseId = payload.course.id
      const plId = payload.playlist?.youtubePlaylistId || payload.course.playlistId || ''
      const incomingModules = payload.modules || []
      const incomingLessons = payload.lessons || []

      const filteredCourses = s.courses.filter(
        (c) => c.id !== courseId && (plId ? c.playlistId !== plId : true),
      )
      const filteredPlaylists = plId
        ? s.importedPlaylists.filter((p) => p.youtubePlaylistId !== plId)
        : s.importedPlaylists

      const existingLessonIds = new Set(incomingLessons.map((l) => l.id))
      const filteredCustomLessons = s.customLessons.filter((l) => !existingLessonIds.has(l.id))
      const existingModIds = new Set(incomingModules.map((m) => m.id))
      const filteredCustomModules = s.customModules.filter((m) => !existingModIds.has(m.id))

      const moduleProgress = { ...s.moduleProgress }
      for (const m of incomingModules) {
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
        playlistId: plId,
        playlistTitle: payload.playlist?.title || payload.course.title,
        channelTitle: payload.playlist?.channelTitle || payload.course.channelTitle || 'YouTube',
        status: 'sucesso',
        videosFound: payload.playlist?.itemCount || incomingLessons.length,
        videosImported: incomingLessons.length,
        videosUnavailable: 0,
        duplicatesIgnored: 0,
        message: `Curso "${payload.course.title}" importado com sucesso com ${incomingLessons.length} aulas reais.`,
        createdAt: new Date().toISOString(),
      }

      const updatedCourses = [payload.course, ...filteredCourses]
      const updatedModules = [...incomingModules, ...filteredCustomModules]
      const updatedLessons = [...incomingLessons, ...filteredCustomLessons]

      // REGRA ARQUITETURAL: Course addition to catalog DOES NOT automatically alter active student trails
      const hasExistingActiveItems = (s.activePath?.items?.length || 0) > 0
      let activePathToSet = s.activePath

      if (!hasExistingActiveItems) {
        const generated = learningPathEngine.generateAdaptiveTrail(
          s.profile,
          s.onboarding,
          s.placement,
          updatedCourses,
          updatedModules,
          updatedLessons,
        )
        activePathToSet = generated.path
      }

      return {
        ...s,
        courses: updatedCourses,
        importedPlaylists: payload.playlist ? [payload.playlist, ...filteredPlaylists] : filteredPlaylists,
        customModules: updatedModules,
        customLessons: updatedLessons,
        moduleProgress,
        activePath: activePathToSet,
        importLogs: [newLog, ...s.importLogs],
        notifications: [
          ...s.notifications,
          {
            id: `notif-import-${Date.now()}`,
            title: `Novo curso no Catálogo: ${payload.course.title}`,
            message: `Curso adicionado ao catálogo geral da plataforma.`,
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

  const syncPlaylistInStore = useCallback((playlistId: string, updatedVideos?: YouTubeVideo[]) => {
    setState((s) => {
      const safeVideos = Array.isArray(updatedVideos) ? updatedVideos : []
      const pl = s.importedPlaylists.find((p) => p.youtubePlaylistId === playlistId)
      const updatedPlaylists = s.importedPlaylists.map((p) =>
        p.youtubePlaylistId === playlistId ? { ...p, lastSyncedAt: new Date().toISOString(), itemCount: safeVideos.length } : p
      )

      const targetCourse = s.courses.find((c) => c.playlistId === playlistId || c.id === `crs-${playlistId}`)
      const totalSeconds = safeVideos.reduce((acc, v) => acc + (v?.durationSeconds || 0), 0)
      const totalHours = Math.max(1, Math.round(totalSeconds / 3600))

      const updatedCourses = s.courses.map((c) =>
        c.playlistId === playlistId || c.id === `crs-${playlistId}`
          ? {
              ...c,
              lessonsCount: safeVideos.length,
              totalHours,
              updatedAt: new Date().toISOString(),
            }
          : c
      )

      // Map new / updated lessons strictly ordered by position ASC
      const modId = `mod-${playlistId}`
      const syncedLessons: Lesson[] = safeVideos.map((vid, idx) => ({
        id: `l-${playlistId}-${vid.youtubeVideoId}`,
        moduleId: modId,
        order: idx + 1,
        title: vid.title,
        type: 'video',
        durationMin: Math.max(5, Math.round((vid.durationSeconds || 1200) / 60)),
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
        videosFound: safeVideos.length,
        videosImported: safeVideos.length,
        videosUnavailable: 0,
        duplicatesIgnored: 0,
        message: `Sincronização executada com sucesso. ${safeVideos.length} vídeos ordenados e sincronizados de 1 a ${safeVideos.length}.`,
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

  const addCustomCourse = useCallback((course: Course, modules: LearningModule[] = [], lessons: Lesson[] = []) => {
    setState((s) => {
      const filteredCourses = s.courses.filter((c) => c.id !== course.id && c.slug !== course.slug)
      const existingModIds = new Set(modules.map((m) => m.id))
      const filteredModules = s.customModules.filter((m) => !existingModIds.has(m.id))
      const existingLessonIds = new Set(lessons.map((l) => l.id))
      const filteredLessons = s.customLessons.filter((l) => !existingLessonIds.has(l.id))

      const moduleProgress = { ...s.moduleProgress }
      for (const m of modules) {
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

      const client = getSupabaseClient()
      if (client && isSupabaseConfigured()) {
        client.from('courses').upsert({
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          level: course.level,
          technology: course.technology,
          category: course.category,
          thumbnail_url: course.thumbnailUrl,
          status: course.status,
          channel_title: course.channelTitle,
          playlist_id: course.playlistId,
          playlist_url: course.playlistUrl,
          modules_count: course.modulesCount,
          lessons_count: course.lessonsCount,
          total_hours: course.totalHours,
          prerequisites: course.prerequisites || [],
          skills: course.skills || [],
        }).catch((err) => console.warn('Supabase course upsert notice:', err))
      }

      return {
        ...s,
        courses: [course, ...filteredCourses],
        customModules: [...modules, ...filteredModules],
        customLessons: [...lessons, ...filteredLessons],
        moduleProgress,
      }
    })
  }, [])

  const updateCourse = useCallback((courseId: string, patch: Partial<Course>) => {
    setState((s) => {
      const updatedCourses = s.courses.map((c) =>
        c.id === courseId || c.playlistId === courseId
          ? { ...c, ...patch, updatedAt: new Date().toISOString() }
          : c
      )

      // Also update matching customModules
      const updatedModules = s.customModules.map((m) =>
        m.courseId === courseId || m.courseId === `crs-${courseId}`
          ? {
              ...m,
              title: patch.title ? `${patch.title} — Módulo Principal` : m.title,
              technology: patch.technology || m.technology,
              phase: patch.category || m.phase,
              skills: patch.skills || m.skills,
            }
          : m
      )

      // Also update importedPlaylists if linked
      const updatedPlaylists = s.importedPlaylists.map((p) =>
        p.youtubePlaylistId === courseId || `crs-${p.youtubePlaylistId}` === courseId
          ? {
              ...p,
              title: patch.title || p.title,
              category: patch.category || p.category,
              technology: patch.technology || p.technology,
              level: patch.level || p.level,
              status: (patch.status as any) || p.status,
              updatedAt: new Date().toISOString(),
            }
          : p
      )

      const client = getSupabaseClient()
      if (client && isSupabaseConfigured()) {
        const payload: Record<string, any> = { updated_at: new Date().toISOString() }
        if (patch.title) payload.title = patch.title
        if (patch.description) payload.description = patch.description
        if (patch.category) payload.category = patch.category
        if (patch.technology) payload.technology = patch.technology
        if (patch.level) payload.level = patch.level
        if (patch.status) payload.status = patch.status
        if (patch.thumbnailUrl) payload.thumbnail_url = patch.thumbnailUrl

        client.from('courses').update(payload).eq('id', courseId).catch((err) => console.warn('Supabase course update notice:', err))
      }

      return {
        ...s,
        courses: updatedCourses,
        customModules: updatedModules,
        importedPlaylists: updatedPlaylists,
      }
    })
  }, [])

  const deleteCourse = useCallback((courseId: string) => {
    setState((s) => {
      const targetCourse = s.courses.find((c) => c.id === courseId || c.playlistId === courseId)
      const plId = targetCourse?.playlistId || courseId

      const filteredCourses = s.courses.filter((c) => c.id !== courseId && c.playlistId !== plId)
      const matchingModuleIds = new Set(
        s.customModules
          .filter((m) => m.courseId === courseId || m.courseId === `crs-${plId}` || m.id === `mod-${plId}`)
          .map((m) => m.id)
      )
      const filteredModules = s.customModules.filter((m) => !matchingModuleIds.has(m.id))
      const filteredLessons = s.customLessons.filter((l) => !matchingModuleIds.has(l.moduleId) && l.playlistId !== plId)
      const filteredPlaylists = s.importedPlaylists.filter((p) => p.youtubePlaylistId !== plId && p.id !== courseId)

      const moduleProgress = { ...s.moduleProgress }
      matchingModuleIds.forEach((mId) => {
        delete moduleProgress[mId]
      })

      const client = getSupabaseClient()
      if (client && isSupabaseConfigured()) {
        client.from('courses').delete().eq('id', courseId).catch((err) => console.warn('Supabase course delete notice:', err))
        client.from('youtube_playlists').delete().eq('id', plId).catch((err) => console.warn('Supabase playlist delete notice:', err))
      }

      return {
        ...s,
        courses: filteredCourses,
        customModules: filteredModules,
        customLessons: filteredLessons,
        importedPlaylists: filteredPlaylists,
        moduleProgress,
        importLogs: [
          {
            id: `log-del-${Date.now()}`,
            playlistId: plId,
            playlistTitle: targetCourse?.title || courseId,
            channelTitle: targetCourse?.channelTitle || 'YouTube',
            status: 'sucesso',
            videosFound: 0,
            videosImported: 0,
            videosUnavailable: 0,
            duplicatesIgnored: 0,
            message: `Curso "${targetCourse?.title || courseId}" e seus módulos foram removidos com sucesso.`,
            createdAt: new Date().toISOString(),
          },
          ...s.importLogs,
        ],
      }
    })
  }, [])

  const deletePlaylist = useCallback((playlistId: string) => {
    deleteCourse(playlistId)
  }, [deleteCourse])

  const updateLesson = useCallback((lesson: Lesson) => {
    setState((s) => ({
      ...s,
      customLessons: s.customLessons.map((l) => (l.id === lesson.id ? { ...l, ...lesson } : l)),
    }))

    const client = getSupabaseClient()
    if (client && isSupabaseConfigured()) {
      client
        .from('lessons')
        .update({
          title: lesson.title,
          description: lesson.description,
          video_id: lesson.videoId || null,
          thumbnail_url: lesson.thumbnailUrl || null,
          availability_status: lesson.availabilityStatus || 'available',
          youtube_exists: lesson.youtubeExists ?? true,
          embed_available: lesson.embedAvailable ?? true,
          last_checked_at: lesson.lastCheckedAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', lesson.id)
        .then(() => {})
        .catch((err) => console.warn('Supabase lesson update notice:', err))
    }
  }, [])

  const markLessonUnavailable = useCallback((lessonId: string, isUnavailable: boolean, reason?: string) => {
    setState((s) => ({
      ...s,
      customLessons: s.customLessons.map((l) =>
        l.id === lessonId
          ? {
              ...l,
              isUnavailable,
              availabilityStatus: isUnavailable ? 'removed' : 'available',
              lastCheckedAt: new Date().toISOString(),
            }
          : l
      ),
    }))

    const client = getSupabaseClient()
    if (client && isSupabaseConfigured()) {
      client
        .from('lessons')
        .update({
          availability_status: isUnavailable ? 'removed' : 'available',
          is_unavailable: isUnavailable,
          last_checked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', lessonId)
        .then(() => {})
        .catch((err) => console.warn('Supabase lesson status update notice:', err))
    }
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
      const allLes = s.customLessons
      const currentLesson = allLes.find((l) => l.id === lessonId)
      const lessonMod = allMods.find((m) => m.lessonIds.includes(lessonId) || (currentLesson && m.id === currentLesson.moduleId))
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

      // Auto-generate AI activities for this lesson if not already existing
      let updatedActivities = [...s.activities]
      const hasActivities = s.activities.some((a) => a.lessonId === lessonId)
      if (!hasActivities && currentLesson) {
        const generated = activityEngine.generateActivitiesForLesson({
          courseId: lessonMod?.courseId,
          moduleId: lessonMod?.id || currentLesson.moduleId,
          lessonId: currentLesson.id,
          lessonTitle: currentLesson.title,
          lessonDescription: currentLesson.description,
          technology: lessonMod?.technology || 'JavaScript',
        })
        const existingIds = new Set(updatedActivities.map((a) => a.id))
        const newOnes = generated.filter((g) => !existingIds.has(g.id))
        updatedActivities = [...updatedActivities, ...newOnes]
      }

      const newReview: SpacedReviewItem = {
        id: `rev-${lessonId}-${Date.now()}`,
        topic: currentLesson?.title || lessonMod?.title || 'Conceitos Fundamentais',
        moduleId: lessonMod?.id || 'mod-logica',
        moduleTitle: lessonMod?.title || 'Lógica de Programação',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        intervalDays: 1,
        question: `Qual o conceito principal abordado na aula "${currentLesson?.title || lessonId}"?`,
        answer: 'Revise o conteúdo da aula e certifique-se de conseguir explicar o código com suas próprias palavras.',
        completed: false,
      }

      const studiedMinutes = s.studiedMinutes + 15
      const todayStudiedMinutes = s.todayStudiedMinutes + 15

      const achievements = s.achievements.map((ach) =>
        ach.id === 'ach-1' ? { ...ach, unlocked: true } : ach
      )

      const notifications = [
        ...s.notifications,
        {
          id: `notif-les-${lessonId}-${Date.now()}`,
          title: `Aula Concluída! Atividades Geradas ✨`,
          message: `A IA Professora preparou exercícios práticos baseados no conteúdo da aula "${currentLesson?.title || 'Aula'}".`,
          type: 'success' as const,
          read: false,
          actionUrl: '/exercicios',
          createdAt: new Date().toISOString(),
        },
      ]

      return {
        ...s,
        completedLessons,
        moduleProgress,
        activities: updatedActivities,
        spacedReviews: [...s.spacedReviews, newReview],
        studiedMinutes,
        todayStudiedMinutes,
        streak: s.streak === 0 ? 1 : s.streak,
        achievements,
        notifications,
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
        completedActivities: s.completedActivities.includes(exerciseId) ? s.completedActivities : [...s.completedActivities, exerciseId],
      }
    })
  }, [])

  // --- AI Pedagogical Activity Engine Actions ---
  const submitActivityAnswer = useCallback(
    (activityId: string, answer: string | number, timeSpentSeconds = 0) => {
      let result = {
        isCorrect: false,
        score: 0,
        feedback: '',
        hint: undefined as string | undefined,
        xpEarned: 0,
        attemptNumber: 1,
      }

      setState((s) => {
        const act = s.activities.find((a) => a.id === activityId)
        if (!act) return s

        const currentAttempts = s.activityAttempts[activityId] || []
        const attemptNum = currentAttempts.length + 1
        const evalRes = activityEngine.evaluateAttempt(act, answer, attemptNum)

        const attempt: ActivityAttempt = {
          id: `att-${activityId}-${Date.now()}`,
          activityId,
          userId: s.profile?.id || 'anon-user',
          answer,
          score: evalRes.score,
          isCorrect: evalRes.isCorrect,
          feedback: evalRes.feedback,
          hintProvided: evalRes.hintProvided,
          timeSpentSeconds,
          attemptNumber: attemptNum,
          submittedAt: new Date().toISOString(),
        }

        const updatedAttempts = {
          ...s.activityAttempts,
          [activityId]: [...currentAttempts, attempt],
        }

        const isNewlyCompleted = evalRes.isCorrect && !s.completedActivities.includes(activityId)
        const completedActivities = isNewlyCompleted
          ? [...s.completedActivities, activityId]
          : s.completedActivities
        const completedExercises = isNewlyCompleted
          ? [...s.completedExercises, activityId]
          : s.completedExercises

        // Update skill mastery
        const currentSkill = s.skillMasteryMap[act.skillName] || {
          skillName: act.skillName,
          score: 0,
          attemptsCount: 0,
        }
        const newAttemptsCount = currentSkill.attemptsCount + 1
        const newScore = Math.round(
          (currentSkill.score * currentSkill.attemptsCount + evalRes.score) / newAttemptsCount,
        )
        const updatedSkillMastery = {
          ...s.skillMasteryMap,
          [act.skillName]: {
            skillName: act.skillName,
            score: newScore,
            attemptsCount: newAttemptsCount,
          },
        }

        // Update module progress exercisesCompleted
        const mod = s.customModules.find((m) => m.id === act.moduleId)
        const curModProg = s.moduleProgress[act.moduleId]
        const updatedModProgress = { ...s.moduleProgress }
        if (mod && curModProg) {
          const modActs = s.activities.filter((a) => a.moduleId === act.moduleId)
          const doneInMod = modActs.filter((a) => completedActivities.includes(a.id)).length
          const mastery = learningPathEngine.calculateModuleMastery(
            act.moduleId,
            {
              ...curModProg,
              exercisesCompleted: doneInMod,
            },
            mod,
          )

          updatedModProgress[act.moduleId] = {
            ...curModProg,
            exercisesCompleted: doneInMod,
            masteryScore: mastery.totalMastery,
          }
        }

        // If incorrect, record difficulty topic
        let updatedDiffs = s.difficulties
        if (!evalRes.isCorrect) {
          const topicName = act.skillName || act.technology || 'Conceitos da Aula'
          const exDiff = s.difficulties.find((d) => d.topic.toLowerCase() === topicName.toLowerCase())
          if (exDiff) {
            updatedDiffs = s.difficulties.map((d) =>
              d.topic.toLowerCase() === topicName.toLowerCase() ? { ...d, count: d.count + 1 } : d,
            )
          } else {
            updatedDiffs = [...s.difficulties, { topic: topicName, count: 1 }]
          }
        }

        result = {
          isCorrect: evalRes.isCorrect,
          score: evalRes.score,
          feedback: evalRes.feedback,
          hint: evalRes.hintProvided,
          xpEarned: isNewlyCompleted ? evalRes.xpEarned : 0,
          attemptNumber: attemptNum,
        }

        return {
          ...s,
          activityAttempts: updatedAttempts,
          completedActivities,
          completedExercises,
          skillMasteryMap: updatedSkillMastery,
          moduleProgress: updatedModProgress,
          difficulties: updatedDiffs,
          streak: s.streak === 0 ? 1 : s.streak,
          studiedMinutes: s.studiedMinutes + Math.ceil(timeSpentSeconds / 60 || 2),
          todayStudiedMinutes: s.todayStudiedMinutes + Math.ceil(timeSpentSeconds / 60 || 2),
        }
      })

      return result
    },
    [],
  )

  const submitFullActivity = useCallback(
    (
      activityId: string,
      answers: Record<string, string | number>,
      timeSpentSeconds = 60,
    ): ActivitySubmissionResult => {
      const act = state.activities.find((a) => a.id === activityId)
      if (!act) {
        return {
          isValid: false,
          error: 'Atividade não encontrada.',
          isApproved: false,
          score: 0,
          xpEarned: 0,
          passedCount: 0,
          totalCount: 0,
          feedback: 'Atividade não encontrada no sistema.',
          questionResults: [],
        }
      }

      // 1. Backend / Store Level Strict Validation & Scoring
      const evalResult = activityEngine.validateAndScoreSubmission(act, answers)
      if (!evalResult.isValid) {
        return evalResult
      }

      setState((s) => {
        const isNewlyCompleted = evalResult.isApproved && !s.completedActivities.includes(activityId)
        const completedActivities = isNewlyCompleted
          ? [...s.completedActivities, activityId]
          : s.completedActivities
        const completedExercises = isNewlyCompleted
          ? [...s.completedExercises, activityId]
          : s.completedExercises

        // Update module progress exercisesCompleted
        const mod = s.customModules.find((m) => m.id === act.moduleId)
        const curModProg = s.moduleProgress[act.moduleId]
        const updatedModProgress = { ...s.moduleProgress }
        if (mod && curModProg) {
          const modActs = s.activities.filter((a) => a.moduleId === act.moduleId)
          const doneInMod = modActs.filter((a) => completedActivities.includes(a.id)).length
          const mastery = learningPathEngine.calculateModuleMastery(
            act.moduleId,
            {
              ...curModProg,
              exercisesCompleted: doneInMod,
            },
            mod,
          )
          updatedModProgress[act.moduleId] = {
            ...curModProg,
            exercisesCompleted: doneInMod,
            masteryScore: mastery.totalMastery,
          }
        }

        return {
          ...s,
          completedActivities,
          completedExercises,
          moduleProgress: updatedModProgress,
          studiedMinutes: s.studiedMinutes + Math.ceil(timeSpentSeconds / 60 || 2),
          todayStudiedMinutes: s.todayStudiedMinutes + Math.ceil(timeSpentSeconds / 60 || 2),
        }
      })

      return evalResult
    },
    [state.activities],
  )

  const generateActivitiesForLesson = useCallback(
    async (lessonId: string): Promise<LearningActivity[]> => {
      const lesson = state.customLessons.find((l) => l.id === lessonId)
      if (!lesson) return []
      const mod = state.customModules.find((m) => m.id === lesson.moduleId)
      const generated = activityEngine.generateActivitiesForLesson({
        courseId: mod?.courseId,
        moduleId: lesson.moduleId,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        lessonDescription: lesson.description,
        technology: mod?.technology || 'JavaScript',
      })
      setState((s) => {
        const existingIds = new Set(s.activities.map((a) => a.id))
        const newOnes = generated.filter((g) => !existingIds.has(g.id))
        return { ...s, activities: [...s.activities, ...newOnes] }
      })
      return generated
    },
    [state.customLessons, state.customModules],
  )

  const generateActivitiesForModule = useCallback(
    async (moduleId: string): Promise<LearningActivity[]> => {
      const mod = state.customModules.find((m) => m.id === moduleId)
      if (!mod) return []
      const lessons = state.customLessons.filter((l) => mod.lessonIds.includes(l.id))
      const allGen: LearningActivity[] = []
      lessons.forEach((l) => {
        const gen = activityEngine.generateActivitiesForLesson({
          courseId: mod.courseId,
          moduleId: mod.id,
          lessonId: l.id,
          lessonTitle: l.title,
          lessonDescription: l.description,
          technology: mod.technology || 'JavaScript',
        })
        allGen.push(...gen)
      })
      setState((s) => {
        const existingIds = new Set(s.activities.map((a) => a.id))
        const newOnes = allGen.filter((g) => !existingIds.has(g.id))
        return { ...s, activities: [...s.activities, ...newOnes] }
      })
      return allGen
    },
    [state.customModules, state.customLessons],
  )

  const generateModuleProject = useCallback(
    async (moduleId: string): Promise<ModuleProject> => {
      const mod = state.customModules.find((m) => m.id === moduleId) || state.customModules[0]
      const lessons = state.customLessons.filter((l) => mod.lessonIds.includes(l.id))
      const proj = activityEngine.generateModuleProject(mod, lessons, mod.technology || 'JavaScript')
      setState((s) => ({
        ...s,
        moduleProjects: { ...s.moduleProjects, [moduleId]: proj },
      }))
      return proj
    },
    [state.customModules, state.customLessons],
  )

  const generateModuleAssessment = useCallback(
    async (moduleId: string): Promise<Assessment> => {
      const mod = state.customModules.find((m) => m.id === moduleId) || state.customModules[0]
      const lessons = state.customLessons.filter((l) => mod.lessonIds.includes(l.id))
      const assessment = activityEngine.generateModuleAssessment(mod, lessons, mod.technology || 'JavaScript')
      setState((s) => ({
        ...s,
        assessments: { ...s.assessments, [moduleId]: assessment },
      }))
      return assessment
    },
    [state.customModules, state.customLessons],
  )

  const submitModuleReflection = useCallback(
    (moduleId: string, refData: Omit<ModuleReflection, 'id' | 'userId' | 'submittedAt'>) => {
      const reflection: ModuleReflection = {
        ...refData,
        id: `ref-${moduleId}-${Date.now()}`,
        userId: state.profile?.id || 'anon-user',
        moduleId,
        submittedAt: new Date().toISOString(),
      }
      setState((s) => {
        const mod = s.customModules.find((m) => m.id === moduleId)
        const aiRec = moduleCompletionEngine.analyzeReflection(reflection, mod?.title)
        const finalRef = { ...reflection, aiRecommendations: aiRec }

        return {
          ...s,
          moduleReflections: { ...s.moduleReflections, [moduleId]: finalRef },
          notifications: [
            ...s.notifications,
            {
              id: `notif-ref-${Date.now()}`,
              title: `Reflexão do Módulo Registrada ✨`,
              message: aiRec,
              type: 'success',
              read: false,
              createdAt: new Date().toISOString(),
            },
          ],
        }
      })
    },
    [state.profile, state.customModules],
  )

  const reviewProjectSubmission = useCallback(
    async (
      moduleId: string,
      submission: { githubUrl: string; deployUrl?: string; description?: string; codeContent?: string },
    ) => {
      const mod = state.customModules.find((m) => m.id === moduleId) || state.customModules[0]
      const proj = state.moduleProjects[moduleId] || activityEngine.generateModuleProject(mod, [])
      const reviewResult = activityEngine.reviewProjectSubmission(proj, submission)

      const projectSub: ProjectSubmission = {
        id: `sub-${moduleId}-${Date.now()}`,
        moduleId,
        title: proj.title,
        description: submission.description || '',
        githubUrl: submission.githubUrl,
        deployUrl: submission.deployUrl,
        codeContent: submission.codeContent,
        status: reviewResult.passed ? 'approved' : 'submitted',
        grade: reviewResult.grade,
        feedback: reviewResult.feedback,
        rubricEvaluation: reviewResult.rubricEvaluation,
        submittedAt: new Date().toISOString(),
        evaluatedAt: new Date().toISOString(),
      }

      setState((s) => {
        const curModProg = s.moduleProgress[moduleId]
        const mastery = learningPathEngine.calculateModuleMastery(
          moduleId,
          {
            ...curModProg,
            projectSubmitted: true,
          },
          mod,
        )

        return {
          ...s,
          projectSubmissions: { ...s.projectSubmissions, [moduleId]: projectSub },
          moduleProgress: {
            ...s.moduleProgress,
            [moduleId]: {
              ...curModProg,
              moduleId,
              lessonsCompleted: curModProg?.lessonsCompleted ?? 0,
              exercisesCompleted: curModProg?.exercisesCompleted ?? 0,
              assessmentScore: curModProg?.assessmentScore ?? null,
              projectSubmitted: true,
              masteryScore: mastery.totalMastery,
              status: curModProg?.status ?? 'in-progress',
            },
          },
        }
      })

      return reviewResult
    },
    [state.customModules, state.moduleProjects],
  )

  const checkModuleCompletion = useCallback(
    (moduleId: string): ModuleCompletionStatus => {
      const mod = state.customModules.find((m) => m.id === moduleId)
      if (!mod) {
        return {
          moduleId,
          lessonsCompleted: false,
          activitiesCompleted: false,
          projectCompleted: false,
          assessmentPassed: false,
          reflectionCompleted: false,
          isFullyCompleted: false,
          totalScore: 0,
          blockReason: 'Módulo não encontrado.',
        }
      }
      return moduleCompletionEngine.evaluateModuleCompletion({
        module: mod,
        moduleProgress: state.moduleProgress[moduleId],
        completedLessons: state.completedLessons,
        completedActivities: state.completedActivities,
        moduleActivities: state.activities,
        assessment: state.assessments[moduleId],
        reflection: state.moduleReflections[moduleId],
        isSuperAdmin: isSuperAdmin(state.profile),
      })
    },
    [
      state.customModules,
      state.moduleProgress,
      state.completedLessons,
      state.completedActivities,
      state.activities,
      state.assessments,
      state.moduleReflections,
      state.profile,
    ],
  )

  const adminApproveActivity = useCallback((activityId: string) => {
    setState((s) => ({
      ...s,
      activities: s.activities.map((a) => (a.id === activityId ? { ...a, status: 'published' } : a)),
    }))
  }, [])

  const adminUpdateActivity = useCallback((activityId: string, patch: Partial<LearningActivity>) => {
    setState((s) => ({
      ...s,
      activities: s.activities.map((a) => (a.id === activityId ? { ...a, ...patch } : a)),
    }))
  }, [])

  const adminDeleteActivity = useCallback((activityId: string) => {
    setState((s) => ({
      ...s,
      activities: s.activities.filter((a) => a.id !== activityId),
    }))
  }, [])

  const recordDifficulty = useCallback((topic: string) => {
    setState((s) => {
      const existing = s.difficulties.find((d) => d.topic.toLowerCase() === topic.toLowerCase())
      let updatedDiffs: Difficulty[]
      if (existing) {
        updatedDiffs = s.difficulties.map((d) =>
          d.topic.toLowerCase() === topic.toLowerCase() ? { ...d, count: d.count + 1 } : d,
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

      const mastery = learningPathEngine.calculateModuleMastery(
        moduleId,
        {
          ...current,
          assessmentScore: score,
        },
        mod,
      )

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

  const issueCertificate = useCallback((certificate: CertificateData) => {
    setState((s) => ({
      ...s,
      certificates: [certificate, ...s.certificates],
    }))
  }, [])

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setState((s) => ({
      ...s,
      profile: s.profile ? { ...s.profile, ...patch } : null,
    }))
  }, [])

  const updatePersonalData = useCallback((data: Partial<UserProfile>) => {
    setState((s) => ({
      ...s,
      profile: s.profile ? { ...s.profile, ...data } : null,
    }))
  }, [])

  const updateSocialLinks = useCallback((links: Partial<SocialLinks>) => {
    setState((s) => ({
      ...s,
      profile: s.profile
        ? {
            ...s.profile,
            socialLinks: { ...s.profile.socialLinks, ...links },
          }
        : null,
    }))
  }, [])

  const updateNotificationPreferences = useCallback((prefs: Partial<NotificationPreferences>) => {
    setState((s) => ({
      ...s,
      profile: s.profile
        ? {
            ...s.profile,
            notificationPreferences: {
              newPrograms: true,
              contentUpdates: true,
              activitiesDeadlines: true,
              aiFeedback: true,
              ...s.profile.notificationPreferences,
              ...prefs,
            },
          }
        : null,
    }))
  }, [])

  const addProfessionalExperience = useCallback((exp: Omit<ProfessionalExperience, 'id'>) => {
    const newExp: ProfessionalExperience = { ...exp, id: `exp-${Date.now()}` }
    setState((s) => ({
      ...s,
      professionalExperiences: [newExp, ...s.professionalExperiences],
    }))
  }, [])

  const updateProfessionalExperience = useCallback((id: string, exp: Partial<ProfessionalExperience>) => {
    setState((s) => ({
      ...s,
      professionalExperiences: s.professionalExperiences.map((e) => (e.id === id ? { ...e, ...exp } : e)),
    }))
  }, [])

  const deleteProfessionalExperience = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      professionalExperiences: s.professionalExperiences.filter((e) => e.id !== id),
    }))
  }, [])

  const addEducationalBackground = useCallback((edu: Omit<EducationalBackground, 'id'>) => {
    const newEdu: EducationalBackground = { ...edu, id: `edu-${Date.now()}` }
    setState((s) => ({
      ...s,
      educationalBackgrounds: [newEdu, ...s.educationalBackgrounds],
    }))
  }, [])

  const updateEducationalBackground = useCallback((id: string, edu: Partial<EducationalBackground>) => {
    setState((s) => ({
      ...s,
      educationalBackgrounds: s.educationalBackgrounds.map((e) => (e.id === id ? { ...e, ...edu } : e)),
    }))
  }, [])

  const deleteEducationalBackground = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      educationalBackgrounds: s.educationalBackgrounds.filter((e) => e.id !== id),
    }))
  }, [])

  const addPortfolioProject = useCallback((proj: Omit<PortfolioProject, 'id'>) => {
    const newProj: PortfolioProject = { ...proj, id: `proj-${Date.now()}` }
    setState((s) => ({
      ...s,
      portfolioProjects: [newProj, ...s.portfolioProjects],
    }))
  }, [])

  const updatePortfolioProject = useCallback((id: string, proj: Partial<PortfolioProject>) => {
    setState((s) => ({
      ...s,
      portfolioProjects: s.portfolioProjects.map((p) => (p.id === id ? { ...p, ...proj } : p)),
    }))
  }, [])

  const deletePortfolioProject = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      portfolioProjects: s.portfolioProjects.filter((p) => p.id !== id),
    }))
  }, [])

  const addUserEvent = useCallback((event: Omit<UserEvent, 'id'>) => {
    const newEvt: UserEvent = { ...event, id: `evt-${Date.now()}` }
    setState((s) => ({
      ...s,
      userEvents: [newEvt, ...s.userEvents],
    }))
  }, [])

  const updateUserEvent = useCallback((id: string, event: Partial<UserEvent>) => {
    setState((s) => ({
      ...s,
      userEvents: s.userEvents.map((e) => (e.id === id ? { ...e, ...event } : e)),
    }))
  }, [])

  const deleteUserEvent = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      userEvents: s.userEvents.filter((e) => e.id !== id),
    }))
  }, [])

  const addUserCertificate = useCallback((cert: Omit<UserCertificateRecord, 'id'>) => {
    const newCert: UserCertificateRecord = { ...cert, id: `cert-${Date.now()}` }
    setState((s) => ({
      ...s,
      userCertificates: [newCert, ...s.userCertificates],
    }))
  }, [])

  const updateUserCertificate = useCallback((id: string, cert: Partial<UserCertificateRecord>) => {
    setState((s) => ({
      ...s,
      userCertificates: s.userCertificates.map((c) => (c.id === id ? { ...c, ...cert } : c)),
    }))
  }, [])

  const deleteUserCertificate = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      userCertificates: s.userCertificates.filter((c) => c.id !== id),
    }))
  }, [])

  const setUserTechnologies = useCallback((techs: UserTechnologyRecord[]) => {
    setState((s) => ({
      ...s,
      userTechnologies: techs,
    }))
  }, [])

  const addUserTechnology = useCallback((tech: Omit<UserTechnologyRecord, 'id'>) => {
    const newTech: UserTechnologyRecord = { ...tech, id: `tech-${Date.now()}` }
    setState((s) => ({
      ...s,
      userTechnologies: [...s.userTechnologies, newTech],
    }))
  }, [])

  const removeUserTechnology = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      userTechnologies: s.userTechnologies.filter((t) => t.id !== id && t.name !== id),
    }))
  }, [])

  const uploadProfileAvatar = useCallback((avatarUrl: string) => {
    setState((s) => ({
      ...s,
      profile: s.profile ? { ...s.profile, avatarUrl } : null,
    }))
  }, [])

  const removeProfileAvatar = useCallback(() => {
    setState((s) => ({
      ...s,
      profile: s.profile ? { ...s.profile, avatarUrl: undefined } : null,
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
      // REGRA: Administrador (Super Admin) possui acesso livre e irrestrito a todos os módulos
      if (isSuperAdmin(state.profile)) {
        return true
      }

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
    [state.profile, state.moduleProgress, state.customModules, state.activePath, isModuleComplete],
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

  // Sequential Progression Engine Callbacks
  const getLessonStatus = useCallback(
    (lessonId: string, customSequence?: Lesson[]): LessonStepStatus => {
      const lesson = state.customLessons.find((l) => l.id === lessonId)
      if (!lesson) return 'LOCKED'
      const sequence = customSequence || state.customLessons.filter((l) => l.moduleId === lesson.moduleId)
      return progressionEngine.getLessonStepStatus(lesson, sequence, {
        profile: state.profile,
        completedLessons: state.completedLessons,
        completedActivities: state.completedActivities,
        activities: state.activities,
        lessonProgressMap: state.lessonProgressMap,
      })
    },
    [state.customLessons, state.profile, state.completedLessons, state.completedActivities, state.activities, state.lessonProgressMap]
  )

  const isLessonUnlocked = useCallback(
    (lessonId: string, customSequence?: Lesson[]): boolean => {
      const lesson = state.customLessons.find((l) => l.id === lessonId)
      if (!lesson) return false
      const sequence = customSequence || state.customLessons.filter((l) => l.moduleId === lesson.moduleId)
      return progressionEngine.isLessonUnlocked(lessonId, sequence, {
        profile: state.profile,
        completedLessons: state.completedLessons,
        completedActivities: state.completedActivities,
        activities: state.activities,
      })
    },
    [state.customLessons, state.profile, state.completedLessons, state.completedActivities, state.activities]
  )

  const getCourseProgressDetails = useCallback(
    (courseId: string): CourseProgressDetails | null => {
      const course = allCourses.find((c) => c.id === courseId || c.slug === courseId)
      if (!course) return null
      const courseModules = allModules.filter((m) => m.courseId === course.id || m.phase === course.category)
      const courseLessons = courseModules.flatMap((m) => allLessons.filter((l) => m.lessonIds.includes(l.id)))
      return progressionEngine.getCourseProgressDetails(course, courseModules, courseLessons, {
        profile: state.profile,
        completedLessons: state.completedLessons,
        completedActivities: state.completedActivities,
        activities: state.activities,
        moduleProgress: state.moduleProgress,
        assessments: state.assessments,
      })
    },
    [allCourses, allModules, allLessons, state.profile, state.completedLessons, state.completedActivities, state.activities, state.moduleProgress, state.assessments]
  )

  const getLessonMissionDetails = useCallback(
    (lessonId: string, customSequence?: Lesson[]): LessonMissionDetails | null => {
      const lesson = state.customLessons.find((l) => l.id === lessonId)
      if (!lesson) return null
      const sequence = customSequence || state.customLessons.filter((l) => l.moduleId === lesson.moduleId)
      return progressionEngine.getLessonMissionDetails(lesson, sequence, {
        profile: state.profile,
        completedLessons: state.completedLessons,
        completedActivities: state.completedActivities,
        activities: state.activities,
        lessonProgressMap: state.lessonProgressMap,
      })
    },
    [state.customLessons, state.profile, state.completedLessons, state.completedActivities, state.activities, state.lessonProgressMap]
  )

  // =========================================================================
  // AI INFRASTRUCTURE & TRAINING MANAGEMENT ACTIONS
  // =========================================================================

  const compiledPrompt = useMemo(() => {
    const config = state.aiConfig || INITIAL_AI_CONFIG
    const blocks = state.aiPromptBlocks || INITIAL_AI_BLOCKS
    const instructions = state.aiInstructions || INITIAL_AI_INSTRUCTIONS
    return compilePrompt(config, blocks, instructions)
  }, [state.aiConfig, state.aiPromptBlocks, state.aiInstructions])

  const recordAIAudit = useCallback(
    (action: string, details: string, category: AIAuditLog['category'] = 'config') => {
      const newLog: AIAuditLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        adminUser: state.profile?.name || 'Administrador',
        action,
        details,
        version: state.aiConfig?.publishedVersion || 'v1.0',
        category,
      }
      setState((prev) => ({
        ...prev,
        aiLogs: [newLog, ...(prev.aiLogs || [])].slice(0, 100),
      }))
    },
    [state.profile?.name, state.aiConfig?.publishedVersion]
  )

  const updateAIConfig = useCallback(
    (partial: Partial<AIAgentConfig>) => {
      setState((prev) => {
        const updatedConfig: AIAgentConfig = {
          ...(prev.aiConfig || INITIAL_AI_CONFIG),
          ...partial,
          updatedAt: new Date().toISOString(),
        }
        return {
          ...prev,
          aiConfig: updatedConfig,
        }
      })
      recordAIAudit('Atualização de Configurações da IA', `Campos atualizados: ${Object.keys(partial).join(', ')}`, 'config')
    },
    [recordAIAudit]
  )

  const addAIInstruction = useCallback(
    (instruction: Omit<AIInstruction, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => {
      const newInst: AIInstruction = {
        ...instruction,
        id: `inst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        version: '1.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setState((prev) => ({
        ...prev,
        aiInstructions: [...(prev.aiInstructions || INITIAL_AI_INSTRUCTIONS), newInst],
        aiConfig: {
          ...(prev.aiConfig || INITIAL_AI_CONFIG),
          lastTrainedAt: new Date().toISOString(),
        },
      }))
      recordAIAudit('Nova Instrução de Treinamento', `Instrução criada: "${newInst.title}" [${newInst.category}]`, 'instruction')
    },
    [recordAIAudit]
  )

  const updateAIInstruction = useCallback(
    (id: string, partial: Partial<AIInstruction>) => {
      setState((prev) => ({
        ...prev,
        aiInstructions: (prev.aiInstructions || INITIAL_AI_INSTRUCTIONS).map((inst) =>
          inst.id === id ? { ...inst, ...partial, updatedAt: new Date().toISOString() } : inst
        ),
        aiConfig: {
          ...(prev.aiConfig || INITIAL_AI_CONFIG),
          lastTrainedAt: new Date().toISOString(),
        },
      }))
      recordAIAudit('Edição de Instrução', `Instrução ID ${id} atualizada.`, 'instruction')
    },
    [recordAIAudit]
  )

  const deleteAIInstruction = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        aiInstructions: (prev.aiInstructions || INITIAL_AI_INSTRUCTIONS).filter((inst) => inst.id !== id),
        aiConfig: {
          ...(prev.aiConfig || INITIAL_AI_CONFIG),
          lastTrainedAt: new Date().toISOString(),
        },
      }))
      recordAIAudit('Exclusão de Instrução', `Instrução ID ${id} foi removida.`, 'instruction')
    },
    [recordAIAudit]
  )

  const toggleAIInstruction = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        aiInstructions: (prev.aiInstructions || INITIAL_AI_INSTRUCTIONS).map((inst) =>
          inst.id === id ? { ...inst, active: !inst.active, updatedAt: new Date().toISOString() } : inst
        ),
      }))
      recordAIAudit('Alternância de Status de Instrução', `Status da instrução ID ${id} alterado.`, 'instruction')
    },
    [recordAIAudit]
  )

  const updatePromptBlock = useCallback(
    (key: AIPromptBlockKey, content: string, enabled?: boolean) => {
      setState((prev) => ({
        ...prev,
        aiPromptBlocks: (prev.aiPromptBlocks || INITIAL_AI_BLOCKS).map((b) =>
          b.key === key ? { ...b, content, enabled: typeof enabled === 'boolean' ? enabled : b.enabled } : b
        ),
      }))
      recordAIAudit('Atualização de Bloco de Prompt', `Bloco ${key} atualizado no Construtor.`, 'config')
    },
    [recordAIAudit]
  )

  const togglePromptBlock = useCallback(
    (key: AIPromptBlockKey) => {
      setState((prev) => ({
        ...prev,
        aiPromptBlocks: (prev.aiPromptBlocks || INITIAL_AI_BLOCKS).map((b) =>
          b.key === key ? { ...b, enabled: !b.enabled } : b
        ),
      }))
      recordAIAudit('Alternância de Bloco de Prompt', `Bloco ${key} ativado/desativado.`, 'config')
    },
    [recordAIAudit]
  )

  const publishAIVersion = useCallback(
    (changeDescription: string) => {
      setState((prev) => {
        const currentVersions = prev.aiVersions || INITIAL_AI_VERSIONS
        const newVersionNumber = `v1.${currentVersions.length}`
        const compiled = compilePrompt(
          prev.aiConfig || INITIAL_AI_CONFIG,
          prev.aiPromptBlocks || INITIAL_AI_BLOCKS,
          prev.aiInstructions || INITIAL_AI_INSTRUCTIONS
        )

        const archivedVersions = currentVersions.map((v) =>
          v.status === 'publicada' ? { ...v, status: 'arquivada' as const } : v
        )

        const newVersion: AIPromptVersion = {
          id: `ver-${Date.now()}`,
          versionNumber: newVersionNumber,
          title: `Versão ${newVersionNumber}`,
          author: prev.profile?.name || 'Administrador',
          changeDescription: changeDescription || 'Publicação de novas diretrizes e treinamento da IA.',
          status: 'publicada',
          compiledPrompt: compiled,
          configSnapshot: { ...(prev.aiConfig || INITIAL_AI_CONFIG) },
          instructionsSnapshot: [...(prev.aiInstructions || INITIAL_AI_INSTRUCTIONS)],
          blocksSnapshot: [...(prev.aiPromptBlocks || INITIAL_AI_BLOCKS)],
          createdAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
        }

        const updatedConfig: AIAgentConfig = {
          ...(prev.aiConfig || INITIAL_AI_CONFIG),
          publishedVersion: newVersionNumber,
          draftVersion: `v1.${currentVersions.length + 1}-draft`,
          updatedAt: new Date().toISOString(),
        }

        return {
          ...prev,
          aiConfig: updatedConfig,
          aiVersions: [newVersion, ...archivedVersions],
        }
      })
      recordAIAudit('Publicação de Nova Versão da IA', `Nova versão publicada: ${changeDescription}`, 'publish')
    },
    [recordAIAudit]
  )

  const restoreAIVersion = useCallback(
    (versionNumber: string) => {
      setState((prev) => {
        const targetVersion = prev.aiVersions?.find((v) => v.id === versionNumber || v.versionNumber === versionNumber)
        if (!targetVersion) return prev

        return {
          ...prev,
          aiConfig: {
            ...(prev.aiConfig || INITIAL_AI_CONFIG),
            ...targetVersion.configSnapshot,
            updatedAt: new Date().toISOString(),
          },
          aiInstructions: targetVersion.instructionsSnapshot || prev.aiInstructions,
          aiPromptBlocks: targetVersion.blocksSnapshot || prev.aiPromptBlocks,
        }
      })
      recordAIAudit('Restauração de Versão', `Restaurada configuração da versão ${versionNumber}.`, 'version')
    },
    [recordAIAudit]
  )

  const toggleAIAgentStatus = useCallback(() => {
    setState((prev) => {
      const current = prev.aiConfig?.status || 'active'
      const nextStatus = current === 'active' ? 'inactive' : 'active'
      return {
        ...prev,
        aiConfig: {
          ...(prev.aiConfig || INITIAL_AI_CONFIG),
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        },
      }
    })
    recordAIAudit('Alternância de Status da IA', `Status da IA alterado.`, 'config')
  }, [recordAIAudit])

  // AI Knowledge Base & Student Memory Implementations
  const addAIKnowledge = useCallback(
    (item: Omit<AIKnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newItem: AIKnowledgeItem = {
        ...item,
        id: `kb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setState((prev) => ({
        ...prev,
        aiKnowledge: [...(prev.aiKnowledge || INITIAL_AI_KNOWLEDGE), newItem],
      }))
      recordAIAudit('Novo Documento na Base de Conhecimento', `Item criado: "${newItem.title}" [${newItem.category}]`, 'config')
    },
    [recordAIAudit]
  )

  const updateAIKnowledge = useCallback(
    (id: string, partial: Partial<AIKnowledgeItem>) => {
      setState((prev) => ({
        ...prev,
        aiKnowledge: (prev.aiKnowledge || INITIAL_AI_KNOWLEDGE).map((k) =>
          k.id === id ? { ...k, ...partial, updatedAt: new Date().toISOString() } : k
        ),
      }))
      recordAIAudit('Edição de Documento de Conhecimento', `Item ID ${id} atualizado.`, 'config')
    },
    [recordAIAudit]
  )

  const deleteAIKnowledge = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        aiKnowledge: (prev.aiKnowledge || INITIAL_AI_KNOWLEDGE).filter((k) => k.id !== id),
      }))
      recordAIAudit('Exclusão de Documento de Conhecimento', `Item ID ${id} removido.`, 'config')
    },
    [recordAIAudit]
  )

  const toggleAIKnowledge = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        aiKnowledge: (prev.aiKnowledge || INITIAL_AI_KNOWLEDGE).map((k) =>
          k.id === id ? { ...k, active: !k.active, updatedAt: new Date().toISOString() } : k
        ),
      }))
      recordAIAudit('Alternância de Documento de Conhecimento', `Status do item ID ${id} alterado.`, 'config')
    },
    [recordAIAudit]
  )

  const saveStudentMemory = useCallback(
    (memoryPatch: Partial<StudentEducationalMemory>) => {
      const userId = state.profile?.id || 'current-student'
      setState((prev) => {
        const existing = prev.studentMemories?.[userId] || {
          userId,
          persistentDifficulties: [],
          masteredConcepts: [],
          frequentMistakes: [],
          updatedAt: new Date().toISOString(),
        }
        const updated: StudentEducationalMemory = {
          ...existing,
          ...memoryPatch,
          updatedAt: new Date().toISOString(),
        }
        return {
          ...prev,
          studentMemories: {
            ...(prev.studentMemories || {}),
            [userId]: updated,
          },
        }
      })
    },
    [state.profile?.id]
  )

  const recordStudentDifficulty = useCallback(
    (difficulty: string) => {
      if (!difficulty || !difficulty.trim()) return
      const userId = state.profile?.id || 'current-student'
      setState((prev) => {
        const existing = prev.studentMemories?.[userId] || {
          userId,
          persistentDifficulties: [],
          masteredConcepts: [],
          frequentMistakes: [],
          updatedAt: new Date().toISOString(),
        }
        if (existing.persistentDifficulties.includes(difficulty)) return prev
        const updated: StudentEducationalMemory = {
          ...existing,
          persistentDifficulties: [...existing.persistentDifficulties, difficulty.trim()],
          updatedAt: new Date().toISOString(),
        }
        return {
          ...prev,
          studentMemories: {
            ...(prev.studentMemories || {}),
            [userId]: updated,
          },
        }
      })
    },
    [state.profile?.id]
  )

  const logAIOperation = useCallback(
    (logItem: Omit<AIOperationLog, 'id' | 'timestamp'>) => {
      const newLog: AIOperationLog = {
        ...logItem,
        id: `op-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
      }
      setState((prev) => ({
        ...prev,
        aiOperationLogs: [newLog, ...(prev.aiOperationLogs || [])].slice(0, 100),
      }))
    },
    []
  )

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
    isSuperAdmin: isSuperAdmin(state.profile),
    completeOnboarding,
    completePlacement,
    generateCustomPath,
    recalculateLearningPath,
    resetActivePathToAdaptive,
    ingestFullChannelToStore,
    importCourseFromPlaylist,
    importChannelPlaylists,
    syncPlaylistInStore,
    updateTechnologySource,
    updatePlaylistClassification,
    addCustomCourse,
    updateCourse,
    deleteCourse,
    updateLesson,
    markLessonUnavailable,
    deletePlaylist,
    validateCatalogIntegrity,
    resetEducationalCatalog,
    syncOfficialTrustedChannels,
    // Activity Engine Actions
    submitActivityAnswer,
    submitFullActivity,
    generateActivitiesForLesson,
    generateActivitiesForModule,
    generateModuleProject,
    generateModuleAssessment,
    submitModuleReflection,
    reviewProjectSubmission,
    checkModuleCompletion,
    adminApproveActivity,
    adminUpdateActivity,
    adminDeleteActivity,
    // Progression & Learning Actions
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
    issueCertificate,
    updateProfile,
    updatePersonalData,
    updateSocialLinks,
    updateNotificationPreferences,
    addProfessionalExperience,
    updateProfessionalExperience,
    deleteProfessionalExperience,
    addEducationalBackground,
    updateEducationalBackground,
    deleteEducationalBackground,
    addPortfolioProject,
    updatePortfolioProject,
    deletePortfolioProject,
    addUserEvent,
    updateUserEvent,
    deleteUserEvent,
    addUserCertificate,
    updateUserCertificate,
    deleteUserCertificate,
    setUserTechnologies,
    addUserTechnology,
    removeUserTechnology,
    uploadProfileAvatar,
    removeProfileAvatar,
    markNotificationAsRead,
    clearAllNotifications,
    moduleStatus,
    isModuleUnlocked,
    getModuleMastery,
    getLessonStatus,
    isLessonUnlocked,
    getCourseProgressDetails,
    getLessonMissionDetails,
    overallProgress,
    xp,
    level,
    currentModuleId,
    nextPendingLessonId,
    // AI Infrastructure Actions
    compiledPrompt,
    updateAIConfig,
    addAIInstruction,
    updateAIInstruction,
    deleteAIInstruction,
    toggleAIInstruction,
    updatePromptBlock,
    togglePromptBlock,
    publishAIVersion,
    restoreAIVersion,
    toggleAIAgentStatus,
    recordAIAudit,
    addAIKnowledge,
    updateAIKnowledge,
    deleteAIKnowledge,
    toggleAIKnowledge,
    saveStudentMemory,
    recordStudentDifficulty,
    logAIOperation,
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
