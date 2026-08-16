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
    toast.success('Projeto removido.')
  }

  return (
    <AppShell
      title="Meus Projetos & Portfólio"
      subtitle="Construa aplicações reais, conecte seu GitHub e monte seu portfólio profissional"
    >
      <div className="space-y-6">
        {/* Header Bar with Action */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'publicado', label: 'Publicados' },
              { id: 'concluido', label: 'Concluídos' },
              { id: 'em-desenvolvimento', label: 'Em Desenvolvimento' },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={filter === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(tab.id)}
                className="text-xs font-semibold"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger
              render={
                <Button className="gap-2 text-xs font-bold shadow-md shadow-primary/20">
                  <Plus className="size-4" /> Novo Projeto
                </Button>
              }
            />
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Projeto ao Portfólio</DialogTitle>
                <DialogDescription>
                  Documente um projeto que você desenvolveu durante seus estudos.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreate} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Título do Projeto</label>
                  <Input
                    placeholder="Ex: E-commerce com React & Node"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Descrição</label>
                  <Textarea
                    rows={3}
                    placeholder="Explique o que a aplicação faz, os desafios superados..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Tecnologias (separadas por vírgula)</label>
                  <Input
                    placeholder="React, TypeScript, Tailwind, Supabase"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Link do GitHub</label>
                    <Input
                      placeholder="https://github.com/..."
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Link de Deploy</label>
                    <Input
                      placeholder="https://meu-app.vercel.app"
                      value={deploy}
                      onChange={(e) => setDeploy(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Status Atual</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-xs font-semibold"
                  >
                    <option value="em-desenvolvimento">Em desenvolvimento</option>
                    <option value="concluido">Concluído</option>
                    <option value="publicado">Publicado online</option>
                    <option value="ideia">Ideia / Planejamento</option>
                  </select>
                </div>

                <DialogFooter className="pt-3">
                  <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="font-bold">
                    Salvar Projeto
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card className="border-dashed border-border/80 p-12 text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground mx-auto mb-3">
              <FolderGit2 className="size-7" />
            </div>
            <h3 className="text-base font-bold">Nenhum projeto encontrado</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Adicione projetos desenvolvidos por você ou entregue os projetos obrigatórios de cada módulo.
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="flex flex-col justify-between border-border/80 hover:border-primary/40 transition-all shadow-md">
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] uppercase font-bold tracking-wider ${
                        project.status === 'publicado'
                          ? 'bg-success/15 text-success'
                          : project.status === 'concluido'
                          ? 'bg-primary/15 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {project.status}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => handleDelete(project.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      title="Excluir projeto"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div>
                    <CardTitle className="text-base font-bold line-clamp-1">{project.title}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mt-1 leading-relaxed">
                      {project.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Actions Links */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                    {project.github ? (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                          <GithubIcon className="size-3.5" /> Código
                        </Button>
                      </a>
                    ) : null}

                    {project.deploy ? (
                      <a
                        href={project.deploy}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1"
                      >
                        <Button size="sm" className="w-full text-xs gap-1.5">
                          <ExternalLink className="size-3.5" /> Ver Deploy
                        </Button>
                      </a>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
