'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Code2,
  ExternalLink,
  FolderGit2,
  Globe,
  Plus,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react'
import { GithubIcon } from '@/components/icons'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import type { UserProject } from '@/lib/types'

const inspirationProjects = [
  {
    title: 'E-commerce Full Stack com Next.js & Stripe',
    desc: 'Catálogo de produtos com carrinho em tempo real, autenticação JWT e checkout integrado.',
    tech: ['React 19', 'Next.js', 'Tailwind', 'Stripe', 'Node.js'],
    author: 'Lucas M. (Aluno DevPath)',
  },
  {
    title: 'API RESTful de Gestão Financeira',
    desc: 'Arquitetura limpa em camadas com Node.js, TypeScript, PostgreSQL e testes automatizados.',
    tech: ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
    author: 'Mariana S. (Aluna DevPath)',
  },
  {
    title: 'Dashboard de Produtividade com DevMentor AI',
    desc: 'Aplicação web com IA integrada para planejamento de tarefas e estatísticas de foco.',
    tech: ['React', 'Tailwind', 'OpenAI API', 'Supabase'],
    author: 'Rodrigo C. (Aluno DevPath)',
  },
]

export default function ProjectsPage() {
  const { projects, addProject, deleteProject } = useAppStore()
  const [filter, setFilter] = useState<string>('all')
  const [openModal, setOpenModal] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [techInput, setTechInput] = useState('')
  const [github, setGithub] = useState('')
  const [deploy, setDeploy] = useState('')
  const [status, setStatus] = useState<UserProject['status']>('em-desenvolvimento')

  const filteredProjects = projects.filter((p) => filter === 'all' || p.status === filter)

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      toast.error('Preencha título e descrição do projeto.')
      return
    }

    const techList = techInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    addProject({
      title,
      description,
      tech: techList.length ? techList : ['JavaScript', 'HTML', 'CSS'],
      github: github.trim() || undefined,
      deploy: deploy.trim() || undefined,
      status,
      tags: techList,
    })

    toast.success('Projeto adicionado ao seu portfólio! +150 XP')
    setOpenModal(false)
    setTitle('')
    setDescription('')
    setTechInput('')
    setGithub('')
    setDeploy('')
  }

  function handleDelete(id: string) {
    deleteProject(id)
    toast.success('Projeto removido do portfólio.')
  }

  return (
    <AppShell
      title="Meus Projetos de Portfólio"
      subtitle="Desenvolva aplicações do mundo real, conecte seus repositórios do GitHub e construa seu portfólio"
    >
      <div className="space-y-10 pb-16">
        {/* Header Hero Banner */}
        <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-950/40 via-[#12111d] to-[#0a0910] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 max-w-2xl">
            <Badge className="bg-violet-950/80 border border-violet-500/30 text-violet-300 font-bold text-xs">
              Portfólio Validado para Recrutadores
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Meus Projetos Práticos
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
              A melhor forma de comprovar conhecimento técnico para empresas é através de código no GitHub e demonstrações no ar.
            </p>
          </div>

          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger
              render={
                <Button className="gap-2 font-black text-xs sm:text-sm px-7 py-5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white shadow-xl shadow-purple-600/30 cursor-pointer">
                  <Plus className="size-4" /> Novo Projeto
                </Button>
              }
            />
            <DialogContent className="max-w-md bg-[#12111d] border-white/10 text-white rounded-3xl p-6">
              <DialogHeader>
                <DialogTitle className="text-lg font-black text-white">Adicionar Projeto de Portfólio</DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Documente uma aplicação que você desenvolveu durante seus estudos na plataforma.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreate} className="space-y-4 py-2">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-zinc-300">Título da Aplicação</label>
                  <Input
                    placeholder="Ex: E-commerce Full Stack com Next.js"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-black/50 border-white/10 text-xs rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-zinc-300">Descrição Técnica</label>
                  <Textarea
                    rows={3}
                    placeholder="Explique o propósito da aplicação, arquitetura e desafios resolvidos..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-black/50 border-white/10 text-xs rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-zinc-300">Tecnologias Usadas (separadas por vírgula)</label>
                  <Input
                    placeholder="Ex: React, TypeScript, Tailwind, Node.js, PostgreSQL"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    className="bg-black/50 border-white/10 text-xs rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Link do GitHub</label>
                    <Input
                      placeholder="https://github.com/..."
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="bg-black/50 border-white/10 text-xs rounded-xl text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Demo Online</label>
                    <Input
                      placeholder="https://meuprojeto.vercel.app"
                      value={deploy}
                      onChange={(e) => setDeploy(e.target.value)}
                      className="bg-black/50 border-white/10 text-xs rounded-xl text-white"
                    />
                  </div>
                </div>

                <DialogFooter className="pt-2">
                  <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 font-bold text-xs py-5 rounded-xl">
                    Salvar Projeto (+150 XP)
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Student Projects List */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-white">Projetos Cadastrados</h2>

          {filteredProjects.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="group relative rounded-3xl border border-white/5 bg-[#12111d] hover:border-violet-500/40 p-6 space-y-4 transition-all shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge
                        className={`text-[10px] uppercase font-bold ${
                          project.status === 'concluido'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-violet-500/10 text-violet-300 border-violet-500/30'
                        }`}
                      >
                        {project.status === 'concluido' ? 'Concluído' : 'Em Desenvolvimento'}
                      </Badge>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Remover projeto"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed font-medium">
                      {project.description}
                    </p>

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.tech.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-mono text-zinc-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                    {project.github ? (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors font-semibold"
                      >
                        <GithubIcon className="size-3.5" /> Repositório
                      </a>
                    ) : (
                      <span className="text-[11px] text-zinc-600">Sem repositório</span>
                    )}

                    {project.deploy && (
                      <a
                        href={project.deploy}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-bold"
                      >
                        <Globe className="size-3.5" /> Ver Demo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.01] p-10 text-center space-y-3">
              <Code2 className="size-10 mx-auto text-zinc-600" />
              <h4 className="text-sm font-bold text-zinc-300">Nenhum projeto cadastrado no seu portfólio ainda.</h4>
              <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed font-medium">
                Conforme você avançar nos módulos ou praticar no Code Lab, registre seus projetos aqui para que recrutadores possam visualizá-los.
              </p>
              <Button
                onClick={() => setOpenModal(true)}
                size="sm"
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl"
              >
                <Plus className="size-3.5 mr-1" /> Criar Meu Primeiro Projeto
              </Button>
            </div>
          )}
        </section>

        {/* Inspiration Showcase Carousel / Grid */}
        <section className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="size-4 text-violet-400" /> Projetos Recomendados para seu Nível
              </h3>
              <p className="text-xs text-zinc-400">Exemplos de aplicações reais desenvolvidas por outros alunos</p>
            </div>
            <Badge className="bg-violet-950/60 text-violet-300 border-violet-500/30 text-[10px]">Inspiração</Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {inspirationProjects.map((insp, i) => (
              <div key={i} className="p-5 rounded-3xl border border-white/5 bg-[#12111d] space-y-3">
                <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono">{insp.author}</span>
                <h4 className="text-sm font-bold text-white leading-snug">{insp.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{insp.desc}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {insp.tech.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-violet-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
