'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  Code2,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  PlayCircle,
  Send,
  Sparkles,
  Target,
  User,
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
  } = useAppStore()

  const currentModule = allModules.find((m) => m.id === currentModuleId) || allModules[0]
  const currentLesson = allLessons.find((l) => l.id === nextPendingLessonId) || allLessons[0]
  const currentMastery = getModuleMastery(currentModule?.id || 'mod-logica')

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      role: 'assistant',
      content: `Olá, **${profile?.name?.split(' ')[0] || 'Desenvolvedor'}**! Sou o seu **DevMentor AI** 🤖\n\nEstou acompanhando você em tempo real no módulo **${currentModule.title}** (Mastery Score: ${currentMastery.totalMastery}%).\n\nVocê pode me perguntar qualquer dúvida sobre a aula **"${currentLesson.title}"**, pedir exemplos práticos em código, entender onde errou em exercícios ou simular dúvidas técnicas. Como posso te guiar agora?`,
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
  }, [messages])

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
      const reply = await aiService.chatWithMentor(updatedMessages, {
        currentModuleTitle: currentModule.title,
        userLevel: `Nível ${level} (${profile?.desiredRole || 'Desenvolvedor'})`,
        recentDifficulties: difficulties.map((d) => d.topic),
      })

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: reply,
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      toast.error('Erro ao comunicar com o mentor.')
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
    `Explique o conceito central da aula "${currentLesson.title}"`,
    `Como funciona a lógica de resolução do módulo ${currentModule.title}?`,
    `O que preciso fazer para atingir 100% de Mastery no módulo ${currentModule.title}?`,
    'Pode me dar um exemplo prático e simplificado de código?',
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-4 items-start">
      {/* Left 3 Cols: Chat Interface */}
      <div className="lg:col-span-3 space-y-4">
        <Card className="border-border/80 shadow-xl shadow-primary/5 min-h-[560px] flex flex-col justify-between overflow-hidden">
          {/* Chat Header */}
          <div className="border-b border-border/60 bg-muted/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <Bot className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-foreground">DevMentor AI</h2>
                  <span className="inline-flex size-2 rounded-full bg-success animate-pulse" />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Contextualizado no módulo: <strong>{currentModule.title}</strong>
                </p>
              </div>
            </div>

            <Badge variant="outline" className="text-[10px] font-bold border-primary/30 text-primary">
              Nível {level}
            </Badge>
          </div>

          {/* Messages Feed */}
          <CardContent className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[500px]">
            {messages.map((m) => {
              const isUser = m.role === 'user'
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                      <Bot className="size-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20'
                        : 'border border-border/70 bg-card text-foreground whitespace-pre-wrap'
                    }`}
                  >
                    {m.content}
                  </div>

                  {isUser && (
                    <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground shrink-0 text-xs font-bold">
                      {profile?.name?.slice(0, 1) || 'U'}
                    </div>
                  )}
                </div>
              )
            })}

            {loading && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary animate-spin">
                  <Sparkles className="size-4" />
                </div>
                <span>DevMentor está analisando seu contexto e gerando resposta...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Quick Prompts & Chat Input */}
          <div className="border-t border-border/60 p-4 bg-muted/10 space-y-3">
            {/* Quick Context Prompt Chips */}
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSendMessage(q)}
                  className="rounded-lg border border-border/70 bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:border-primary hover:text-foreground transition-colors truncate max-w-full"
                >
                  💡 {q}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex items-center gap-2"
            >
              <Input
                placeholder="Pergunte sobre código, conceitos da aula, dúvidas teóricas ou carreira..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="bg-background text-xs"
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="gap-1.5 font-bold text-xs shrink-0"
              >
                <Send className="size-3.5" /> Enviar
              </Button>
            </form>
          </div>
        </Card>
      </div>

      {/* Right Col: Active Student Context Radar */}
      <div className="space-y-4">
        <Card className="border-border/80 shadow-lg shadow-primary/5">
          <CardHeader className="pb-3 border-b border-border/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Contexto do Aluno</span>
            <CardTitle className="text-sm font-bold">Dados Sincronizados com a IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Módulo Atual</span>
              <p className="font-bold text-foreground">{currentModule.title}</p>
              <p className="text-[11px] text-muted-foreground">Mastery Score: {currentMastery.totalMastery}%</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Aula Pendente</span>
              <p className="font-semibold text-foreground">{currentLesson.title}</p>
              <Link href={`/aulas/${currentLesson.id}`} className="text-primary text-[11px] hover:underline flex items-center gap-1 font-bold">
                <PlayCircle className="size-3" /> Acessar Aula
              </Link>
            </div>

            <div className="space-y-1 pt-2 border-t border-border/60">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Dificuldades Monitoradas</span>
              {difficulties.length === 0 ? (
                <p className="text-[11px] text-muted-foreground italic">Nenhuma dificuldade crítica registrada.</p>
              ) : (
                <div className="space-y-1 pt-1">
                  {difficulties.map((d) => (
                    <span key={d.topic} className="inline-block rounded-md bg-warning/15 px-2 py-0.5 text-[10px] font-bold text-warning mr-1 mb-1">
                      {d.topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
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
      <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Carregando Mentor IA...</div>}>
        <MentorChatContent />
      </Suspense>
    </AppShell>
  )
}
