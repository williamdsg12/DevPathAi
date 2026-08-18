'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import type { PortfolioProject } from '@/lib/types'
import {
  FolderGit2,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Calendar,
  Check,
  AlertCircle,
  Tag,
} from 'lucide-react'
import { GithubIcon } from '@/components/icons'
import { toast } from 'sonner'

export function ProjectsTab() {
  const {
    portfolioProjects,
    addPortfolioProject,
    updatePortfolioProject,
    deletePortfolioProject,
  } = useAppStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectUrl, setProjectUrl] = useState('')
  const [repositoryUrl, setRepositoryUrl] = useState('')
  const [technologiesText, setTechnologiesText] = useState('')
  const [date, setDate] = useState('')
  const [status, setStatus] = useState<PortfolioProject['status']>('Concluído')
  const [coverUrl, setCoverUrl] = useState('')

  function openNewModal() {
    setEditingId(null)
    setTitle('')
    setDescription('')
    setProjectUrl('')
    setRepositoryUrl('')
    setTechnologiesText('')
    setDate(new Date().toISOString().slice(0, 10))
    setStatus('Concluído')
    setCoverUrl('')
    setIsModalOpen(true)
  }

  function openEditModal(proj: PortfolioProject) {
    setEditingId(proj.id)
    setTitle(proj.title)
    setDescription(proj.description)
    setProjectUrl(proj.projectUrl || '')
    setRepositoryUrl(proj.repositoryUrl || '')
    setTechnologiesText(proj.technologies.join(', '))
    setDate(proj.date)
    setStatus(proj.status)
    setCoverUrl(proj.coverUrl || '')
    setIsModalOpen(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      toast.error('Preencha os campos obrigatórios: Nome do Projeto e Descrição.')
      return
    }

    const techArray = technologiesText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    if (editingId) {
      updatePortfolioProject(editingId, {
        title,
        description,
        projectUrl,
        repositoryUrl,
        technologies: techArray.length ? techArray : ['JavaScript', 'React'],
        date: date || new Date().toISOString().slice(0, 10),
        status,
        coverUrl,
      })
      toast.success('Projeto atualizado no portfólio!')
    } else {
      addPortfolioProject({
        title,
        description,
        projectUrl,
        repositoryUrl,
        technologies: techArray.length ? techArray : ['JavaScript', 'React'],
        date: date || new Date().toISOString().slice(0, 10),
        status,
        coverUrl,
      })
      toast.success('Projeto cadastrado no portfólio com sucesso!')
    }

    setIsModalOpen(false)
  }

  function handleDelete(id: string) {
    deletePortfolioProject(id)
    setDeleteConfirmId(null)
    toast.success('Projeto removido do portfólio.')
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-[#0e0d16] text-white rounded-3xl shadow-xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black text-white flex items-center gap-2">
              <FolderGit2 className="size-5 text-cyan-400" /> Portfólio de Projetos
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Apresente suas aplicações práticas, repositórios de código aberto e demonstrações online para recrutadores.
            </CardDescription>
          </div>

          <Button
            type="button"
            onClick={openNewModal}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs gap-1.5 rounded-xl shadow-lg shadow-cyan-500/20 shrink-0 cursor-pointer"
          >
            <Plus className="size-4" /> Adicionar Projeto
          </Button>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          {portfolioProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-10 text-center space-y-3">
              <FolderGit2 className="size-10 text-zinc-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Nenhum projeto cadastrado</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Cadastre seus melhores projetos com links do GitHub e deploy para compor seu portfólio público.
                </p>
              </div>
              <Button
                type="button"
                onClick={openNewModal}
                className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-bold gap-1.5 rounded-xl mt-2"
              >
                <Plus className="size-4" /> Adicionar Primeiro Projeto
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {portfolioProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-2xl border border-white/5 bg-black/30 p-5 flex flex-col justify-between gap-4 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-950/20 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          proj.status === 'Publicado' || proj.status === 'Concluído'
                            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                            : proj.status === 'Em Desenvolvimento'
                            ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
                            : 'text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {proj.status}
                      </Badge>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(proj)}
                          className="size-7 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
                        >
                          <Edit2 className="size-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirmId(proj.id)}
                          className="size-7 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-3 mt-1.5 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>

                    {/* Tech Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.technologies.map((t, i) => (
                        <span
                          key={i}
                          className="rounded-md border border-white/5 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono font-semibold text-zinc-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Project External Links */}
                  <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                    {proj.repositoryUrl ? (
                      <a
                        href={proj.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full text-xs font-bold gap-1.5 border-white/10 bg-white/[0.02] text-zinc-300 hover:text-white hover:border-white/20"
                        >
                          <GithubIcon className="size-3.5" /> Código
                        </Button>
                      </a>
                    ) : null}

                    {proj.projectUrl ? (
                      <a
                        href={proj.projectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1"
                      >
                        <Button
                          type="button"
                          size="sm"
                          className="w-full text-xs font-bold gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20"
                        >
                          <ExternalLink className="size-3.5" /> Demo
                        </Button>
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Criação / Edição */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-[#0f0e17] border-white/10 text-white rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <FolderGit2 className="size-5 text-cyan-400" />
              {editingId ? 'Editar Projeto' : 'Novo Projeto do Portfólio'}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Adicione links de demonstração, código-fonte e as tecnologias que você utilizou.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Nome do Projeto *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: DevPath AI, E-commerce Full Stack, Task Manager"
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Descrição do Projeto *</Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explique o objetivo do projeto, desafios resolvidos e funcionalidades..."
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm leading-relaxed"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-300">Link de Deploy (Demo)</Label>
                <Input
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  placeholder="https://meuprojeto.vercel.app"
                  className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-300">Repositório (GitHub)</Label>
                <Input
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  placeholder="https://github.com/user/repo"
                  className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Tag className="size-3.5 text-cyan-400" /> Tecnologias (separadas por vírgula)
              </Label>
              <Input
                value={technologiesText}
                onChange={(e) => setTechnologiesText(e.target.value)}
                placeholder="Ex: Next.js, React 19, TypeScript, Tailwind CSS, PostgreSQL"
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-300">Status</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Concluído">Concluído</option>
                  <option value="Publicado">Publicado</option>
                  <option value="Em Desenvolvimento">Em Desenvolvimento</option>
                  <option value="Ideia">Ideia</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-300">Data de Criação</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="border-white/10 text-zinc-400 hover:text-white text-xs font-bold"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                size="sm"
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                <Check className="size-3.5" /> Salvar Projeto
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={Boolean(deleteConfirmId)} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-sm bg-[#0f0e17] border-white/10 text-white rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="space-y-2 text-center">
            <div className="size-12 rounded-full bg-red-500/10 text-red-400 grid place-items-center mx-auto border border-red-500/20">
              <AlertCircle className="size-6" />
            </div>
            <DialogTitle className="text-base font-black text-white">
              Excluir Projeto do Portfólio?
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Esta ação removerá este projeto do seu portfólio e currículo público.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmId(null)}
              className="border-white/10 text-zinc-300 hover:text-white text-xs font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs gap-1.5"
            >
              <Trash2 className="size-3.5" /> Confirmar Exclusão
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
