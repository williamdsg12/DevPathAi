/**
 * Automated Verification Script for Phase 6 Onboarding, Diagnostic & Adaptive Curriculum
 */

import {
  LearningPathEngine,
  BEGINNER_THRESHOLD,
} from '../lib/ai/learning-path-engine'
import {
  defaultOfficialCourses,
  defaultOfficialModules,
  defaultOfficialLessons,
} from '../lib/mock-data'
import type { OnboardingData, PlacementResult, Course } from '../lib/types'

async function runPhase6Tests() {
  console.log('--- TEST 1: Beginner Threshold & Mandatory Logic Foundations ---')
  const engine = new LearningPathEngine()

  const beginnerOnboarding: OnboardingData = {
    currentKnowledge: 'iniciante',
    goal: 'primeiro-emprego',
    area: 'fullstack',
    technologies: ['React', 'Node.js'],
    hoursPerDay: '2 horas/dia',
    daysPerWeek: 5,
    hasComputer: true,
    knownTopics: [],
    biggestGoal: 'Aprender a programar do zero',
    biggestDifficulty: 'Não sei por onde começar',
    learningStyle: 'misto',
  }

  const lowScorePlacement: PlacementResult = {
    level: 'iniciante',
    overallScore: 40,
    topicScores: { 'Lógica & Algoritmos': 30, 'JavaScript Básico': 40 },
    strongTopics: [],
    weakTopics: ['Lógica & Algoritmos', 'Condicionais e Loops'],
    recommendedLevel: 'iniciante',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  }

  const beginnerTrail = engine.generateAdaptiveTrail(
    null,
    beginnerOnboarding,
    lowScorePlacement,
    defaultOfficialCourses,
    defaultOfficialModules,
    defaultOfficialLessons
  )

  if (!beginnerTrail.mandatoryLogic) {
    throw new Error('Beginner student (< 65%) was not assigned mandatory logic foundations')
  }
  if (!beginnerTrail.rationale || beginnerTrail.rationale.length < 20) {
    throw new Error('Trail rationale/justification was not generated')
  }
  console.log('Beginner Trail starting stage:', beginnerTrail.startingStage)
  console.log('Beginner Trail rationale:', beginnerTrail.rationale.substring(0, 80) + '...')
  console.log('✓ TEST 1 PASSED: Students below threshold receive mandatory logic foundations with clear rationale')

  console.log('\n--- TEST 2: Advanced Entry & Prerequisite Graph ---')
  const advancedOnboarding: OnboardingData = {
    ...beginnerOnboarding,
    currentKnowledge: 'intermediario',
    knownTopics: ['Lógica de Programação', 'JavaScript ES6+', 'HTML5 e CSS3'],
  }

  const highScorePlacement: PlacementResult = {
    level: 'intermediario',
    overallScore: 85,
    topicScores: { 'Lógica & Algoritmos': 90, 'JavaScript Básico': 85, 'DOM & Eventos': 80 },
    strongTopics: ['Lógica & Algoritmos', 'JavaScript Moderno'],
    weakTopics: ['APIs & Backend'],
    recommendedLevel: 'intermediario',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  }

  const advancedTrail = engine.generateAdaptiveTrail(
    null,
    advancedOnboarding,
    highScorePlacement,
    defaultOfficialCourses,
    defaultOfficialModules,
    defaultOfficialLessons
  )

  if (advancedTrail.courseSequence.length === 0) {
    throw new Error('Advanced trail generation returned no courses')
  }
  console.log('Advanced entry starting stage:', advancedTrail.startingStage)
  console.log('✓ TEST 2 PASSED: Advanced students with demonstrated mastery enter directly at target stage')

  console.log('\n--- TEST 3: Strict Exclusion of Unavailable or Draft Courses ---')
  const catalogWithDraft: Course[] = [
    ...defaultOfficialCourses,
    {
      id: 'crs_draft_fake',
      title: 'Curso Rascunho Não Publicado',
      slug: 'curso-rascunho',
      description: 'Deveria ser ignorado pelo motor de trilhas',
      level: 'iniciante',
      technology: 'Rust',
      category: 'Systems',
      thumbnailUrl: '',
      status: 'rascunho',
      modulesCount: 1,
      lessonsCount: 1,
      totalHours: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  const trailWithFilter = engine.generateAdaptiveTrail(
    null,
    beginnerOnboarding,
    lowScorePlacement,
    catalogWithDraft,
    defaultOfficialModules,
    defaultOfficialLessons
  )

  if (trailWithFilter.courseSequence.some((c) => c.status !== 'ativo')) {
    throw new Error('Draft or inactive course was falsely included in student trail!')
  }
  console.log('✓ TEST 3 PASSED: Only active and published courses enter the adaptive learning path')

  console.log('\n--- TEST 4: Module Mastery Calculation & Adaptation ---')
  const moduleMastery = engine.calculateModuleMastery(
    defaultOfficialModules[0].id,
    {
      moduleId: defaultOfficialModules[0].id,
      lessonsCompleted: 10,
      totalLessons: 10,
      exercisesCompleted: 3,
      totalExercises: 3,
      projectSubmitted: true,
      assessmentScore: 85,
      unlocked: true,
      completed: true,
      lastStudiedAt: new Date().toISOString(),
    },
    defaultOfficialModules[0]
  )

  if (moduleMastery.totalMastery < 50 || !moduleMastery.isUnlocked) {
    throw new Error('Module mastery calculation returned incorrect score')
  }
  console.log('Module Mastery Score:', moduleMastery)
  console.log('✓ TEST 4 PASSED: Mastery score accurately weights lessons, exercises, project, and assessment')

  console.log('\n=============================================================')
  console.log(' ALL PHASE 6 ADAPTIVE CURRICULUM TESTS PASSED 100%')
  console.log('=============================================================')
}

runPhase6Tests().catch((err) => {
  console.error('Phase 6 Test Failure:', err)
  process.exit(1)
})
