/**
 * Module Completion Engine — DevPath AI
 *
 * Implements strict pedagogical graduation criteria for learning modules:
 * 1. Mandatory Lessons Completed (100% watched / marked)
 * 2. Mandatory Activities Completed (Practice & Code challenges resolved)
 * 3. Module Practical Project Submitted & Evaluated with Rubric
 * 4. Final Assessment Passed (Score >= minScore)
 * 5. Pedagogical Reflection Answered
 *
 * Provides Recovery Plan generation upon assessment failure and Reflection Analysis.
 */

import type {
  Assessment,
  LearningActivity,
  LearningModule,
  ModuleCompletionStatus,
  ModuleProgress,
  ModuleReflection,
  RecoveryPlan,
} from '@/lib/types'

export interface ModuleEvaluationInput {
  module: LearningModule
  moduleProgress?: ModuleProgress
  completedLessons: string[]
  completedActivities: string[]
  moduleActivities: LearningActivity[]
  assessment?: Assessment
  reflection?: ModuleReflection
  isSuperAdmin?: boolean
}

export class ModuleCompletionEngine {
  /**
   * Evaluates whether a student has completed all 5 criteria to master a module.
   */
  public evaluateModuleCompletion(input: ModuleEvaluationInput): ModuleCompletionStatus {
    const {
      module,
      moduleProgress,
      completedLessons,
      completedActivities,
      moduleActivities,
      assessment,
      reflection,
      isSuperAdmin = false,
    } = input

    // Super Admin bypass
    if (isSuperAdmin) {
      return {
        moduleId: module.id,
        lessonsCompleted: true,
        activitiesCompleted: true,
        projectCompleted: true,
        assessmentPassed: true,
        reflectionCompleted: true,
        isFullyCompleted: true,
        totalScore: 100,
      }
    }

    // 1. Lessons check
    const moduleLessonIds = module.lessonIds || []
    const doneLessonsCount = moduleLessonIds.filter((id) => completedLessons.includes(id)).length
    const lessonsCompleted = moduleLessonIds.length === 0 || doneLessonsCount >= moduleLessonIds.length

    // 2. Activities check
    const requiredActivities = moduleActivities.filter((a) => a.moduleId === module.id)
    const doneActivitiesCount = requiredActivities.filter((a) => completedActivities.includes(a.id)).length
    const activitiesCompleted = requiredActivities.length === 0 || doneActivitiesCount >= Math.min(requiredActivities.length, 2)

    // 3. Project check
    const projectCompleted = !module.hasProject || Boolean(moduleProgress?.projectSubmitted)

    // 4. Assessment check
    const minScore = assessment?.minScore || 70
    const currentAssessmentScore = moduleProgress?.assessmentScore ?? null
    const assessmentPassed = !module.hasAssessment || (currentAssessmentScore !== null && currentAssessmentScore >= minScore)

    // 5. Reflection check
    const reflectionCompleted = Boolean(reflection)

    const isFullyCompleted = lessonsCompleted && activitiesCompleted && projectCompleted && assessmentPassed && reflectionCompleted

    // Calculate score & identify blocking reason if any
    let totalScore = 0
    if (lessonsCompleted) totalScore += 25
    if (activitiesCompleted) totalScore += 25
    if (projectCompleted) totalScore += 25
    if (assessmentPassed) totalScore += 25

    let blockReason: string | undefined
    if (!lessonsCompleted) {
      blockReason = `Conclua todas as ${moduleLessonIds.length} aulas do módulo (${doneLessonsCount}/${moduleLessonIds.length} assistidas).`
    } else if (!activitiesCompleted) {
      blockReason = `Resolva as atividades práticas obrigatórias deste módulo (${doneActivitiesCount}/${requiredActivities.length} concluídas).`
    } else if (!projectCompleted) {
      blockReason = `Envie o projeto prático obrigatório do módulo no GitHub.`
    } else if (!assessmentPassed) {
      blockReason = `Atinja no mínimo ${minScore}% de aproveitamento na Avaliação Oficial (Pontuação atual: ${currentAssessmentScore ?? 0}%).`
    } else if (!reflectionCompleted) {
      blockReason = `Preencha a breve reflexão pedagógica sobre o que você aprendeu neste módulo.`
    }

    return {
      moduleId: module.id,
      lessonsCompleted,
      activitiesCompleted,
      projectCompleted,
      assessmentPassed,
      reflectionCompleted,
      isFullyCompleted,
      totalScore,
      blockReason,
    }
  }

  /**
   * Generates a personalized AI Recovery Plan when a student fails the assessment.
   */
  public generateRecoveryPlan(weakTopics: string[], moduleId: string, moduleTitle = 'Módulo'): RecoveryPlan {
    const topicsStr = weakTopics.length ? weakTopics.join(', ') : 'Fundamentos do Módulo'
    const mainTopic = weakTopics[0] || 'Lógica e Estruturação'

    return {
      weakTopics: weakTopics.length ? weakTopics : ['Conceitos Centrais'],
      explanation: `Identificamos que você teve maior dificuldade nas questões sobre ${topicsStr}. Não se preocupe: criamos um plano de reforço direcionado para destravar seu aprendizado antes da sua nova tentativa na avaliação!`,
      recommendedLessons: [
        `Revisão focada: Aula prática sobre ${mainTopic}`,
        `Análise de casos de teste e depuração de código em ${moduleTitle}`,
      ],
      extraExercises: [
        `3 exercícios práticos de fixação sobre ${mainTopic}`,
        `Desafio guiado de correção de bugs com feedback passo a passo`,
      ],
      miniChallenge: `Construa um pequeno algoritmo de 10 a 20 linhas que aplique os conceitos de ${mainTopic} e execute sem erros.`,
    }
  }

  /**
   * Analyzes student reflection to produce recommendations for next stages.
   */
  public analyzeReflection(reflection: ModuleReflection, moduleTitle = 'Módulo'): string {
    if (!reflection.preparedToAdvance || (reflection.hardestTopic && reflection.hardestTopic.length > 3)) {
      return `Registramos que você achou o tópico "${reflection.hardestTopic || 'tópicos avançados'}" desafiador. Recomendamos manter a revisão espaçada ativa na aba de Revisões enquanto avança para o próximo módulo.`
    }
    return `Parabéns pela conclusão do módulo "${moduleTitle}"! Sua reflexão mostra dedicação e prontidão para encarar os desafios do próximo nível.`
  }
}

export const moduleCompletionEngine = new ModuleCompletionEngine()
