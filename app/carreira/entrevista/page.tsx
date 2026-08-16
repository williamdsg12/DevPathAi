'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Send,
  Sparkles,
  Trophy,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/lib/store'
import { aiService } from '@/lib/ai/provider'
import type { InterviewMessage, InterviewReport } from '@/lib/types'

export default function AIInterviewPage() {
  const { addInterviewReport, profile } = useAppStore()

  const [role, setRole] = useState('Full Stack Júnior')
  const [sessionStarted, setSessionStarted] = useState(false)
  const [messages, setMessages] = useState<InterviewMessage[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<InterviewReport | null>(null)

  const maxQuestions = 4
  const questionsAsked = messages.filter((m) => m.role === 'interviewer').length

  async function handleStartSession() {
    setLoading(true)
    setSessionStarted(true)
    try {
      const firstQ = await aiService.generateInterviewQuestion(role, 'Júnior', [])
      setMessages([
        {
          id: 'int-1',
          role: 'interviewer',
          content: firstQ,
          createdAt: new Date().toISOString(),
        },
      ])
    } catch (err) {
      toast.error('Erro ao iniciar simulador.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSendAnswer() {
    if (!currentAnswer.trim() || loading) return

    const candidateMsg: InterviewMessage = {
      id: `cand-${Date.now()}`,
      role: 'candidate',
      content: currentAnswer,
      createdAt: new Date().toISOString(),
    }

    const updated = [...messages, candidateMsg]
    setMessages(updated)
    const currentQ = messages.filter((m) => m.role === 'interviewer').slice(-1)[0]?.content || ''
    const answerText = currentAnswer
    setCurrentAnswer('')
    setLoading(true)

    try {
      const evaluation = await aiService.evaluateInterviewAnswer(currentQ, answerText)

      if (questionsAsked >= maxQuestions) {
        // Finalize Interview & Generate Report
        const finalScore = Math.round(evaluation.score)
        const finalReport: InterviewReport = {
          roleTitle: role,
          seniority: 'Júnior',
          overallScore: finalScore,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
          recommendations: [
            'Continue praticando a explicação conceitual com exemplos práticos.',
            'Aprofunde-se no funcionamento assíncrono e arquitetura de dados.',
          ],
          date: new Date().toLocaleDateString('pt-BR'),
        }

        setReport(finalReport)
        addInterviewReport(finalReport)
        toast.success('Simulação concluída! Relatório de desempenho gerado.')
        try {
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } })
        } catch {}
      } else {
        // Generate Next Question
        const nextQ = await aiService.generateInterviewQuestion(role, 'Júnior', updated)
        const interviewerMsg: InterviewMessage = {
          id: `int-${Date.now()}`,
          role: 'interviewer',
          content: `${evaluation.feedback}\n\n**Próxima pergunta:**\n${nextQ}`,
          createdAt: new Date().toISOString(),
          feedback: evaluation.feedback,
          score: evaluation.score,
        }
        setMessages((prev) => [...prev, interviewerMsg])
      }
    } catch (err) {
      toast.error('Erro ao processar resposta.')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setSessionStarted(false)
    setMessages([])
    setReport(null)
    setCurrentAnswer('')
  }

  return (
    <AppShell
      title="Simulador de Entrevistas Técnicas com IA"
      subtitle="Treine suas respostas para processos seletivos e receba avaliação detalhada"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <Link
            href="/carreira"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Voltar para Hub de Carreira
          </Link>

          {sessionStarted && !report ? (
            <Badge variant="secondary" className="text-xs font-bold">
              Pergunta {questionsAsked} de {maxQuestions}
            </Badge>
          ) : null}
        </div>

        {!sessionStarted ? (
          /* Role Selection Start Card */
          <Card className="border-border/80 shadow-xl shadow-primary/5 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="size-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Escolha a Vaga Desejada</CardTitle>
                <CardDescription className="text-xs">
                  A IA adaptará as perguntas técnicas e de raciocínio de acordo com o cargo.
                </CardDescription>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { title: 'Frontend Júnior', desc: 'React, HTML, CSS, JS e Web APIs' },
                { title: 'Backend Júnior', desc: 'Node.js, Express, REST e Bancos SQL' },
                { title: 'Full Stack Júnior', desc: 'Front + Back + Modelagem de Dados' },
              ].map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setRole(item.title)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    role === item.title
                      ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary font-bold'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  <p className="text-sm font-bold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </button>
              ))}
            </div>

            <Button
              size="lg"
              onClick={handleStartSession}
              disabled={loading}
              className="w-full gap-2 font-bold shadow-lg shadow-primary/20 py-6 text-base"
            >
              <Sparkles className="size-5" />
              {loading ? 'Preparando Entrevistador...' : 'Iniciar Entrevista com IA'}
            </Button>
          </Card>
        ) : report ? (
          /* Performance Report Card */
          <Card className="border-border/80 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                    <Trophy className="size-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Relatório de Desempenho na Entrevista</h2>
                    <p className="text-xs text-muted-foreground">Vaga simulada: {report.roleTitle}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Nota Geral</span>
                  <p className="text-2xl font-black text-primary">{report.overallScore}%</p>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-6 text-xs sm:text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-success/30 bg-success/5 p-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-success flex items-center gap-1.5">
                    <CheckCircle2 className="size-4" /> Pontos Fortes Demonstrados
                  </p>
                  <ul className="space-y-1 text-muted-foreground list-disc pl-4">
                    {report.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>

                <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-warning flex items-center gap-1.5">
                    <Brain className="size-4" /> Recomendações de Aprimoramento
                  </p>
                  <ul className="space-y-1 text-muted-foreground list-disc pl-4">
                    {report.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/60">
                <Button variant="outline" onClick={handleReset} className="gap-1.5 text-xs">
                  <RotateCcw className="size-3.5" /> Fazer Outra Simulação
                </Button>

                <Link href="/carreira">
                  <Button className="gap-2 font-bold shadow-md shadow-primary/20">
                    Voltar ao Hub de Carreira <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Live Interview Chat Screen */
          <Card className="border-border/80 shadow-xl overflow-hidden flex flex-col h-[580px]">
            <CardContent className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
              {messages.map((m) => {
                const isInterviewer = m.role === 'interviewer'
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 ${isInterviewer ? '' : 'flex-row-reverse'}`}
                  >
                    <div
                      className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                        isInterviewer ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isInterviewer ? <Bot className="size-4" /> : <User className="size-4" />}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isInterviewer
                          ? 'bg-muted/40 text-foreground border border-border/60'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </div>
                  </div>
                )
              })}

              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="size-4" />
                  </div>
                  <div className="rounded-2xl bg-muted/40 p-4 text-xs text-muted-foreground border border-border/60 animate-pulse flex items-center gap-2">
                    <Sparkles className="size-3.5 text-primary animate-spin" />
                    O avaliador está analisando sua resposta...
                  </div>
                </div>
              ) : null}
            </CardContent>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendAnswer()
              }}
              className="p-3 border-t border-border bg-card flex flex-col gap-2"
            >
              <Textarea
                rows={3}
                placeholder="Estruture sua resposta técnica com clareza e exemplos práticos..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                disabled={loading}
                className="text-xs leading-relaxed"
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={loading || !currentAnswer.trim()} className="gap-2 font-bold text-xs">
                  <Send className="size-3.5" /> Enviar Resposta
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
