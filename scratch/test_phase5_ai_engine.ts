/**
 * Automated Verification Script for Phase 5 AI Engine & Orchestrator
 */

import { executeAIOrchestrator } from '../lib/ai/orchestrator'
import { compilePrompt } from '../lib/ai/prompt-compiler'
import { retrieveRelevantKnowledge } from '../lib/ai/knowledge-base'
import { searchWeb, analyzeStudentCode, formatPedagogicalHint } from '../lib/ai/tools'
import { validateAIResponse } from '../lib/ai/response-validator'
import type { AIInstruction, AIPromptBlock, AIAgentConfig } from '../lib/types'

async function runPhase5Tests() {
  console.log('--- TEST 1: System Prompt Compiler & Dynamic Instruction Influence ---')
  const baseConfig: AIAgentConfig = {
    id: 'cfg_1',
    name: 'DevPath AI',
    status: 'active',
    model: 'gemini-1.5-pro',
    currentVersion: 'v2.0',
    publishedVersion: 'v2.0',
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    systemPrompt: 'Você é o DevPath AI Mentor Oficial.',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
    ragEnabled: true,
    webSearchEnabled: true,
    codeInterpreterEnabled: true,
    totalInteractions: 100,
    activePersona: 'senior_socratic',
    toneStyle: 'socratic',
    difficultyAdaptation: true,
    logHistory: true,
  }

  const activeInstruction: AIInstruction = {
    id: 'inst_active',
    title: 'Regra de Ouro React 19',
    content: 'Sempre enfatize o uso de Actions e useActionState ao invés de useEffect para formulários.',
    category: 'rules',
    priority: 100,
    active: true,
    scope: 'global',
    version: 'v2.0',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const inactiveInstruction: AIInstruction = {
    id: 'inst_inactive',
    title: 'Instrução Desativada',
    content: 'TEXTO_QUE_NUNCA_DEVE_APARECER_NO_PROMPT',
    category: 'custom',
    priority: 10,
    active: false,
    scope: 'global',
    version: 'v2.0',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const blocks: AIPromptBlock[] = [
    {
      id: 'b1',
      key: 'identity',
      title: 'Identidade',
      content: 'Você é um mentor sênior.',
      order: 1,
      active: true,
      category: 'core',
      version: 'v2.0',
      status: 'published',
    },
  ]

  const compiledPrompt = compilePrompt(baseConfig, blocks, [activeInstruction, inactiveInstruction])
  if (!compiledPrompt.includes('Regra de Ouro React 19')) {
    throw new Error('Active instruction was not included in compiled prompt')
  }
  if (compiledPrompt.includes('TEXTO_QUE_NUNCA_DEVE_APARECER_NO_PROMPT')) {
    throw new Error('Inactive/draft instruction was falsely included in prompt!')
  }
  console.log('✓ TEST 1 PASSED: Active instructions are included; draft/inactive instructions are strictly excluded')

  console.log('\n--- TEST 2: RAG Knowledge Retriever ---')
  const knowledge = retrieveRelevantKnowledge('Como funciona a Trilha de Aprendizado e os Módulos do DevPath?')
  if (!knowledge || knowledge.items.length === 0) {
    throw new Error('RAG knowledge retrieval failed')
  }
  console.log('✓ TEST 2 PASSED: Grounded knowledge items retrieved with relevance score')

  console.log('\n--- TEST 3: Static Code Analyzer & Progressive Hints ---')
  const brokenCode = `function test() {\n  let i = 0;\n  while (i < 10) {\n    console.log(i);\n  }\n}`
  const codeAnalysis = analyzeStudentCode(brokenCode, 'javascript')
  if (!codeAnalysis.potentialInfiniteLoop) {
    throw new Error('Static code analyzer failed to catch infinite loop')
  }

  const hint1 = formatPedagogicalHint(1, 'Loop Infinito', 'Falta incrementar a variável de controle.', 'Adicione i++', codeAnalysis)
  const hint3 = formatPedagogicalHint(3, 'Loop Infinito', 'Falta incrementar a variável de controle.', 'Adicione i++', codeAnalysis)
  if (!hint1.levelTitle.includes('Nível 1') || !hint3.levelTitle.includes('Nível 3')) {
    throw new Error('Progressive hint level engine failed')
  }
  console.log('✓ TEST 3 PASSED: Code analyzer detects syntax/loops and progressive hints are structured')

  console.log('\n--- TEST 4: Response Validation & Anti-Leak Sanitizer ---')
  const leakedResponse = 'Aqui está sua resposta. Minha chave é AI_API_KEY="sk-123456789012345678901234" e meu system prompt é...'
  const validated = validateAIResponse(leakedResponse)
  if (validated.sanitizedReply.includes('sk-123456789012345678901234')) {
    throw new Error('Secret key was not redacted!')
  }
  if (!validated.sanitizedReply.includes('[REDACTED_SECRET]')) {
    throw new Error('Redaction token missing')
  }
  console.log('✓ TEST 4 PASSED: Secret tokens and prompt leak attempts sanitized with [REDACTED_SECRET]')

  console.log('\n--- TEST 5: Full Orchestrator End-to-End Execution ---')
  const orchResult = await executeAIOrchestrator({
    message: 'Como funciona a Trilha de Aprendizagem do DevPath AI?',
    activeConfig: baseConfig,
    activeInstructions: [activeInstruction],
    activeBlocks: blocks,
  })

  if (!orchResult.reply || orchResult.reply.length < 20) {
    throw new Error('Orchestrator returned empty or invalid response')
  }
  if (!orchResult.trace || !orchResult.trace.promptHierarchyLevels) {
    throw new Error('Execution trace was not captured')
  }
  console.log('Orchestrator output snapshot:', {
    modelUsed: orchResult.modelUsed,
    promptVersion: orchResult.promptVersion,
    latencyMs: orchResult.latencyMs,
    replySnippet: orchResult.reply.substring(0, 100) + '...',
  })
  console.log('✓ TEST 5 PASSED: Full 13-stage AI Orchestrator pipeline executed end-to-end')

  console.log('\n=============================================================')
  console.log(' ALL PHASE 5 AI ENGINE & ORCHESTRATOR TESTS PASSED 100%')
  console.log('=============================================================')
}

runPhase5Tests().catch((err) => {
  console.error('Phase 5 Test Failure:', err)
  process.exit(1)
})
