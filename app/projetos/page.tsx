'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Code2,
  ExternalLink,
  FolderGit2,
  Plus,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { GithubIcon } from '@/components/icons'
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
      title="Meus Projetos"
      subtitle="Construa seu portfólio enquanto aprende."
    >
      <div className="space-y-8 pb-12">
        {/* Header Hero Banner */}
        <div className="rounded-3xl border border-white/5 bg-[#12111a] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <Badge className="bg-violet-950 border border-violet-500/30 text-violet-300 font-bold text-xs">
              Portfólio Profissional
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Meus Projetos
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
              Construa seu portfólio enquanto aprende. Conecte seus repositórios do GitHub e publique demonstrações online.
            </p>
          </div>

          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger
              render={
                <Button className="gap-2 font-black text-xs px-6 py-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-purple-600/30">
                  <Plus className="size-4" /> Novo Projeto
                </Button>
              }
            />
            <DialogContent className="max-w-md bg-[#12111a] border-white/10 text-white rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-black text-white">Adicionar Novo Projeto</DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Documente uma aplicação que você desenvolveu durante seus estudos.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreate} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Título do Projeto</label>
                  <Input
                    placeholder="Ex: Sistema de Gestão com React & Node"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-black/40 border-white/10 text-xs rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Descrição</label>
                  <Textarea
                    rows={3}
                    placeholder="Explique o que a aplicação faz e os desafios técnicos resolvidos..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-black/40 border-white/10 text-xs rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Tecnologias (separadas por vírgula)</label>
                  <Input
                    placeholder="Ex: React, TypeScript, Tailwind, Node.js"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    className="bg-black/40 border-white/10 text-xs rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Link do GitHub</label>
                    <Input
                      placeholder="https://github.com/..."
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="bg-black/40 border-white/10 text-xs rounded-xl text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Link do Deploy / Demo</label>
                    <Input
                      placeholder="https://meu-app.vercel.app"
                      value={deploy}
                      onChange={(e) => setDeploy(e.target.value)}
                      className="bg-black/40 border-white/10 text-xs rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as UserProject['status'])}
                    className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  >
                    <option value="em-desenvolvimento">Em desenvolvimento</option>
                    <option value="concluido">Concluído</option>
                    <option value="publicado">Publicado</option>
                  </select>
                </div>

                <DialogFooter className="pt-3">
                  <Button type="submit" className="w-full font-bold bg-violet-600 hover:bg-violet-500 text-white rounded-xl">
                    Salvar Projeto (+150 XP)
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'Todos os Projetos' },
            { id: 'publicado', label: 'Publicados' },
            { id: 'concluido', label: 'Concluídos' },
            { id: 'em-desenvolvimento', label: 'Em Desenvolvimento' },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={filter === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter(tab.id)}
              className={`text-xs font-bold rounded-xl shrink-0 transition-colors ${
                filter === tab.id
                  ? 'bg-violet-600 text-white'
                  : 'bg-white/[0.02] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Grid de Projetos */}
        {filteredProjects.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-white/10 rounded-3xl bg-[#12111a] space-y-4">
            <div className="size-16 rounded-full bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <FolderGit2 className="size-8" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-lg font-bold text-white">Nenhum projeto cadastrado ainda</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Comece seu primeiro projeto prático para comprovar suas habilidades e construir um portfólio admirado por recrutadores.
              </p>
            </div>
            <Button
              onClick={() => setOpenModal(true)}
              className="font-bold text-xs gap-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl"
            >
              <Plus className="size-4" /> Criar Primeiro Projeto
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((p) => (
              <div
                key={p.id}
                className="group flex flex-col justify-between rounded-3xl border border-white/5 bg-[#12111a] hover:border-violet-500/40 p-6 transition-all duration-300 shadow-xl space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      className={`text-[10px] font-black uppercase tracking-wider ${
                        p.status === 'publicado'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : p.status === 'concluido'
                          ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {p.status}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      title="Excluir projeto"
                      className="text-zinc-600 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-black text-white group-hover:text-violet-300 transition-colors">
                    {p.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed font-medium">
                    {p.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.tech.map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold text-zinc-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* External links and details */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                  </span>

                  <div className="flex items-center gap-2">
                    {p.github && (
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                        title="Ver Repositório GitHub"
                      >
                        <GithubIcon className="size-4" />
                      </a>
                    )}
                    {p.deploy && (
                      <a
                        href={p.deploy}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white transition-colors"
                        title="Acessar Demonstração Online"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
