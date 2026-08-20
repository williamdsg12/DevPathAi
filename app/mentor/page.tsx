'use client'

import React, { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  Bot,
  Brain,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  PlayCircle,
  Send,
  Sparkles,
  Target,
  User,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { aiService } from '@/lib/ai/provider'
import type { ChatMessage } from '@/lib/types'

const socraticModes = [
  { id: 'explain', label: 'Me explique', prompt: 'Explique detalhadamente o conceito principal desta aula com analogias claras.' },
  { id: 'hint', label: 'Me dê uma dica', prompt: 'Me dê uma dica pedagógica para resolver o exercício atual sem me dar a resposta direta.' },
  { id: 'debug', label: 'Onde estou errando?', prompt: 'Analise o seguinte raciocínio/código e me aponte onde está o erro conceitual ou de sintaxe.' },
  { id: 'review', label: 'Revise meu código', prompt: 'Faça um code review focado em boas práticas, Clean Code e padrões modernos.' },
  { id: 'teacher', label: 'Como um professor', prompt: 'Explique este tópico como um professor sênior de engenharia de software estruturando o raciocínio.' },
  { id: 'challenge', label: 'Exercício similar', prompt: 'Crie um desafio prático de código semelhante ao da aula para eu treinar agora.' },
  { id: 'quiz', label: 'Teste meu conhecimento', prompt: 'Faça 2 perguntas objetivas para testar se realmente dominei o conteúdo desta aula.' },
]

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-3 rounded-2xl border border-white/10 bg-[#090812] overflow-hidden text-left font-mono text-xs">
      <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.03] px-3.5 py-2">
        <span className="text-[10px] font-bold text-zinc-400">código / snippet</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
          <span>{copied ? 'Copiado!' : 'Copiar'}</span>
        </button>
      </div>
      <pre className="p-3.5 text-violet-200 overflow-x-auto leading-relaxed scrollbar-thin">
        {code}
      </pre>
    </div>
  )
}

function FormattedMessageContent({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed font-medium">
      {parts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim()
          const code = lines.replace(/^[a-zA-Z0-9_-]+\n/, '')
          return <CodeBlock key={idx} code={code || lines} />
        }
        return (
          <p key={idx} className="whitespace-pre-wrap">
            {part}
          </p>
        )
      })}
    </div>
  )
}

function MentorChatContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q')

  const {
    profile,
    allModules,
    allLessons,
    currentModuleId,
    nextPendingLessonId,
    getModuleMastery,
    difficulties,
    level,
    xp,
    aiConfig,
    aiInstructions,
    aiPromptBlocks,
    aiKnowledge,
    studentMemories,
    recordStudentDifficulty,
    logAIOperation,
  } = useAppStore()

  const currentModule = allModules.find((m) => m.id === currentModuleId) || allModules[0]
  const currentLesson = allLessons.find((l) => l.id === nextPendingLessonId) || allLessons[0]
  const currentMastery = getModuleMastery(currentModule?.id || 'mod-logica')

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      role: 'assistant',
      content: `Olá, **${profile?.name?.split(' ')[0] || 'Desenvolvedor'}**! Sou o seu **DevMentor AI** 🤖 (Versão ${aiConfig.publishedVersion})\n\nEstou acompanhando seu progresso em tempo real no módulo **${currentModule.title}** (Mastery Score: ${currentMastery.totalMastery}%).\n\nVocê pode escolher um dos modos socráticos de mentoria abaixo ou me perguntar qualquer dúvida sobre a aula **"${currentLesson.title}"**. Como posso te guiar agora?`,
      createdAt: new Date().toISOString(),
    },
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery)
    }
  }, [initialQuery])

  async function handleSendMessage(textToSend?: string) {
    const text = textToSend || input
    if (!text.trim() || loading) return

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const studentMemory = studentMemories[profile?.id || 'current-student'] || null

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          studentProfile: profile,
          studentMemory,
          activeConfig: aiConfig,
          activeInstructions: aiInstructions,
          activeBlocks: aiPromptBlocks,
          knowledgeBase: aiKnowledge,
          lessonContext: {
            courseTitle: 'Formação DevPath',
            moduleTitle: currentModule.title,
            lessonTitle: currentLesson.title,
            lessonOrder: currentLesson.order,
          },
        }),
      })

      if (!res.ok) throw new Error('Erro na resposta do mentor')
      const data = await res.json()

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Como posso te ajudar?',
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMsg])

      // Extract and save student difficulty to persistent memory if detected
      if (data.extractedDifficulty) {
        recordStudentDifficulty(data.extractedDifficulty)
      }

      // Log operation
      logAIOperation({
        userId: profile?.id,
        studentLevel: profile?.level || 'iniciante',
        intent: data.trace?.intent || 'chat',
        promptVersionUsed: data.promptVersion || aiConfig.publishedVersion,
        activeInstructionsCount: aiInstructions.filter((i) => i.active).length,
        injectedKnowledgeTitles: data.trace?.promptHierarchyLevels?.level5_knowledgeAndWeb || [],
        toolsExecuted: data.toolsExecuted || [],
        sourcesCited: data.sourcesCited || [],
        latencyMs: data.latencyMs || 250,
        tokensUsed: data.tokensUsed || 300,
        model: data.modelUsed || aiConfig.model,
        status: 'success',
        userMessageSnippet: text.slice(0, 80),
        aiReplySnippet: (data.reply || '').slice(0, 100),
      })
    } catch (err) {
      toast.error('Erro ao comunicar com o mentor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4 items-start pb-16">
      {/* Left 3 Cols: Chat Interface */}
      <div className="lg:col-span-3 space-y-4">
        {/* Pinned Lesson Context Synced Card */}
        <div className="flex items-center justify-between p-4 rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-[#12111d] to-[#12111d] shadow-lg">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-2xl bg-violet-600/20 border border-violet-500/40 text-violet-300">
              <PlayCircle className="size-5" />
            </span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-400 font-mono">Contexto da Aula Ativa</span>
              <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
                Aula {currentLesson.order}: {currentLesson.title}
              </h4>
            </div>
          </div>
          <Link href={`/aulas/${currentLesson.id}`}>
            <Button size="sm" variant="outline" className="text-xs font-bold border-violet-500/30 text-violet-300 hover:bg-violet-950/40">
              Ver Aula <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <Card className="border-white/10 bg-[#12111d] shadow-2xl rounded-3xl min-h-[580px] flex flex-col justify-between overflow-hidden">
          {/* Chat Header */}
          <div className="border-b border-white/5 bg-black/40 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-purple-600/30">
                <Bot className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white">DevMentor AI</h2>
                  <span className="inline-flex size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400">Online 24/7</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Módulo ativo: <strong className="text-zinc-200">{currentModule.title}</strong>
                </p>
              </div>
            </div>

            <Badge className="bg-violet-950/80 border border-violet-500/30 text-violet-300 text-xs font-bold">
              Nível {level}
            </Badge>
          </div>

          {/* Messages Feed */}
          <CardContent className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto max-h-[500px] scrollbar-thin">
            {messages.map((m) => {
              const isUser = m.role === 'user'
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="grid size-8 place-items-center rounded-xl bg-violet-600/20 text-violet-400 shrink-0 border border-violet-500/30">
                      <Bot className="size-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] rounded-3xl p-4 sm:p-5 shadow-md ${
                      isUser
                        ? 'bg-violet-600 text-white font-medium shadow-purple-600/20'
                        : 'border border-white/5 bg-[#171524] text-zinc-200'
                    }`}
                  >
                    <FormattedMessageContent content={m.content} />
                  </div>

                  {isUser && (
                    <div className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shrink-0 text-xs font-bold shadow-md">
                      {profile?.name?.slice(0, 1) || 'U'}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Animated Typing Indicator */}
            {loading && (
              <div className="flex items-center gap-3 text-xs text-zinc-400 bg-white/[0.02] p-3 rounded-2xl border border-white/5 w-fit">
                <div className="grid size-7 place-items-center rounded-xl bg-violet-600/20 text-violet-400">
                  <Sparkles className="size-3.5 animate-spin" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-zinc-300">DevMentor redigindo resposta</span>
                  <span className="inline-flex size-1.5 rounded-full bg-violet-400 animate-bounce" />
                  <span className="inline-flex size-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="inline-flex size-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Socratic Modes Bar & Chat Input */}
          <div className="border-t border-white/5 p-4 bg-black/30 space-y-3">
            {/* 7 Modos de Ensino Socrático Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-bold uppercase text-zinc-500 shrink-0">Modos:</span>
              {socraticModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => handleSendMessage(mode.prompt)}
                  className="rounded-xl border border-white/10 bg-white/[0.02] hover:bg-violet-950/60 hover:border-violet-500/40 px-3 py-1 text-xs font-semibold text-zinc-300 hover:text-white transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  💡 {mode.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex items-center gap-2 pt-1"
            >
              <Input
                placeholder="Pergunte sobre código, conceitos da aula, depuração ou carreira..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="bg-black/50 border-white/10 rounded-2xl text-xs sm:text-sm h-11 text-white placeholder:text-zinc-500 focus-visible:ring-violet-500/50"
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="gap-1.5 font-bold text-xs h-11 px-5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-purple-600/30 shrink-0 cursor-pointer"
              >
                <Send className="size-4" /> Enviar
              </Button>
            </form>
          </div>
        </Card>
      </div>

      {/* Right Col: Active Student Context Radar */}
      <div className="space-y-4">
        <Card className="border-white/10 bg-[#12111d] shadow-2xl rounded-3xl p-5 space-y-4">
          <div className="border-b border-white/5 pb-3 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-400 font-mono">Contexto em Tempo Real</span>
            <h3 className="text-sm font-bold text-white">Dados Sincronizados com a IA</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-500">Módulo Ativo</span>
              <p className="font-bold text-white">{currentModule.title}</p>
              <p className="text-[11px] text-violet-400 font-mono">Mastery Score: {currentMastery.totalMastery}%</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-500">Aula Pendente</span>
              <p className="font-semibold text-zinc-200">{currentLesson.title}</p>
              <Link href={`/aulas/${currentLesson.id}`} className="text-violet-400 text-[11px] hover:underline flex items-center gap-1 font-bold pt-0.5">
                <PlayCircle className="size-3.5" /> Ir para a Aula
              </Link>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[10px] uppercase font-bold text-zinc-500">Tópicos Monitorados</span>
              {difficulties.length === 0 ? (
                <p className="text-[11px] text-zinc-400 italic">Nenhuma dificuldade crítica registrada.</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {difficulties.map((d) => (
                    <span key={d.topic} className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      {d.topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function MentorPage() {
  return (
    <AppShell
      title="DevMentor AI — Tutor Individual 24/7"
      subtitle="Tire dúvidas conceituais, depure código e receba orientações personalizadas para sua formação"
    >
      <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-400">Carregando DevMentor AI...</div>}>
        <MentorChatContent />
      </Suspense>
    </AppShell>
  )
}
