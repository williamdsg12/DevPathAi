/**
 * LearningPathEngine — AI Smart Adaptive Curriculum & Prerequisite Dependency Engine
 *
 * Implements strict pedagogical progression rules:
 * 1. BEGINNER_THRESHOLD = 65
 * 2. If declared_level = NONE/BEGINNER or overall_score < 65 or logic < 65:
 *    - MANDATORY STAGE 1: Logic and Programming Foundations (Lógica & Algoritmos)
 *    - Chosen technology (e.g. JS, Python, React) is the TARGET GOAL, not the first step!
 * 3. Consults ONLY the authentic Catalog. If no Logic course exists, flags CONTENT_GAP instead of injecting Python.
 * 4. For score >= 65%: Evaluates topic_scores, knowledge_map, and career prerequisites to determine entry point.
 * 5. Complete separation between Content Catalog (global) and Learning Path (individual & persisted).
 */

import type {
  Course,
  DailyStudyPlan,
  DailyStudyTask,
  DevArea,
  KnowledgeGap,
  KnowledgeMap,
  LearningModule,
  LearningPath,
  LearningPathItem,
  Lesson,
  ModuleMasteryScore,
  ModuleProgress,
  OnboardingData,
  PlacementResult,
  SkillLevel,
  SpacedReviewItem,
  TrailAdaptationNotice,
  TrailAuditData,
  TrailItemStatus,
  UserProfile,
} from '@/lib/types'

export const BEGINNER_THRESHOLD = 65

export interface TrailGenerationResult {
  path: LearningPath
  courseSequence: Course[]
  moduleSequence: LearningModule[]
  initialModuleId: string
  initialLessonId: string
  estimatedHours: number
  estimatedMonths: number
  rationale: string
  knowledgeGaps: KnowledgeGap[]
  skillMastery: Record<string, number>
  knowledgeMap: KnowledgeMap
  startingStage: 'LOGIC_AND_PROGRAMMING_FOUNDATIONS' | 'ADVANCED_ENTRY'
  mandatoryLogic: boolean
  auditData?: TrailAuditData
}

export class LearningPathEngine {
  /**
   * Calculates weighted Module Mastery Score (Aulas 20%, Exercícios 30%, Projeto 25%, Avaliação 25%)
   * Requirement: Total Mastery >= 50% allows advancement to the next module.
   */
  public calculateModuleMastery(
    moduleId: string,
    progress: ModuleProgress | undefined,
    mod: LearningModule | undefined,
  ): ModuleMasteryScore {
    if (!mod) {
      return {
        moduleId,
        lessonsScore: 0,
        exercisesScore: 0,
        projectScore: 0,
        assessmentScore: 0,
        totalMastery: 0,
        isUnlocked: false,
        statusLabel: 'precisa_reforco',
      }
    }

    const totalLessons = Math.max(1, mod.lessonIds?.length || 1)
    const lessonsDone = progress?.lessonsCompleted ?? 0
    const lessonsScore = Math.min(20, Math.round((lessonsDone / totalLessons) * 20))

    const totalExercises = Math.max(1, mod.exerciseCount || 1)
    const exercisesDone = progress?.exercisesCompleted ?? 0
    const exercisesScore = Math.min(30, Math.round((exercisesDone / totalExercises) * 30))

    let projectScore = 0
    if (!mod.hasProject) {
      projectScore = 25
    } else if (progress?.projectSubmitted) {
      projectScore = 25
    }

    let assessmentScore = 0
    if (!mod.hasAssessment) {
      assessmentScore = 25
    } else if (progress?.assessmentScore !== null && progress?.assessmentScore !== undefined) {
      assessmentScore = Math.min(25, Math.round((progress.assessmentScore / 100) * 25))
    }

    const totalMastery = lessonsScore + exercisesScore + projectScore + assessmentScore
    const isUnlocked = totalMastery >= 50

    let statusLabel: ModuleMasteryScore['statusLabel'] = 'precisa_reforco'
    if (totalMastery >= 85) statusLabel = 'dominio_avancado'
    else if (totalMastery >= 70) statusLabel = 'bom_dominio'
    else if (totalMastery >= 50) statusLabel = 'dominio_minimo'

    return {
      moduleId,
      lessonsScore,
      exercisesScore,
      projectScore,
      assessmentScore,
      totalMastery,
      isUnlocked,
      statusLabel,
    }
  }

  /**
   * Generates a personalized daily study plan adapted to the user's availability and active module.
   */
  public generateDailyStudyPlan(
    profile: UserProfile | null,
    currentModule: LearningModule | null,
    nextPendingLesson: Lesson | null,
    pendingReviews: SpacedReviewItem[],
    dailyTargetMinutes = 45,
  ): DailyStudyPlan {
    const tasks: DailyStudyTask[] = []
    let totalMins = 0

    // 1. Core lesson task
    if (nextPendingLesson) {
      const dur = nextPendingLesson.durationMin || 15
      tasks.push({
        id: `task-lesson-${nextPendingLesson.id}`,
        title: `Assistir aula: ${nextPendingLesson.title}`,
        type: 'lesson',
        durationMinutes: dur,
        completed: false,
        actionUrl: `/aulas/${nextPendingLesson.id}`,
      })
      totalMins += dur
    }

    // 2. Practical exercise task
    if (currentModule) {
      tasks.push({
        id: `task-ex-${currentModule.id}`,
        title: `Resolver exercícios práticos de ${currentModule.title}`,
        type: 'exercise',
        durationMinutes: 12,
        completed: false,
        actionUrl: `/exercicios`,
      })
      totalMins += 12
    }

    // 3. Spaced repetition review task
    if (pendingReviews.length > 0) {
      tasks.push({
        id: `task-rev-${pendingReviews[0].id}`,
        title: `Revisar flashcard: ${pendingReviews[0].topic}`,
        type: 'review',
        durationMinutes: 8,
        completed: false,
        actionUrl: `/revisoes`,
      })
      totalMins += 8
    }

    return {
      date: new Date().toISOString(),
      totalMinutes: totalMins || dailyTargetMinutes,
      completedMinutes: 0,
      tasks,
    }
  }

  /**
   * Normalizes or extracts the comprehensive KnowledgeMap from placement test data.
   */
  public extractKnowledgeMap(
    onboarding: OnboardingData | null,
    placement: PlacementResult | null
  ): KnowledgeMap {
    if (placement?.knowledgeMap) {
      return placement.knowledgeMap
    }

    const score = placement?.score ?? 0
    const known = onboarding?.knownTopics || []
    const isBeginner =
      onboarding?.currentKnowledge === 'zero' ||
      onboarding?.currentKnowledge === 'iniciante' ||
      score < BEGINNER_THRESHOLD

    if (isBeginner) {
      return {
        logic: Math.min(score, 50),
        algorithms: Math.max(0, Math.round(score * 0.7)),
        html: known.includes('HTML e CSS básico') ? 45 : 15,
        css: known.includes('HTML e CSS básico') ? 40 : 10,
        javascript: known.includes('JavaScript básico') ? 35 : 5,
        git: known.includes('Git e GitHub') ? 35 : 0,
        databases: 10,
        apis: 5,
      }
    }

    // Intermediate / Advanced baseline calculation
    return {
      logic: Math.max(score, 70),
      algorithms: Math.max(score - 10, 60),
      html: known.includes('HTML e CSS básico') ? 85 : 60,
      css: known.includes('HTML e CSS básico') ? 80 : 55,
      javascript: known.includes('JavaScript básico') ? 75 : 45,
      git: known.includes('Git e GitHub') ? 70 : 40,
      databases: Math.max(score - 20, 30),
      apis: Math.max(score - 25, 25),
    }
  }

  /**
   * Calculates specific Knowledge Gaps and Skill Mastery percentages.
   */
  public calculateGapsAndMastery(
    onboarding: OnboardingData | null,
    placement: PlacementResult | null,
  ): {
    knowledgeGaps: KnowledgeGap[]
    skillMastery: Record<string, number>
    knowledgeMap: KnowledgeMap
  } {
    const kMap = this.extractKnowledgeMap(onboarding, placement)
    const gaps: KnowledgeGap[] = []

    // 1. Logic Gap
    if (kMap.logic < BEGINNER_THRESHOLD) {
      gaps.push({
        topic: 'Lógica de Programação & Pensamento Computacional',
        severity: 'alta',
        recommendedModuleId: 'mod-logica',
        description: `Aproveitamento em lógica (${kMap.logic}%) abaixo do limiar pedagógico de ${BEGINNER_THRESHOLD}%. Fundamento indispensável.`,
      })
    }

    // 2. Algorithms Gap
    if (kMap.algorithms < BEGINNER_THRESHOLD) {
      gaps.push({
        topic: 'Algoritmos & Estruturas de Decisão/Repetição',
        severity: 'alta',
        recommendedModuleId: 'mod-algoritmos',
        description: 'Reforço necessário em loops (for/while), condicionais e estruturas de dados básicas.',
      })
    }

    // 3. Git Gap
    if (kMap.git < 50) {
      gaps.push({
        topic: 'Controle de Versão com Git & GitHub',
        severity: 'media',
        recommendedModuleId: 'mod-git',
        description: 'Fluxo de versionamento, commits, branches e publicação no repositório.',
      })
    }

    // 4. HTML/CSS Gap
    if (kMap.html < 60 || kMap.css < 60) {
      gaps.push({
        topic: 'Estruturação & Estilização Web (HTML5/CSS3)',
        severity: 'media',
        recommendedModuleId: 'mod-html',
        description: 'Semântica web, acessibilidade, Flexbox e layouts responsivos.',
      })
    }

    // 5. JavaScript Gap
    if (kMap.javascript < 65) {
      gaps.push({
        topic: 'JavaScript Moderno ES6+ & DOM',
        severity: 'alta',
        recommendedModuleId: 'mod-js',
        description: 'Manipulação de elementos, eventos, Promises, Fetch API e funções assíncronas.',
      })
    }

    const skillMastery: Record<string, number> = {
      'Lógica de Programação': kMap.logic,
      'Algoritmos & Raciocínio': kMap.algorithms,
      'Git & GitHub': kMap.git,
      'HTML5 Semântico': kMap.html,
      'CSS3 & Flexbox/Grid': kMap.css,
      'JavaScript ES6+': kMap.javascript,
      'Bancos de Dados & SQL': kMap.databases,
      'APIs REST & Backend': kMap.apis,
    }

    return { knowledgeGaps: gaps, skillMastery, knowledgeMap: kMap }
  }

  /**
   * Classifica semanticamente um módulo em fases pedagógicas universais.
   */
  public classifyModulePedagogically(
    mod: LearningModule,
    courses: Course[] = []
  ): {
    phaseOrder: number
    phaseName: string
    categoryKey: string
    isFoundation: boolean
    standardOrder: number
  } {
    const course = courses.find(
      (c) => c.id === mod.courseId || c.playlistId === mod.id.replace('mod-', '')
    )
    const combined = [
      mod.id,
      mod.title,
      mod.slug,
      mod.description,
      mod.technology,
      mod.phase,
      ...(mod.skills || []),
      course?.title || '',
      course?.description || '',
      course?.technology || '',
      course?.category || '',
    ]
      .join(' ')
      .toLowerCase()

    // 1. Lógica de Programação & Algoritmos (Base Fundamental Universal)
    if (
      combined.includes('lógica') ||
      combined.includes('logica') ||
      combined.includes('algoritmo') ||
      combined.includes('pseudocódigo') ||
      combined.includes('pseudocodigo') ||
      combined.includes('portugol') ||
      combined.includes('visualg') ||
      combined.includes('pensamento computacional') ||
      (combined.includes('fundamentos') && !combined.includes('web') && !combined.includes('react') && !combined.includes('node'))
    ) {
      return {
        phaseOrder: 1,
        phaseName: 'FASE 1 — Fundamentos da Programação & Algoritmos',
        categoryKey: 'logica',
        isFoundation: true,
        standardOrder: 1,
      }
    }

    // 2. Git & Versionamento & Terminal
    if (
      combined.includes('git') ||
      combined.includes('github') ||
      combined.includes('versionamento') ||
      combined.includes('terminal') ||
      combined.includes('linha de comando')
    ) {
      return {
        phaseOrder: 1,
        phaseName: 'FASE 1 — Controle de Versão & Ferramental (Git)',
        categoryKey: 'git',
        isFoundation: true,
        standardOrder: 2,
      }
    }

    // 3. HTML5 & CSS3
    if (
      combined.includes('html') ||
      combined.includes('css') ||
      combined.includes('web design') ||
      combined.includes('flexbox') ||
      combined.includes('grid layout') ||
      combined.includes('responsividade') ||
      combined.includes('semântica web')
    ) {
      return {
        phaseOrder: 2,
        phaseName: 'FASE 2 — Estruturação & Estilização Web (HTML5/CSS3)',
        categoryKey: 'html_css',
        isFoundation: false,
        standardOrder: 3,
      }
    }

    // 4. JavaScript Core
    if (
      (combined.includes('javascript') || combined.includes('ecmascript') || combined.includes(' js ')) &&
      !combined.includes('react') &&
      !combined.includes('next') &&
      !combined.includes('node') &&
      !combined.includes('vue') &&
      !combined.includes('angular')
    ) {
      return {
        phaseOrder: 3,
        phaseName: 'FASE 3 — Tecnologia Central (JavaScript Moderno)',
        categoryKey: 'javascript',
        isFoundation: false,
        standardOrder: 4,
      }
    }

    // 5. TypeScript
    if (combined.includes('typescript') || combined.includes(' ts ')) {
      return {
        phaseOrder: 3,
        phaseName: 'FASE 3 — Tipagem Estática & Qualidade (TypeScript)',
        categoryKey: 'typescript',
        isFoundation: false,
        standardOrder: 5,
      }
    }

    // 6. Front-end Frameworks (React, Next.js, Vue)
    if (
      combined.includes('react') ||
      combined.includes('next') ||
      combined.includes('vue') ||
      combined.includes('angular') ||
      combined.includes('tailwind') ||
      combined.includes('frontend') ||
      combined.includes('front-end')
    ) {
      return {
        phaseOrder: 4,
        phaseName: 'FASE 4 — Especialização Front-end (React & Frameworks)',
        categoryKey: 'frontend',
        isFoundation: false,
        standardOrder: 6,
      }
    }

    // 7. Back-end & Linguagens (Node.js, Express, APIs REST, Python)
    if (
      combined.includes('node') ||
      combined.includes('express') ||
      combined.includes('nest') ||
      combined.includes('api rest') ||
      combined.includes('backend') ||
      combined.includes('back-end') ||
      combined.includes('fastapi') ||
      combined.includes('django') ||
      combined.includes('python')
    ) {
      return {
        phaseOrder: 5,
        phaseName: 'FASE 5 — Especialização Back-end & APIs',
        categoryKey: 'backend',
        isFoundation: false,
        standardOrder: 7,
      }
    }

    // 8. Banco de Dados & SQL
    if (
      combined.includes('sql') ||
      combined.includes('mysql') ||
      combined.includes('postgres') ||
      combined.includes('database') ||
      combined.includes('banco de dados') ||
      combined.includes('prisma') ||
      combined.includes('mongodb')
    ) {
      return {
        phaseOrder: 6,
        phaseName: 'FASE 6 — Bancos de Dados & Persistência',
        categoryKey: 'database',
        isFoundation: false,
        standardOrder: 8,
      }
    }

    // 9. Full Stack & Deploy & Projetos
    if (
      combined.includes('fullstack') ||
      combined.includes('full stack') ||
      combined.includes('deploy') ||
      combined.includes('docker') ||
      combined.includes('devops') ||
      combined.includes('projeto')
    ) {
      return {
        phaseOrder: 7,
        phaseName: 'FASE 7 — Integração Full Stack & Deploy',
        categoryKey: 'fullstack',
        isFoundation: false,
        standardOrder: 9,
      }
    }

    // 10. Carreira & Portfólio
    return {
      phaseOrder: 8,
      phaseName: 'FASE 8 — Carreira & Portfólio Profissional',
      categoryKey: 'carreira',
      isFoundation: false,
      standardOrder: 10,
    }
  }

  /**
   * Determina a relevância de um módulo para a carreira escolhida pelo aluno.
   * Evita colocar cursos de tecnologias desconexas (ex: Python em Fullstack JS sem necessidade).
   */
  public isModuleRelevantForCareer(
    categoryKey: string,
    modTechnology: string,
    area: DevArea,
    targetTechs: string[] = []
  ): boolean {
    const techLower = (modTechnology || '').toLowerCase()
    const targetTechsLower = targetTechs.map((t) => t.toLowerCase())

    // 1. Fundamentos universais (Lógica, Git) são SEMPRE relevantes para qualquer carreira
    if (categoryKey === 'logica' || categoryKey === 'git') {
      return true
    }

    // 2. Se o aluno especificou explicitamente a tecnologia, ela é relevante
    if (targetTechsLower.some((t) => techLower.includes(t) || t.includes(techLower))) {
      return true
    }

    // 3. Regras por carreira
    switch (area) {
      case 'frontend':
        return ['html_css', 'javascript', 'typescript', 'frontend', 'carreira'].includes(categoryKey)

      case 'backend':
        return ['backend', 'database', 'typescript', 'javascript', 'carreira'].includes(categoryKey)

      case 'fullstack':
        return ['html_css', 'javascript', 'typescript', 'frontend', 'backend', 'database', 'fullstack', 'carreira'].includes(categoryKey)

      case 'data-science':
      case 'ia':
      case 'machine-learning':
        return techLower.includes('python') || ['database', 'backend', 'carreira'].includes(categoryKey)

      case 'mobile':
        return ['javascript', 'typescript', 'frontend', 'carreira'].includes(categoryKey) || techLower.includes('mobile') || techLower.includes('react native') || techLower.includes('flutter')

      case 'devops':
      case 'cloud':
        return ['backend', 'database', 'fullstack', 'carreira'].includes(categoryKey) || techLower.includes('docker') || techLower.includes('linux') || techLower.includes('aws')

      case 'cybersecurity':
      case 'seguranca':
        return ['backend', 'database', 'carreira'].includes(categoryKey) || techLower.includes('segurança') || techLower.includes('security') || techLower.includes('linux')

      case 'database':
        return ['database', 'backend', 'carreira'].includes(categoryKey)

      case 'qa':
        return ['javascript', 'typescript', 'frontend', 'backend', 'carreira'].includes(categoryKey) || techLower.includes('test') || techLower.includes('qa')

      case 'software-engineering':
        return ['javascript', 'typescript', 'backend', 'database', 'fullstack', 'carreira'].includes(categoryKey)

      default:
        return true
    }
  }

  /**
   * Generates a fully personalized, adaptive learning trail based on authentic catalog content.
   */
  public generateAdaptiveTrail(
    profile: UserProfile | null,
    onboarding: OnboardingData | null,
    placement: PlacementResult | null,
    availableCourses: Course[],
    availableModules: LearningModule[],
    availableLessons: Lesson[],
  ): TrailGenerationResult {
    const area: DevArea = onboarding?.area || 'fullstack'
    const declaredLevel: SkillLevel = (onboarding?.currentKnowledge as SkillLevel) || 'iniciante'
    const userName = profile?.name || 'Aluno DevPath'
    const score = placement?.score ?? 0
    const targetTechs = onboarding?.technologies || []

    const { knowledgeGaps, skillMastery, knowledgeMap } = this.calculateGapsAndMastery(onboarding, placement)

    // ============================================================
    // REGRA FUNDAMENTAL DOS 65%:
    // Se declared_level = NONE/BEGINNER ou overall_score < 65 ou knowledgeMap.logic < 65:
    // Ponto de partida obrigatório = Lógica de Programação / Fundamentos
    // ============================================================
    const isDeclaredBeginner = declaredLevel === 'iniciante-absoluto' || declaredLevel === 'iniciante'
    const isScoreBelowThreshold = score < BEGINNER_THRESHOLD
    const isLogicWeak = knowledgeMap.logic < BEGINNER_THRESHOLD

    const requiresMandatoryLogic = isDeclaredBeginner || isScoreBelowThreshold || isLogicWeak
    const startingStage = requiresMandatoryLogic ? 'LOGIC_AND_PROGRAMMING_FOUNDATIONS' : 'ADVANCED_ENTRY'

    let title = 'Trilha Personalizada: Full Stack Developer'
    let months = 6

    if (area === 'frontend') {
      title = 'Trilha Personalizada: Front-End Moderno (React & Next.js)'
      months = 4
    } else if (area === 'backend') {
      title = 'Trilha Personalizada: Back-End & APIs Robustas'
      months = 5
    } else if (area === 'mobile') {
      title = 'Trilha Personalizada: Mobile Developer'
      months = 5
    } else if (area === 'data-science') {
      title = 'Trilha Personalizada: Data Science & Analytics'
      months = 6
    } else if (area === 'ia' || area === 'machine-learning') {
      title = 'Trilha Personalizada: Inteligência Artificial & LLMs'
      months = 6
    } else if (area === 'devops' || area === 'cloud') {
      title = 'Trilha Personalizada: DevOps & Cloud Architecture'
      months = 5
    } else if (area === 'database') {
      title = 'Trilha Personalizada: Bancos de Dados & Modelagem SQL'
      months = 4
    } else if (area === 'cybersecurity' || area === 'seguranca') {
      title = 'Trilha Personalizada: Cybersecurity & Segurança da Informação'
      months = 6
    } else if (area === 'software-engineering') {
      title = 'Trilha Personalizada: Engenharia de Software & Arquitetura'
      months = 6
    } else if (area === 'qa') {
      title = 'Trilha Personalizada: QA & Automação de Testes'
      months = 4
    }

    const decisionReason = requiresMandatoryLogic
      ? `Regra Pedagógica dos 65%: Como seu aproveitamento diagnóstico foi de ${score}% (ou nível inicial declarado como iniciante), sua primeira etapa obrigatória é Lógica de Programação e Algoritmos antes de avançar para a tecnologia-alvo (${targetTechs.join(', ') || area}).`
      : `Ponto de Entrada Avançado: Seu aproveitamento diagnóstico de ${score}% validou o domínio dos fundamentos de lógica (${knowledgeMap.logic}%). Sua trilha foi otimizada para focar nas tecnologias específicas de ${area}.`

    // Se não houver módulos disponíveis no catálogo
    if (availableModules.length === 0) {
      return {
        path: {
          id: `path-empty-${Date.now()}`,
          title: 'Trilha em Construção',
          goal: onboarding?.goal || 'primeiro-emprego',
          area,
          description: 'O catálogo educacional ainda não possui cursos cadastrados pelo administrador.',
          moduleIds: [],
          items: [],
          adaptations: [],
          knowledgeGaps,
          skillMastery,
          knowledgeMap,
          startingStage,
          mandatoryLogic: requiresMandatoryLogic,
          diagnosticScore: score,
          customizedFor: userName,
          generatedAt: new Date().toISOString(),
        },
        courseSequence: [],
        moduleSequence: [],
        initialModuleId: '',
        initialLessonId: '',
        estimatedHours: 0,
        estimatedMonths: 0,
        rationale: 'Cadastre cursos na área administrativa para estruturar a trilha.',
        knowledgeGaps,
        skillMastery,
        knowledgeMap,
        startingStage,
        mandatoryLogic: requiresMandatoryLogic,
      }
    }

    // 1. Classifica todos os módulos do catálogo e filtra apenas os relevantes para a carreira
    const enrichedModules = availableModules
      .map((mod) => {
        const classification = this.classifyModulePedagogically(mod, availableCourses)
        const isRelevant = this.isModuleRelevantForCareer(
          classification.categoryKey,
          mod.technology || '',
          area,
          targetTechs
        )
        return {
          mod,
          classification,
          isRelevant,
        }
      })
      .filter((item) => item.isRelevant)

    // 2. Ordena estritamente por standardOrder pedagógico (Lógica -> Git -> HTML/CSS -> JS -> TS -> Frontend -> Backend -> DB -> Fullstack -> Carreira)
    enrichedModules.sort((a, b) => {
      if (a.classification.standardOrder !== b.classification.standardOrder) {
        return a.classification.standardOrder - b.classification.standardOrder
      }
      if (a.classification.phaseOrder !== b.classification.phaseOrder) {
        return a.classification.phaseOrder - b.classification.phaseOrder
      }
      return (a.mod.order || 1) - (b.mod.order || 1)
    })

    // 3. Verifica se existe conteúdo de Lógica no catálogo real
    const hasRealLogicCourse = enrichedModules.some(
      (m) => m.classification.categoryKey === 'logica'
    )

    const resolvedModules: LearningModule[] = []
    const trailItems: LearningPathItem[] = []
    const resolvedCourses: Course[] = []
    const visitedCourseIds = new Set<string>()
    const courseAuditList: TrailAuditData['courseSequenceAudit'] = []

    // 4. Caso obrigatório de Lógica sem conteúdo real no catálogo: Flag CONTENT_GAP (Não injetar Python!)
    if (requiresMandatoryLogic && !hasRealLogicCourse) {
      knowledgeGaps.unshift({
        topic: 'Lógica de Programação & Algoritmos (Conteúdo Ausente)',
        severity: 'alta',
        recommendedModuleId: 'gap-logic',
        description: 'Não existe atualmente conteúdo suficiente no catálogo para a etapa Lógica de Programação. O administrador foi notificado.',
        isContentGap: true,
      })
    }

    // 5. Itera sobre os módulos ordenados construindo a sequência individual
    enrichedModules.forEach((item, idx) => {
      const foundMod = item.mod
      const cls = item.classification
      resolvedModules.push(foundMod)

      let itemStatus: TrailItemStatus = 'bloqueado'
      let locked = true
      let itemReason = `Módulo estruturado na ${cls.phaseName}.`
      let unlockRequirement = 'Ponto de partida da formação.'

      if (idx === 0) {
        if (!requiresMandatoryLogic && cls.categoryKey === 'logica') {
          // Aluno avançado com lógica validada: módulo marcado como concluído
          itemStatus = 'concluido'
          locked = false
          itemReason = `Fundamentos de lógica dispensados por aproveitamento diagnóstico (${score}% >= ${BEGINNER_THRESHOLD}%).`
          unlockRequirement = 'Dispensado por teste de nivelamento.'
        } else {
          itemStatus = 'disponivel'
          locked = false
          itemReason = requiresMandatoryLogic
            ? `Ponto de partida obrigatório. Diagnóstico (${score}%) exige consolidação prévia de Lógica de Programação e Algoritmos.`
            : 'Ponto de partida da sua jornada adaptativa.'
        }
      } else if (idx === 1 && !requiresMandatoryLogic && enrichedModules[0].classification.categoryKey === 'logica') {
        itemStatus = 'disponivel'
        locked = false
        itemReason = 'Início liberado devido à validação prévia de Fundamentos de Lógica.'
        unlockRequirement = 'Dispensado por teste de nivelamento.'
      } else {
        itemStatus = 'bloqueado'
        locked = true
        const prevTitle = enrichedModules[idx - 1]?.mod.title || 'módulo anterior'
        unlockRequirement = `Conclua o módulo "${prevTitle}" com aproveitamento >= 50%.`
        itemReason = `Pré-requisito: requer a conclusão prévia da etapa anterior para assegurar aprendizado progressivo.`
      }

      const pathItem: LearningPathItem = {
        id: `item-${foundMod.id}-${Date.now()}`,
        moduleId: foundMod.id,
        courseId: foundMod.courseId || `crs-${foundMod.id}`,
        phase: cls.phaseName,
        phaseOrder: cls.phaseOrder,
        position: idx + 1,
        title: foundMod.title,
        description: foundMod.description,
        status: itemStatus,
        locked,
        required: true,
        recommendationReason: itemReason,
        unlockRequirement,
        skills: foundMod.skills || [],
        estimatedHours: foundMod.estimatedHours || 10,
        lessonIds: foundMod.lessonIds || [],
        selectedFromCatalog: true,
        pedagogicalRationale: itemReason,
      }
      trailItems.push(pathItem)

      if (foundMod.courseId && !visitedCourseIds.has(foundMod.courseId)) {
        const c = availableCourses.find((course) => course.id === foundMod.courseId)
        if (c) {
          resolvedCourses.push(c)
          visitedCourseIds.add(foundMod.courseId)
          courseAuditList.push({
            courseId: c.id,
            courseTitle: c.title,
            reason: itemReason,
            prerequisiteStatus: locked ? 'Bloqueado por pré-requisito sequencial' : 'Liberado para estudo',
          })
        }
      }
    })

    const totalHours = resolvedModules.reduce((acc, m) => acc + (m.estimatedHours || 8), 0)
    const initialMod = resolvedModules.find((m) => {
      const it = trailItems.find((i) => i.moduleId === m.id)
      return it?.status === 'disponivel' || it?.status === 'em_andamento'
    }) || resolvedModules[0]

    const initialLessonId = initialMod?.lessonIds?.[0] || ''

    const path: LearningPath = {
      id: `path-${area}-${Date.now()}`,
      title,
      goal: onboarding?.goal || 'primeiro-emprego',
      area,
      description: decisionReason,
      moduleIds: resolvedModules.map((m) => m.id),
      items: trailItems,
      adaptations: requiresMandatoryLogic
        ? [
            {
              id: `adapt-init-${Date.now()}`,
              date: new Date().toLocaleDateString('pt-BR'),
              reason: `Regra Pedagógica dos 65%: Diagnóstico (${score}%).`,
              changesMade: 'Priorização obrigatória da FASE 1 — Fundamentos de Lógica e Algoritmos com bloqueio sequencial dos módulos avançados.',
            },
          ]
        : [
            {
              id: `adapt-adv-${Date.now()}`,
              date: new Date().toLocaleDateString('pt-BR'),
              reason: `Aproveitamento superior no teste diagnóstico (${score}% >= 65%).`,
              changesMade: 'Fundamentos validados com sucesso. Ponto de partida ajustado para tecnologias centrais.',
            },
          ],
      knowledgeGaps,
      skillMastery,
      knowledgeMap,
      startingStage,
      mandatoryLogic: requiresMandatoryLogic,
      diagnosticScore: score,
      customizedFor: userName,
      generatedAt: new Date().toISOString(),
    }

    const auditData: TrailAuditData = {
      trailId: path.id,
      userId: profile?.id || 'anon-user',
      userName,
      targetCareer: area,
      declaredLevel,
      diagnosticScore: score,
      startingStage,
      decisionReason,
      knowledgeMap,
      prerequisitesValidated: resolvedModules.map((m) => m.title),
      gapsIdentified: knowledgeGaps.map((g) => g.topic),
      courseSequenceAudit: courseAuditList,
      generatedAt: path.generatedAt || new Date().toISOString(),
    }

    return {
      path,
      courseSequence: resolvedCourses,
      moduleSequence: resolvedModules,
      initialModuleId: initialMod?.id || '',
      initialLessonId,
      estimatedHours: totalHours,
      estimatedMonths: months,
      rationale: decisionReason,
      knowledgeGaps,
      skillMastery,
      knowledgeMap,
      startingStage,
      mandatoryLogic: requiresMandatoryLogic,
      auditData,
    }
  }

  /**
   * Adapts the student learning path dynamically after a Module Assessment
   */
  public adaptTrailPostAssessment(
    currentPath: LearningPath,
    moduleId: string,
    score: number,
    weakTopics: string[],
    availableModules: LearningModule[],
  ): {
    updatedPath: LearningPath
    adaptationNotice?: TrailAdaptationNotice
  } {
    const items = [...(currentPath.items || [])]
    const adaptations = [...(currentPath.adaptations || [])]
    const currentItemIdx = items.findIndex((i) => i.moduleId === moduleId)

    let notice: TrailAdaptationNotice | undefined

    if (score >= 50) {
      if (currentItemIdx !== -1) {
        items[currentItemIdx] = {
          ...items[currentItemIdx],
          status: 'concluido',
          locked: false,
        }
      }

      if (currentItemIdx + 1 < items.length) {
        items[currentItemIdx + 1] = {
          ...items[currentItemIdx + 1],
          status: 'disponivel',
          locked: false,
        }

        notice = {
          id: `adapt-${Date.now()}`,
          date: new Date().toLocaleDateString('pt-BR'),
          reason: `Aproveitamento suficiente na avaliação (${score}%).`,
          changesMade: `Módulo seguinte ("${items[currentItemIdx + 1].title}") desbloqueado com sucesso!`,
        }
        adaptations.push(notice)
      }
    } else {
      if (currentItemIdx !== -1) {
        items[currentItemIdx] = {
          ...items[currentItemIdx],
          status: 'reforco',
          locked: false,
        }

        const weakTopicStr = weakTopics.length ? weakTopics.join(', ') : 'conceitos centrais'
        notice = {
          id: `adapt-ref-${Date.now()}`,
          date: new Date().toLocaleDateString('pt-BR'),
          reason: `Nota ${score}% na avaliação oficial (mínimo de 50% exigido para desbloquear).`,
          changesMade: `Plano de reforço focado em ${weakTopicStr} adicionado às suas revisões antes de refazer.`,
          weakTopic: weakTopicStr,
        }
        adaptations.push(notice)
      }
    }

    return {
      updatedPath: {
        ...currentPath,
        items,
        adaptations,
      },
      adaptationNotice: notice,
    }
  }
}

export const learningPathEngine = new LearningPathEngine()
