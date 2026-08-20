/**
 * Automated Verification Script for Phase 7 Practical Activities, Assessments & Verifiable Learning
 */

import { ActivityEngine } from '../lib/ai/activity-engine'
import { moduleCompletionEngine } from '../lib/pedagogy/module-completion-engine'
import {
  defaultOfficialCourses,
  defaultOfficialModules,
  defaultOfficialLessons,
} from '../lib/mock-data'
import type { Lesson, LearningActivity } from '../lib/types'

async function runPhase7Tests() {
  console.log('--- TEST 1: Lesson Activity Analysis & Context Differentiation ---')
  const engine = new ActivityEngine()

  const codingLesson: Lesson = {
    id: 'l_code_1',
    moduleId: 'mod_1',
    order: 1,
    title: 'Praticando Estruturas de Repetição com For e While',
    description: 'Nesta aula prática vamos implementar loops para somar itens de um array.',
    durationMin: 20,
    type: 'video',
    videoId: 'Ejkb_YpuHWs',
  }

  const introLesson: Lesson = {
    id: 'l_intro_1',
    moduleId: 'mod_1',
    order: 0,
    title: 'Seja Bem-vindo ao Curso de Programação',
    description: 'Apresentação da ementa e configuração do ambiente VS Code.',
    durationMin: 10,
    type: 'video',
    videoId: 'Ejkb_YpuHWs',
  }

  const codeAnalysis = engine.analyzeLessonForActivity(codingLesson)
  const introAnalysis = engine.analyzeLessonForActivity(introLesson)

  if (!codeAnalysis.hasActivity) {
    throw new Error('Coding lesson was falsely classified as having no activity')
  }
  if (introAnalysis.hasActivity) {
    throw new Error('Introductory lesson was falsely assigned mandatory coding activity')
  }
  console.log('Coding lesson activity type:', codeAnalysis.activityType)
  console.log('Introductory lesson has activity:', introAnalysis.hasActivity)
  console.log('✓ TEST 1 PASSED: Lessons intelligently analyzed for practical exercises vs intro')

  console.log('\n--- TEST 2: Strict Anti-Empty / Anti-Placeholder Validation ---')
  const invalidActivity: Partial<LearningActivity> = {
    id: 'act_invalid',
    title: 'Exercício',
    statement: 'Resolva o exercício', // Disallowed generic placeholder!
    type: 'code',
    difficulty: 'facil',
    xpReward: 50,
  }

  if (engine.validateActivity(invalidActivity)) {
    throw new Error('Generic placeholder statement was falsely validated!')
  }
  console.log('✓ TEST 2 PASSED: Strict validation rejects generic placeholders and empty statements')

  console.log('\n--- TEST 3: Lesson-Integrated Activity Generation ---')
  const generatedActivities = engine.generateActivitiesForLesson({
    moduleId: defaultOfficialModules[0].id,
    moduleTitle: defaultOfficialModules[0].title,
    lessonId: defaultOfficialLessons[0].id,
    lessonTitle: defaultOfficialLessons[0].title,
    lessonDescription: defaultOfficialLessons[0].description,
    technology: 'JavaScript',
    studentLevel: 'iniciante',
  })

  if (!generatedActivities || generatedActivities.length === 0) {
    throw new Error('Activity generation failed to return exercises')
  }
  const sampleAct = generatedActivities[0]
  if (!sampleAct.title || !sampleAct.statement || sampleAct.statement.length < 15) {
    throw new Error('Generated activity missing comprehensive statement')
  }
  console.log('Generated Activity:', {
    id: sampleAct.id,
    title: sampleAct.title,
    type: sampleAct.type,
    difficulty: sampleAct.difficulty,
    xpReward: sampleAct.xpReward,
  })
  console.log('✓ TEST 3 PASSED: High-fidelity lesson-integrated activities successfully synthesized')

  console.log('\n--- TEST 4: Progressive Hint Hierarchy & Submission Scoring ---')
  const questions = engine.ensureActivityQuestions(sampleAct)
  if (!questions || questions.length === 0) {
    throw new Error('ensureActivityQuestions failed')
  }

  // 1. Incomplete/empty submission rejection
  const emptySubmission = engine.validateAndScoreSubmission(sampleAct, {})
  if (emptySubmission.isValid) {
    throw new Error('Empty submission was falsely marked as valid!')
  }
  console.log('Anti-Empty Validation Error:', emptySubmission.error)

  // 2. Progressive Hint check
  const hasAttempt1Hint = Boolean(sampleAct.hint || questions[0].hint)
  const hasAttempt2Guidance = Boolean(sampleAct.detailedGuidance || questions[0].hints)
  if (!hasAttempt1Hint || !hasAttempt2Guidance) {
    throw new Error('Progressive hint hierarchy missing from activity')
  }
  console.log('Attempt 1 Hint:', sampleAct.hint || questions[0].hint)
  console.log('Attempt 2 Guidance:', sampleAct.detailedGuidance || questions[0].hints?.[0])
  console.log('✓ TEST 4 PASSED: Mandatory anti-empty validation and progressive hints verified')

  console.log('\n--- TEST 5: Module Assessment & Targeted Recovery Plan ---')
  const recoveryPlan = moduleCompletionEngine.generateRecoveryPlan(
    ['Loops e Estruturas de Repetição', 'Manipulação de Arrays'],
    defaultOfficialModules[0].id,
    defaultOfficialModules[0].title
  )

  if (!recoveryPlan || recoveryPlan.weakTopics.length !== 2 || !recoveryPlan.explanation) {
    throw new Error('Recovery plan generation failed')
  }
  console.log('Recovery Plan Explanation:', recoveryPlan.explanation.substring(0, 80) + '...')
  console.log('Weak Skills to Review:', recoveryPlan.weakTopics)
  console.log('Recommended Lessons:', recoveryPlan.recommendedLessons.length)
  console.log('✓ TEST 5 PASSED: Automated recovery plan synthesized for students needing review')

  console.log('\n=============================================================')
  console.log(' ALL PHASE 7 VERIFIABLE LEARNING TESTS PASSED 100%')
  console.log('=============================================================')
}

runPhase7Tests().catch((err) => {
  console.error('Phase 7 Test Failure:', err)
  process.exit(1)
})
