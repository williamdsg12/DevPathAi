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
  | 'devops'
  | 'cloud'
  | 'database'
  | 'cybersecurity'
  | 'software-engineering'
  | 'qa'
  | 'machine-learning'
  | 'seguranca'
  | 'games'

export const AREA_LABELS: Record<string, string> = {
  frontend: 'Front-end Moderno (React, Next.js, Web)',
  backend: 'Back-end & APIs (Node.js, Python, SQL)',
  fullstack: 'Full Stack Developer (JS / TS / Node / React)',
  mobile: 'Mobile Development (React Native & Flutter)',
  'data-science': 'Data Science & Analytics',
  ia: 'Inteligência Artificial & IA Generativa / LLMs',
  devops: 'DevOps & CI/CD (Docker, Kubernetes, Linux)',
  cloud: 'Cloud Computing (AWS, GCP, Azure)',
  database: 'Bancos de Dados & Modelagem SQL / NoSQL',
  cybersecurity: 'Cybersecurity, Pentest & Web Security',
  'software-engineering': 'Engenharia de Software, SOLID & Arquitetura',
  qa: 'QA & Automação de Testes (Playwright, Jest)',
  'machine-learning': 'Machine Learning & MLOps',
  seguranca: 'Segurança da Informação',
  games: 'Desenvolvimento de Jogos',
}

export type LearningStyle = 'videos' | 'leitura' | 'exercicios' | 'projetos' | 'misto'

export type UserJourneyState =
  | 'NEW_USER'
  | 'ONBOARDING'
  | 'ASSESSMENT'
  | 'GENERATING_PATH'
  | 'PATH_CONFIRMATION'
  | 'ACTIVE'

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'STUDENT'

export interface SocialLinks {
  linkedin?: string
  github?: string
  facebook?: string
  instagram?: string
  pinterest?: string
  youtube?: string
  twitter?: string
  blog?: string
}

export interface NotificationPreferences {
  newPrograms: boolean
  contentUpdates: boolean
  activitiesDeadlines: boolean
  aiFeedback: boolean
}

export interface ProfessionalExperience {
  id: string
  role: string
  company: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  description: string
}

export interface EducationalBackground {
  id: string
  institution: string
  course: string
  level: 'Graduação' | 'Pós-Graduação' | 'Mestrado' | 'Doutorado' | 'Técnico' | 'Tecnólogo' | 'Ensino Médio' | 'Curso Livre'
  startDate: string
  endDate?: string
  status: 'Concluído' | 'Em Andamento' | 'Trancado' | 'Interrompido'
  description?: string
}

export interface PortfolioProject {
  id: string
  title: string
  description: string
  projectUrl?: string
  repositoryUrl?: string
  technologies: string[]
  date: string
  status: 'Concluído' | 'Em Desenvolvimento' | 'Ideia' | 'Publicado'
  coverUrl?: string
}

export interface UserEvent {
  id: string
  title: string
  organizer: string
  date: string
  location: string
  speakerRole: 'Participante' | 'Palestrante' | 'Organizador' | 'Voluntário'
  description?: string
}

export interface UserCertificateRecord {
  id: string
  name: string
  institution: string
  issueDate: string
  validationUrl?: string
  certificateCode?: string
  fileUrl?: string
  isOfficialDevPath?: boolean
}

export interface UserTechnologyRecord {
  id: string
  name: string
  category: string
  proficiencyLevel: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Especialista'
}

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
  cpf?: string
  birthDate?: string
  locationType?: 'brasil' | 'exterior'
  phone?: string
  commercialPhone?: string
  cep?: string
  socialLinks?: SocialLinks
  notificationPreferences?: NotificationPreferences
  onboarded: boolean
  placementDone: boolean
  userJourneyState?: UserJourneyState
  isAdmin?: boolean
  role?: UserRole
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

export interface KnowledgeMap {
  logic: number // Lógica de Programação & Algoritmos (0-100)
  algorithms: number // Estruturas & Raciocínio (0-100)
  html: number // HTML5 Semântico (0-100)
  css: number // CSS3, Flexbox & Grid (0-100)
  javascript: number // JavaScript Moderno ES6+ (0-100)
  git: number // Git & GitHub (0-100)
  databases: number // SQL & Modelagem de Dados (0-100)
  apis: number // APIs REST & Backend (0-100)
}

export interface PlacementResult {
  score: number // overall_score
  overallScore?: number
  level: SkillLevel | string
  declaredLevel?: SkillLevel | string
  knowledgeMap?: KnowledgeMap
  topicScores?: Record<string, number>
  strongTopics?: string[]
  weakTopics?: string[]
  recommendations?: string[]
  startingStage?: 'LOGIC_AND_PROGRAMMING_FOUNDATIONS' | 'ADVANCED_ENTRY'
  mandatoryLogic?: boolean
}

export interface KnowledgeGap {
  topic: string
  severity: 'alta' | 'media' | 'baixa'
  recommendedModuleId: string
  description: string
  isContentGap?: boolean // Flag quando não há conteúdo no catálogo real
}

export interface ContentGapAudit {
  id: string
  stageRequired: string
  technology: string
  missingTopic: string
  reason: string
  detectedAt: string
  affectedUsersCount: number
}

export interface ContentHealthMetrics {
  totalCourses: number
  completeCourses: number
  coursesWithGaps: number
  totalVideos: number
  unavailableVideos: number
  lessonsWithoutVideo: number
  contentGaps: ContentGapAudit[]
}

export interface TrailAuditData {
  trailId: string
  userId: string
  userName: string
  targetCareer: string
  declaredLevel: string
  diagnosticScore: number
  startingStage: string
  decisionReason: string
  knowledgeMap: KnowledgeMap
  prerequisitesValidated: string[]
  gapsIdentified: string[]
  courseSequenceAudit: {
    courseId: string
    courseTitle: string
    reason: string
    prerequisiteStatus: string
  }[]
  generatedAt: string
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

export type ActivityType =
  | 'multiple_choice'
  | 'true_false'
  | 'written'
  | 'fill_code'
  | 'find_bug'
  | 'fix_code'
  | 'code'
  | 'practical_challenge'
  | 'mini_project'
  | 'module_project'

export type ActivityDifficulty = 'facil' | 'medio' | 'dificil' | 'desafio'

export type ActivityStatus = 'draft' | 'review' | 'approved' | 'published'

export interface LearningActivity {
  id: string
  title: string
  statement: string // Enunciado REAL obrigatório e descritivo
  description?: string
  objective?: string
  type: ActivityType
  difficulty: ActivityDifficulty
  status: ActivityStatus
  xpReward: number
  expectedTimeMin: number
  courseId?: string
  moduleId: string
  lessonId: string // Vínculo canônico com a aula
  skillId?: string
  skillName: string
  technology: string
  options?: string[]
  correctOptionIndex?: number
  correctAnswer?: string
  codeStarter?: string
  codeSolution?: string
  testCases?: Array<{ input: string; expectedOutput: string; description?: string }>
  explanation: string
  hint?: string // Dica na 1ª tentativa
  detailedGuidance?: string // Orientação na 2ª tentativa
  activityHash?: string
  isMandatory?: boolean
  createdAt: string
  updatedAt?: string
}

// Backward compatibility alias
export type ExerciseType = ActivityType
export interface Exercise extends LearningActivity {
  prompt?: string
  correctIndex?: number
  points?: number
}

export interface ActivityAttempt {
  id: string
  activityId: string
  userId: string
  answer: string | number
  score: number // 0 a 100
  isCorrect: boolean
  feedback: string
  hintProvided?: string
  timeSpentSeconds: number
  attemptNumber: number
  submittedAt: string
}

export interface ProjectRubricCriterion {
  criterion: string
  weightPercent: number // soma 100%
  description: string
}

export interface ModuleProject {
  id: string
  moduleId: string
  courseId?: string
  title: string
  description: string
  technology: string
  difficulty: ActivityDifficulty
  requirements: string[]
  deliverables: string[]
  rubric: ProjectRubricCriterion[]
  starterCodeUrl?: string
  evaluationCriteria?: string[]
  status: ActivityStatus
  createdAt: string
}

export interface ProjectSubmission {
  id: string
  moduleId: string
  title: string
  description: string
  githubUrl: string
  deployUrl?: string
  codeContent?: string
  status: 'submitted' | 'approved' | 'rejected'
  grade?: number
  feedback?: string
  rubricEvaluation?: Array<{ criterion: string; score: number; feedback: string }>
  submittedAt: string
  evaluatedAt?: string
}

export interface AssessmentQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation?: string
  topic: string
  skillName?: string
  points?: number
}

export interface Assessment {
  id: string
  moduleId: string
  title: string
  minScore: number
  timeLimitMin: number
  questions: AssessmentQuestion[]
  createdAt?: string
}

export interface RecoveryPlan {
  weakTopics: string[]
  explanation: string
  recommendedLessons: string[]
  extraExercises: string[]
  miniChallenge: string
  reinforcementActivityIds?: string[]
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
  attemptNumber?: number
}

export interface ModuleReflection {
  id: string
  userId: string
  moduleId: string
  overallFeedback: string
  hardestTopic: string
  unmasteredTopic: string
  topicsToReview: string[]
  preparedToAdvance: boolean
  aiRecommendations?: string
  submittedAt: string
}

export interface ModuleCompletionStatus {
  moduleId: string
  lessonsCompleted: boolean
  activitiesCompleted: boolean
  projectCompleted: boolean
  assessmentPassed: boolean
  reflectionCompleted: boolean
  isFullyCompleted: boolean
  totalScore: number
  blockReason?: string
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
  contentGap?: boolean
  selectedFromCatalog?: boolean
  pedagogicalRationale?: string
  prerequisitesValidated?: string[]
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
  knowledgeMap?: KnowledgeMap
  startingStage?: string
  mandatoryLogic?: boolean
  diagnosticScore?: number
  customizedFor?: string
  generatedAt?: string
  recalculatedAt?: string
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
  playlistsFailed?: number
  failedPlaylistsList?: Array<{ playlistId: string; title: string; error: string }>
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
