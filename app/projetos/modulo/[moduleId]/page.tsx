'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FolderGit2,
  Send,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { mockModuleProjects } from '@/lib/mock-data'
import { useAppStore } from '@/lib/store'
import type { ModuleProject } from '@/lib/types'

export default function ModuleProjectSubmissionPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const moduleId = resolvedParams.moduleId

  const { allModules, submitModuleProject, moduleProgress } = useAppStore()
  const currentModule = allModules.find((m) => m.id === moduleId) || allModules[0]
  const moduleProj: ModuleProject = currentModule ? (mockModuleProjects.find((mp) => mp.moduleId === currentModule.id) || {
    id: `mp-${currentModule.id}`,
    moduleId: currentModule.id,
    title: `Projeto Prático: ${currentModule.title}`,
    description: `Desenvolva uma aplicação completa demonstrando os conceitos aprendidos no módulo ${currentModule.title}.`,
    requirements: [
      'Código estruturado e limpo',
      'README detalhando a instalação e execução',
      'Tratamento de erros e validações adequadas',
      'Publicação no GitHub',
    ],
  }) : {
    id: `mp-${moduleId}`,
    moduleId,
    title: 'Projeto Prático do Módulo',
    description: 'Desenvolva uma aplicação completa demonstrando os conceitos aprendidos.',
    requirements: ['Código limpo', 'README explicativo', 'Repositório no GitHub'],
  }

  const [githubUrl, setGithubUrl] = useState('')
  const [deployUrl, setDeployUrl] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const modProg = moduleProgress[currentModule.id]
  const isAlreadySubmitted = modProg?.projectSubmitted ?? false

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!githubUrl.trim()) {
      toast.error('Informe o link do repositório no GitHub.')
      return
    }

    setIsSubmitting(true)
    submitModuleProject(currentModule.id, {
      githubUrl,
      deployUrl: deployUrl.trim() || undefined,
      description,
    })

    setTimeout(() => {
      setIsSubmitting(false)
      toast.success('Projeto do módulo enviado com sucesso! Requisito cumprido.')
      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } })
      } catch {}
    }, 500)
  }

  return (
    <AppShell title={moduleProj.title} subtitle={`Módulo: ${currentModule.title}`}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <Link
            href="/trilha"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Voltar para Minha Trilha
          </Link>

          {isAlreadySubmitted ? (
            <Badge className="bg-success/15 text-success border-0 gap-1 text-xs">
              <CheckCircle2 className="size-3.5" /> Projeto Entregue
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              Pendente de Envio
            </Badge>
          )}
        </div>

        {/* Project Description & Requirements Card */}
        <Card className="border-border/80 shadow-xl shadow-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <FolderGit2 className="size-6" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold">{moduleProj.title}</CardTitle>
                <CardDescription className="text-xs">{currentModule.phase}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Descrição do Desafio
              </h4>
              <p className="text-sm text-foreground/90 leading-relaxed">{moduleProj.description}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Requisitos Obrigatórios para Aprovação
              </h4>
              <ul className="space-y-2">
                {moduleProj.requirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-2.5 text-xs font-medium">
                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-border/60">
              <h4 className="text-sm font-bold text-foreground">Submeter Projeto</h4>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <GithubIcon className="size-3.5" /> Link do Repositório no GitHub *
                </label>
                <Input
                  placeholder="https://github.com/seu-usuario/seu-repositorio"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ExternalLink className="size-3.5" /> Link de Deploy Online (Opcional)
                </label>
                <Input
                  placeholder="https://meu-projeto.vercel.app"
                  value={deployUrl}
                  onChange={(e) => setDeployUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Comentários / Instruções de Execução (Opcional)
                </label>
                <Textarea
                  rows={3}
                  placeholder="Conte como você resolveu o desafio, bibliotecas utilizadas..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2 font-bold shadow-lg shadow-primary/20 py-6"
              >
                <Send className="size-4" />
                {isSubmitting ? 'Enviando...' : 'Enviar Projeto para Validação'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
