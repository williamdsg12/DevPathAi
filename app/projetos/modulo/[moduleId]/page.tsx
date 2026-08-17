'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  ExternalLink,
  FolderGit2,
  Layers,
  Lightbulb,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  Trophy,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import type { ModuleProject, ProjectSubmission } from '@/lib/types'

export default function ModuleProjectSubmissionPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const moduleId = resolvedParams.moduleId

  const {
    allModules,
    allLessons,
    moduleProjects,
    projectSubmissions,
    reviewProjectSubmission,
    generateModuleProject,
    moduleProgress,
  } = useAppStore()

  const currentModule = allModules.find((m) => m.id === moduleId) || allModules[0]

  // Retrieve or generate default project
  const moduleProj: ModuleProject = moduleProjects[currentModule.id] || {
    id: `mp-${currentModule.id}`,
    moduleId: currentModule.id,
    title: `Projeto Prático: ${currentModule.title}`,
    description: `Desenvolva uma aplicação completa demonstrando os conceitos aprendidos no módulo ${currentModule.title}.`,
    technology: currentModule.technology || 'JavaScript',
    difficulty: 'medio',
    requirements: [
      'Código estruturado e semântico',
      'README detalhando a instalação, arquitetura e execução',
      'Tratamento de erros e validações adequadas',
      'Publicação no GitHub com histórico de commits',
    ],
    deliverables: ['Repositório no GitHub', 'README demonstrativo', 'Código fonte limpo'],
    rubric: [
      { criterion: 'Arquitetura e Lógica', weightPercent: 40, description: 'Estruturação do código e aplicação correta dos conceitos.' },
      { criterion: 'Tratamento de Erros e Validação', weightPercent: 30, description: 'Resiliência contra dados inválidos.' },
      { criterion: 'Documentação e Versionamento', weightPercent: 30, description: 'README claro e commits organizados.' },
    ],
    status: 'published',
    createdAt: new Date().toISOString(),
  }

  const existingSubmission = projectSubmissions[currentModule.id]
  const [githubUrl, setGithubUrl] = useState(existingSubmission?.githubUrl || '')
  const [deployUrl, setDeployUrl] = useState(existingSubmission?.deployUrl || '')
  const [description, setDescription] = useState(existingSubmission?.description || '')
  const [codeContent, setCodeContent] = useState(existingSubmission?.codeContent || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [evalResult, setEvalResult] = useState<{
    grade: number
    passed: boolean
    feedback: string
    strengths: string[]
    improvements: string[]
  } | null>(existingSubmission ? {
    grade: existingSubmission.grade || 85,
    passed: existingSubmission.status === 'approved',
    feedback: existingSubmission.feedback || 'Projeto avaliado e aprovado com sucesso!',
    strengths: ['Código bem organizado', 'Boa aderência à rubrica do módulo'],
    improvements: ['Adicionar mais testes unitários'],
  } : null)

  const modProg = moduleProgress[currentModule.id]
  const isAlreadySubmitted = modProg?.projectSubmitted ?? false

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!githubUrl.trim()) {
      toast.error('Informe o link do repositório no GitHub.')
      return
    }

    setIsSubmitting(true)
    try {
      const review = await reviewProjectSubmission(currentModule.id, {
        githubUrl: githubUrl.trim(),
        deployUrl: deployUrl.trim() || undefined,
        description: description.trim(),
        codeContent: codeContent.trim(),
      })

      setEvalResult(review)
      toast.success(
        review.passed
          ? `Parabéns! Projeto aprovado com nota ${review.grade}/100!`
          : `Projeto submetido (Nota ${review.grade}/100). Veja as orientações da IA para ajustes.`,
      )

      if (review.passed) {
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
        } catch {}
      }
    } catch {
      toast.error('Falha ao avaliar projeto com IA.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell title={moduleProj.title} subtitle={`Módulo: ${currentModule.title}`}>
      <div className="space-y-6 max-w-4xl mx-auto pb-16">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <Link
            href="/trilha"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Voltar para Minha Trilha
          </Link>

          {isAlreadySubmitted ? (
            <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 gap-1 text-xs">
              <CheckCircle2 className="size-3.5" /> Projeto Entregue
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs border-white/10 text-zinc-400">
              Pendente de Envio
            </Badge>
          )}
        </div>

        {/* Project Description & Rubric Card */}
        <Card className="border-white/10 bg-[#12111a] shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3.5 border-b border-white/5 pb-5">
            <div className="grid size-12 place-items-center rounded-2xl bg-violet-950/60 text-violet-400 border border-violet-500/30">
              <FolderGit2 className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-violet-600 text-white text-[10px] font-black border-0">
                  PROJETO OFICIAL
                </Badge>
                <span className="text-xs text-zinc-400 font-semibold">{moduleProj.technology}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">{moduleProj.title}</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-violet-400 mb-1.5">
                Descrição do Desafio Prático
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                {moduleProj.description}
              </p>
            </div>

            {/* Requirements */}
            <div>
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 mb-2">
                Requisitos Obrigatórios do Projeto
              </h4>
              <ul className="grid gap-2 sm:grid-cols-2">
                {moduleProj.requirements.map((req, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 rounded-2xl border border-white/5 bg-black/30 p-3 text-xs text-zinc-300 font-medium"
                  >
                    <CheckCircle2 className="size-4 text-violet-400 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rubric Breakdown */}
            {moduleProj.rubric && moduleProj.rubric.length > 0 && (
              <div>
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 mb-2">
                  Rubrica de Avaliação da IA (Critérios Ponderados)
                </h4>
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {moduleProj.rubric.map((r, i) => (
                    <div key={i} className="p-3.5 rounded-2xl border border-white/5 bg-black/40 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white truncate max-w-[130px]">{r.criterion}</span>
                        <Badge className="bg-violet-950 text-violet-300 border-violet-500/30 text-[10px] font-mono">
                          {r.weightPercent}%
                        </Badge>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-snug">{r.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Evaluation Results if submitted */}
          {evalResult && (
            <div className="rounded-2xl border border-violet-500/30 bg-violet-950/20 p-5 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-violet-400" />
                  <h4 className="text-sm font-bold text-white">Avaliação Pedagógica da IA</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-semibold">Nota Atribuída:</span>
                  <span
                    className={`text-lg font-black font-mono ${
                      evalResult.passed ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {evalResult.grade} / 100
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">{evalResult.feedback}</p>

              <div className="grid gap-3 sm:grid-cols-2 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 space-y-1">
                  <strong className="block font-bold">Pontos Fortes:</strong>
                  <ul className="space-y-1 list-disc list-inside text-[11px]">
                    {evalResult.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-500/20 text-violet-300 space-y-1">
                  <strong className="block font-bold">Oportunidades de Melhoria:</strong>
                  <ul className="space-y-1 list-disc list-inside text-[11px]">
                    {evalResult.improvements.map((imp, i) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-white/5">
            <h4 className="text-sm font-bold text-white">
              {existingSubmission ? 'Reenviar / Atualizar Projeto' : 'Submeter Projeto'}
            </h4>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <FolderGit2 className="size-3.5 text-violet-400" /> Link do Repositório no GitHub *
              </label>
              <Input
                placeholder="https://github.com/seu-usuario/meu-projeto"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                required
                className="text-xs bg-black/40 border-white/10 text-zinc-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <ExternalLink className="size-3.5 text-violet-400" /> Link de Deploy Online (Opcional)
              </label>
              <Input
                placeholder="https://meu-projeto.vercel.app"
                value={deployUrl}
                onChange={(e) => setDeployUrl(e.target.value)}
                className="text-xs bg-black/40 border-white/10 text-zinc-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">
                Comentários / README Resumido (Opcional)
              </label>
              <Textarea
                rows={3}
                placeholder="Explique como você estruturou a lógica, quais desafios enfrentou e como testar..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs bg-black/40 border-white/10 text-zinc-200"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full gap-2 font-bold shadow-lg shadow-violet-600/30 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl py-6 text-xs transition-all"
            >
              <Send className="size-4" />
              {isSubmitting ? 'Avaliando com IA contra a Rubrica...' : 'Enviar Projeto para Avaliação da IA'}
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  )
}
