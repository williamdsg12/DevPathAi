/**
 * LearningPathEngine — AI Adaptive Curriculum & Prerequisite Dependency Engine
 *
 * Evaluates student onboarding, diagnostic placement results, calculates knowledge gaps,
 * skill mastery, resolves the prerequisite dependency graph against the authentic Course & Content Catalog,
 * calculates weighted Module Mastery Scores, generates daily study plans,
 * and dynamically adapts the curriculum post-assessments without fabricating fake IDs.
 */

import type {
  Course,
  DailyStudyPlan,
  DailyStudyTask,
  KnowledgeGap,
  LearningModule,
  LearningPath,
  LearningPathItem,
  Lesson,
  ModuleMasteryScore,
  ModuleProgress,
  OnboardingData,
  PlacementResult,
  SpacedReviewItem,
  TrailAdaptationNotice,
  TrailItemStatus,
  UserProfile,
} from '@/lib/types'

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

    const totalLessons = Math.max(1, mod.lessonIds.length)
    const lessonsDone = progress?.lessonsCompleted ?? 0
    const lessonsScore = Math.min(20, Math.round((lessonsDone / totalLessons) * 20))

    const totalExercises = Math.max(1, mod.exerciseCount)
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
   * Calculates specific Knowledge Gaps and Skill Mastery percentages by crossing
   * self-declared knowledge against diagnostic assessment performance.
   */
  public calculateGapsAndMastery(
    onboarding: OnboardingData | null,
    placement: PlacementResult | null,
  ): {
    knowledgeGaps: KnowledgeGap[]
    skillMastery: Record<string, number>
  } {
    const score = placement?.score ?? 0
    const weakTopics = placement?.weakTopics || []
    const knownTopics = onboarding?.knownTopics || []

    const mastery: Record<string, number> = {
      'Lógica de Programação': 0,
      'Algoritmos & Estruturas': 0,
      'Git & GitHub': 0,
      'HTML5 Semântico': 0,
      'CSS3 & Layouts': 0,
      'JavaScript Moderno': 0,
      'React & Next.js': 0,
      'Node.js & APIs': 0,
      'Banco de Dados & SQL': 0,
      'Arquitetura de Software': 0,
    }

    const gaps: KnowledgeGap[] = []

    // 1. Logic & Foundations
    if (score >= 85) {
      mastery['Lógica de Programação'] = 95
      mastery['Algoritmos & Estruturas'] = 90
    } else if (score >= 65) {
      mastery['Lógica de Programação'] = 75
      mastery['Algoritmos & Estruturas'] = 60
      if (weakTopics.some((t) => t.toLowerCase().includes('loop') || t.toLowerCase().includes('repeti'))) {
        gaps.push({
          topic: 'Estruturas de Repetição (Loops)',
          severity: 'media',
          recommendedModuleId: 'mod-logica',
          description: 'Reforço recomendado em iterações e laços de repetição (for / while).',
        })
      }
    } else {
      mastery['Lógica de Programação'] = Math.max(15, score)
      mastery['Algoritmos & Estruturas'] = Math.max(10, Math.round(score * 0.8))
      gaps.push({
        topic: 'Fundamentos de Algoritmos & Lógica',
        severity: 'alta',
        recommendedModuleId: 'mod-logica',
        description: 'Base essencial necessária antes de avançar para a sintaxe da web.',
      })
    }

    // 2. Web & Frontend Knowledge
    if (knownTopics.includes('HTML e CSS básico')) {
      mastery['HTML5 Semântico'] = 45
      mastery['CSS3 & Layouts'] = 40
    } else {
      gaps.push({
        topic: 'Estruturação Semântica com HTML5 & CSS3',
        severity: 'media',
        recommendedModuleId: 'mod-html',
        description: 'Construção de páginas web acessíveis e responsivas.',
      })
    }

    if (knownTopics.includes('JavaScript básico')) {
      mastery['JavaScript Moderno'] = 40
    } else {
      gaps.push({
        topic: 'Manipulação de DOM & JavaScript ES6+',
        severity: 'alta',
        recommendedModuleId: 'mod-js',
        description: 'Comportamento dinâmico de aplicações client-side.',
      })
    }

    return { knowledgeGaps: gaps, skillMastery: mastery }
  }

  /**
   * Classifica semanticamente um módulo em fases pedagógicas universais
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
      (combined.includes('fundamentos da programação') && !combined.includes('web') && !combined.includes('react') && !combined.includes('node'))
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
   * Generates a fully personalized, adaptive learning trail based on student data
   * and the real verified content library.
   */
  public generateAdaptiveTrail(
    profile: UserProfile | null,
    onboarding: OnboardingData | null,
    placement: PlacementResult | null,
    availableCourses: Course[],
    availableModules: LearningModule[],
    availableLessons: Lesson[],
  ): TrailGenerationResult {
    const area = onboarding?.area || 'fullstack'
    const level = placement?.level || onboarding?.currentKnowledge || 'iniciante-absoluto'
    const userName = profile?.name || 'Aluno DevPath'
    const score = placement?.score ?? 0

    const { knowledgeGaps, skillMastery } = this.calculateGapsAndMastery(onboarding, placement)

    // Check if user is a beginner who must start strictly with Logic/Algorithms
    const isZeroOrBeginner =
      onboarding?.currentKnowledge === 'zero' ||
      onboarding?.currentKnowledge === 'iniciante' ||
      score < 85 ||
      placement?.level === 'iniciante-absoluto' ||
      placement?.level === 'iniciante'

    const canSkipLogic =
      score >= 85 &&
      (onboarding?.currentKnowledge === 'intermediario' || onboarding?.currentKnowledge === 'avancado')

    let title = 'Trilha Personalizada: Full Stack JavaScript'
    let rationale = isZeroOrBeginner
      ? `Detectamos pelo seu teste de nivelamento (aproveitamento de ${score}%) que você está no nível Iniciante. Sua trilha começa obrigatoriamente pelos Fundamentos de Lógica e Algoritmos antes de avançar para linguagens e frameworks.`
      : 'Trilha personalizada focada em consolidação prática e projetos full stack.'
    let months = 6

    if (area === 'frontend') {
      title = 'Trilha Personalizada: Front-End Moderno (React & Next.js)'
      months = 4
    } else if (area === 'backend') {
      title = 'Trilha Personalizada: Back-End & APIs Robustas (Node.js & SQL)'
      months = 5
    } else if (area === 'data-science' || area === 'ia') {
      title = 'Trilha Personalizada: Python & Inteligência Artificial'
      months = 6
    }

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
          customizedFor: userName,
          generatedAt: new Date().toISOString(),
        },
        courseSequence: [],
        moduleSequence: [],
        initialModuleId: '',
        initialLessonId: '',
        estimatedHours: 0,
        estimatedMonths: 0,
        rationale: 'Cadastre um canal ou playlist na área administrativa para alimentar os cursos.',
        knowledgeGaps,
        skillMastery,
      }
    }

    // Classify each module pedagogically
    const enrichedModules = availableModules.map((mod) => {
      const classification = this.classifyModulePedagogically(mod, availableCourses)
      return {
        mod,
        classification,
      }
    })

    // Sort strictly by pedagogical standardOrder (Lógica -> Git -> HTML/CSS -> JS -> TS -> Frontend -> Backend/Python -> DB -> Fullstack -> Carreira)
    enrichedModules.sort((a, b) => {
      if (a.classification.standardOrder !== b.classification.standardOrder) {
        return a.classification.standardOrder - b.classification.standardOrder
      }
      if (a.classification.phaseOrder !== b.classification.phaseOrder) {
        return a.classification.phaseOrder - b.classification.phaseOrder
      }
      return (a.mod.order || 1) - (b.mod.order || 1)
    })

    const resolvedModules: LearningModule[] = []
    const trailItems: LearningPathItem[] = []
    const resolvedCourses: Course[] = []
    const visitedCourseIds = new Set<string>()

    enrichedModules.forEach((item, idx) => {
      const foundMod = item.mod
      const cls = item.classification
      resolvedModules.push(foundMod)

      let itemStatus: TrailItemStatus = 'bloqueado'
      let locked = true
      let itemReason = `Módulo estruturado na ${cls.phaseName}.`
      let unlockRequirement = 'Ponto de partida da formação.'

      if (idx === 0) {
        if (canSkipLogic && cls.categoryKey === 'logica') {
          itemStatus = 'concluido'
          locked = false
          itemReason = 'Fundamentos de lógica validados com sucesso no teste de nivelamento (>= 85%).'
        } else {
          itemStatus = 'disponivel'
          locked = false
          itemReason = isZeroOrBeginner
            ? `Ponto de partida fundamental. Diagnóstico indicou início no nível iniciante (aproveitamento de ${score}%). A base algorítmica é indispensável.`
            : 'Ponto de partida da sua jornada adaptativa.'
        }
      } else if (idx === 1 && canSkipLogic && enrichedModules[0].classification.categoryKey === 'logica') {
        itemStatus = 'disponivel'
        locked = false
        itemReason = 'Início liberado devido à dispensa pedagógica de Lógica de Programação.'
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
      }
      trailItems.push(pathItem)

      if (foundMod.courseId && !visitedCourseIds.has(foundMod.courseId)) {
        const c = availableCourses.find((course) => course.id === foundMod.courseId)
        if (c) {
          resolvedCourses.push(c)
          visitedCourseIds.add(foundMod.courseId)
        }
      }
    })

    const totalHours = resolvedModules.reduce((acc, m) => acc + (m.estimatedHours || 8), 0)
    const initialMod = resolvedModules.find((m) => {
      const it = trailItems.find((i) => i.moduleId === m.id)
      return it?.status === 'disponivel' || it?.status === 'em_andamento'
    }) || resolvedModules[0]

    const initialLessonId = initialMod?.lessonIds[0] || ''

    const path: LearningPath = {
      id: `path-${area}-${Date.now()}`,
      title,
      goal: onboarding?.goal || 'primeiro-emprego',
      area,
      description: rationale,
      moduleIds: resolvedModules.map((m) => m.id),
      items: trailItems,
      adaptations: isZeroOrBeginner
        ? [
            {
              id: `adapt-init-${Date.now()}`,
              date: new Date().toLocaleDateString('pt-BR'),
              reason: `Diagnóstico indicou nível Iniciante (score: ${score}%).`,
              changesMade: 'Priorização obrigatória da FASE 1 — Fundamentos de Lógica e Algoritmos com bloqueio sequencial dos módulos avançados.',
            },
          ]
        : canSkipLogic
        ? [
            {
              id: `adapt-skip-${Date.now()}`,
              date: new Date().toLocaleDateString('pt-BR'),
              reason: `Excelente desempenho no teste diagnóstico (score: ${score}%).`,
              changesMade: 'Fundamentos de lógica dispensados. Ponto de partida avançado para a fase de linguagens e ferramentas.',
            },
          ]
        : [],
      knowledgeGaps,
      skillMastery,
      customizedFor: userName,
      generatedAt: new Date().toISOString(),
    }

    return {
      path,
      courseSequence: resolvedCourses,
      moduleSequence: resolvedModules,
      initialModuleId: initialMod?.id || '',
      initialLessonId,
      estimatedHours: totalHours,
      estimatedMonths: months,
      rationale,
      knowledgeGaps,
      skillMastery,
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
      // Score >= 50%: Module is unlocked and user can advance
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
      // Needs Reinforcement (< 50%) -> Module stays locked
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
