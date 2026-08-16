// Domain model for DevPath AI.
// This mirrors the PostgreSQL / Supabase schema (see supabase/migrations/20260102000000_youtube_catalog_schema.sql)
// and powers the entire frontend, API layer, and YouTube course catalog.

export type SkillLevel =
  | 'iniciante-absoluto'
  | 'iniciante'
  | 'basico'
  | 'intermediario'
  | 'avancado'

export const LEVEL_LABELS: Record<SkillLevel, string> = {
  'iniciante-absoluto': 'Iniciante Absoluto',
  iniciante: 'Iniciante',
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
}

export type CareerGoal =
  | 'primeiro-emprego'
  | 'freelancer'
  | 'remoto'
  | 'proprios-sistemas'
  | 'transicao'
  | 'hobby'
  | 'evoluir'

export type DevArea =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'mobile'
  | 'data-science'
  | 'ia'
  | 'machine-learning'
  | 'devops'
  | 'cloud'
  | 'seguranca'
  | 'qa'
  | 'games'

export type LearningStyle = 'videos' | 'leitura' | 'exercicios' | 'projetos' | 'misto'

export type UserJourneyState =
  | 'NEW_USER'
  | 'ONBOARDING'
  | 'ASSESSMENT'
  | 'GENERATING_PATH'
  | 'PATH_CONFIRMATION'
  | 'ACTIVE'

export interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl?: string
  createdAt: string
  bio?: string
  github?: string
  linkedin?: string
  desiredRole?: string
  targetTechnologies?: string[]
  onboarded: boolean
  placementDone: boolean
  userJourneyState?: UserJourneyState
  isAdmin?: boolean
  xp?: number
  level?: number
  streak?: number
}

export interface LearningProfile {
  userId: string
  programmingLevel: SkillLevel
  careerGoal: CareerGoal
  desiredArea: DevArea
  desiredSpecialization: string
  preferredTechnology: string
  secondaryTechnologies: string[]
  studyTimePerDay: string
  studyDaysPerWeek: number
  hasComputer: boolean
  priorExperience: string
  knownTopics: string[]
  unknownTopics: string[]
  mainDifficulty: string
  learningPreference: LearningStyle
  professionalGoal: string
  createdAt: string
  updatedAt: string
}

export interface OnboardingData {
  currentKnowledge: SkillLevel
  goal: CareerGoal
  area: DevArea
  technologies: string[]
  hoursPerDay: string
  daysPerWeek: number
  hasComputer: boolean
  knownTopics: string[]
  biggestGoal: string
  biggestDifficulty: string
  learningStyle: LearningStyle
  financialTarget?: string
}

export interface PlacementResult {
  score: number
  level: SkillLevel | string
  strongTopics?: string[]
  weakTopics?: string[]
  recommendations?: string[]
  topicScores?: Record<string, number>
}

export interface KnowledgeGap {
  topic: string
  severity: 'alta' | 'media' | 'baixa'
  recommendedModuleId: string
  description: string
}

export interface SkillMastery {
  skillName: string
  category: string
  masteryPercent: number // 0 - 100
  lastAssessedAt: string
}

export interface ModuleMasteryScore {
  moduleId: string
  lessonsScore: number // 0-20
  exercisesScore: number // 0-30
  projectScore: number // 0-25
  assessmentScore: number // 0-25
  totalMastery: number // 0-100%
  isUnlocked: boolean
  statusLabel: 'precisa_reforco' | 'dominio_minimo' | 'bom_dominio' | 'dominio_avancado'
}

export interface DailyStudyTask {
  id: string
  title: string
  type: 'lesson' | 'exercise' | 'project' | 'review' | 'quiz'
  durationMinutes: number
  completed: boolean
  actionUrl: string
}

export interface DailyStudyPlan {
  date: string
  totalMinutes: number
  completedMinutes: number
  tasks: DailyStudyTask[]
}

export type ModuleStatus = 'locked' | 'available' | 'in-progress' | 'completed'

export type TrailItemStatus =
  | 'bloqueado'
  | 'disponivel'
  | 'em_andamento'
  | 'concluido'
  | 'revisao'
  | 'reforco'
  | 'recomendado'

export type LessonType = 'video' | 'reading' | 'external' | 'pdf'

export type VideoSourceType = 'youtube' | 'owned' | 'licensed' | 'external'

export type VideoAvailabilityStatus =
  | 'available'
  | 'embed_disabled'
  | 'private'
  | 'removed'
  | 'invalid_id'
  | 'temporary_error'
  | 'external_only'

export interface VideoMetadata {
  videoId: string
  externalVideoId: string
  videoUrl?: string
  sourceType: VideoSourceType
  sourceUrl?: string
  playlistId?: string
  position: number
  title: string
  durationSeconds: number
  durationFormatted: string
  thumbnailUrl: string
  availabilityStatus: VideoAvailabilityStatus
  youtubeExists: boolean
  embedAvailable: boolean
  lastCheckedAt: string
}

export interface Lesson {
  id: string
  moduleId: string
  order: number // posição real na playlist / módulo (1 a N)
  title: string
  type: LessonType
  durationMin: number
  description: string
  videoId?: string // YouTube external_video_id limpo
  externalVideoId?: string // Identificador externo oficial
  videoUrl?: string // URL canônica do vídeo
  sourceType?: VideoSourceType // youtube | owned | licensed | external
  source?: string // Rótulo da fonte
  playlistId?: string
  technology?: string
  topic?: string
  contentMarkdown?: string
  pdfUrl?: string
  thumbnailUrl?: string
  availabilityStatus?: VideoAvailabilityStatus
  youtubeExists?: boolean
  embedAvailable?: boolean
  lastCheckedAt?: string
  isUnavailable?: boolean
}

export type ExerciseType =
  | 'multiple-choice'
  | 'true-false'
  | 'code'
  | 'fill-code'
  | 'written'

export interface Exercise {
  id: string
  moduleId: string
  type: ExerciseType
  prompt: string
  options?: string[]
  correctIndex?: number
  correctAnswer?: string
  codeStarter?: string
  codeSolution?: string
  explanation: string
  difficulty: 'facil' | 'medio' | 'dificil'
  points?: number
}

export interface AssessmentQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation?: string
  topic: string
}

export interface Assessment {
  id: string
  moduleId: string
  title: string
  minScore: number
  timeLimitMin: number
  questions: AssessmentQuestion[]
}

export interface RecoveryPlan {
  weakTopics: string[]
  explanation: string
  recommendedLessons: string[]
  extraExercises: string[]
  miniChallenge: string
}

export interface AssessmentResult {
  score: number
  passed: boolean
  correctCount: number
  totalCount: number
  weakTopics: string[]
  strongTopics: string[]
  feedback: string
  recoveryPlan?: RecoveryPlan
}

export interface ModuleProject {
  id: string
  moduleId: string
  title: string
  description: string
  requirements: string[]
  deliverables?: string[]
  evaluationCriteria?: string[]
}

export interface ProjectSubmission {
  id: string
  moduleId: string
  title: string
  description: string
  githubUrl: string
  deployUrl?: string
  status: 'submitted' | 'approved' | 'rejected'
  grade?: number
  feedback?: string
  submittedAt: string
}

export interface LearningModule {
  id: string
  order: number
  phase: string
  phaseOrder: number
  title: string
  slug?: string
  description: string
  objective: string
  icon: string
  prerequisites: string[] // module ids
  lessonIds: string[]
  exerciseCount: number
  hasProject: boolean
  hasAssessment: boolean
  estimatedHours: number
  skills: string[]
  courseId?: string
  technology?: string
}

export interface LearningPathItem {
  id: string
  learningPathId?: string
  courseId?: string
  moduleId: string
  phase: string
  phaseOrder: number
  position: number
  title: string
  description: string
  status: TrailItemStatus
  locked: boolean
  required: boolean
  recommendationReason: string
  unlockRequirement: string
  skills: string[]
  estimatedHours: number
  lessonIds: string[]
  masteryScore?: number
}

export interface TrailAdaptationNotice {
  id: string
  date: string
  reason: string
  changesMade: string
  weakTopic?: string
}

export interface LearningPath {
  id: string
  title: string
  goal: string
  area: DevArea
  description: string
  moduleIds: string[]
  items?: LearningPathItem[]
  adaptations?: TrailAdaptationNotice[]
  knowledgeGaps?: KnowledgeGap[]
  skillMastery?: Record<string, number>
  customizedFor?: string
  generatedAt?: string
}

// Per-user progress state
export interface LessonProgress {
  lessonId: string
  completed: boolean
  watchedSeconds: number
  lastPositionSeconds?: number
  watchPercentage?: number
  notes?: string
}

export interface ModuleProgress {
  moduleId: string
  lessonsCompleted: number
  exercisesCompleted: number
  projectSubmitted: boolean
  assessmentScore: number | null
  masteryScore?: number
  status: ModuleStatus
}

export interface UserProject {
  id: string
  title: string
  description: string
  tech: string[]
  github?: string
  deploy?: string
  status: 'ideia' | 'em-desenvolvimento' | 'concluido' | 'publicado'
  createdAt: string
  tags: string[]
}

export interface Difficulty {
  topic: string
  count: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  xpReward?: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
}

export interface StudyPlanItem {
  id: string
  title: string
  durationMinutes: number
  type: 'lesson' | 'exercise' | 'practice' | 'review' | 'quiz'
  completed: boolean
  actionUrl: string
}

export interface SpacedReviewItem {
  id: string
  topic: string
  moduleId: string
  moduleTitle: string
  dueDate: string
  intervalDays: number
  question: string
  answer: string
  completed: boolean
}

export interface InterviewMessage {
  id: string
  role: 'interviewer' | 'candidate'
  content: string
  createdAt: string
  feedback?: string
  score?: number
}

export interface InterviewReport {
  roleTitle: string
  seniority: string
  overallScore: number
  strengths: string[]
  improvements: string[]
  recommendations: string[]
  date: string
}

export interface CertificateData {
  id: string
  pathTitle: string
  recipientName: string
  completionDate: string
  averageGrade: number
  validationCode: string
  hours: number
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'streak' | 'achievement' | 'review'
  read: boolean
  actionUrl?: string
  createdAt: string
}

export interface DailyStudyRecord {
  day: string // 'Seg', 'Ter', etc.
  date: string
  minutes: number
}

// ============================================================
// YouTube Integration & Educational Course Catalog Models
// ============================================================

export interface ContentSource {
  id: string
  name: string
  sourceType: 'youtube_channel' | 'curated_channel' | 'community'
  channelId?: string
  channelUrl: string
  handle?: string
  channelThumbnail?: string
  description?: string
  priority: number // 100 = máxima prioridade
  isTrusted: boolean
  isActive: boolean
  autoClassify?: boolean
  playlistsCount?: number
  videosCount?: number
  lastSyncedAt?: string
  createdAt: string
  updatedAt: string
}

export interface YouTubePlaylist {
  id: string
  youtubePlaylistId: string
  channelId?: string
  channelTitle: string
  title: string
  description: string
  thumbnailUrl: string
  youtubeUrl: string
  itemCount: number
  videoCount?: number
  category: string
  technology: string
  level: SkillLevel
  status: 'ativo' | 'em_revisao' | 'inativo'
  classificationConfidence: number // 0-100%
  lastSyncedAt?: string
  createdAt: string
  updatedAt: string
}

export interface YouTubeVideo {
  id: string
  youtubeVideoId: string
  externalVideoId?: string
  playlistId: string
  title: string
  description: string
  channelId?: string
  channelTitle?: string
  thumbnailUrl: string
  durationSeconds: number
  durationFormatted: string
  position: number
  publishedAt?: string
  youtubeUrl: string
  videoUrl?: string
  technology: string
  topic: string
  level: SkillLevel
  status: 'ativo' | 'indisponivel'
  sourceType?: VideoSourceType
  availabilityStatus?: VideoAvailabilityStatus
  youtubeExists?: boolean
  embedAvailable?: boolean
  lastCheckedAt?: string
  isUnavailable?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  level: SkillLevel
  technology: string
  category: string
  thumbnailUrl: string
  status: 'ativo' | 'rascunho' | 'arquivado'
  sourceId?: string
  sourcePlaylistId?: string
  playlistId?: string
  playlistUrl?: string
  channelTitle?: string
  classificationConfidence?: number
  prerequisites?: string[]
  skills?: string[]
  modulesCount: number
  lessonsCount: number
  totalHours: number
  createdAt: string
  updatedAt: string
}

export interface CourseSource {
  id: string
  courseId: string
  playlistId: string
  priority: number
  isActive: boolean
  createdAt: string
}

export interface TechnologySource {
  id: string
  technology: string
  primaryPlaylistId: string
  primaryPlaylistUrl: string
  channelTitle: string
  fallbackPlaylistIds?: string[]
  status: 'ativo' | 'em_revisao' | 'inativo'
  updatedAt: string
}

export interface ImportLog {
  id: string
  playlistId: string
  playlistTitle: string
  channelTitle: string
  status: 'sucesso' | 'erro' | 'parcial'
  videosFound: number
  videosImported: number
  videosUnavailable: number
  duplicatesIgnored: number
  createdAt: string
  message?: string
}

export interface IngestionReport {
  channelName: string
  channelHandle: string
  playlistsFound: number
  playlistsImported: number
  videosFound: number
  videosImported: number
  duplicatesIgnored: number
  unavailableCount: number
  autoApprovedCount: number
  pendingReviewCount: number
  coursesGenerated: number
  ingestedAt: string
}

export interface ContentConsistencyReport {
  isValid: boolean
  checkedAt: string
  totalCourses: number
  totalModules: number
  totalLessons: number
  issues: ValidationIssue[]
}

export interface ValidationIssue {
  type: 'TECH_MISMATCH' | 'MISSING_VIDEO' | 'INVALID_SOURCE' | 'DUPLICATE_VIDEO_ID'
  severity: 'error' | 'warning'
  courseId: string
  moduleId?: string
  lessonId?: string
  message: string
  details?: Record<string, any>
}
