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
import { Checkbox } from '@/components/ui/checkbox'
import { useAppStore } from '@/lib/store'
import type { ProfessionalExperience } from '@/lib/types'
import { Briefcase, Plus, Edit2, Trash2, Calendar, Building2, Check, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export function ExperienceTab() {
  const {
    professionalExperiences,
    addProfessionalExperience,
    updateProfessionalExperience,
    deleteProfessionalExperience,
  } = useAppStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Form State
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isCurrent, setIsCurrent] = useState(false)
  const [description, setDescription] = useState('')

  function openNewModal() {
    setEditingId(null)
    setRole('')
    setCompany('')
    setStartDate('')
    setEndDate('')
    setIsCurrent(false)
    setDescription('')
    setIsModalOpen(true)
  }

  function openEditModal(exp: ProfessionalExperience) {
    setEditingId(exp.id)
    setRole(exp.role)
    setCompany(exp.company)
    setStartDate(exp.startDate)
    setEndDate(exp.endDate || '')
    setIsCurrent(exp.isCurrent)
    setDescription(exp.description)
    setIsModalOpen(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!role.trim() || !company.trim() || !startDate) {
      toast.error('Preencha os campos obrigatórios: Cargo, Empresa e Data de Início.')
      return
    }

    if (editingId) {
      updateProfessionalExperience(editingId, {
        role,
        company,
        startDate,
        endDate: isCurrent ? '' : endDate,
        isCurrent,
        description,
      })
      toast.success('Experiência atualizada com sucesso!')
    } else {
      addProfessionalExperience({
        role,
        company,
        startDate,
        endDate: isCurrent ? '' : endDate,
        isCurrent,
        description,
      })
      toast.success('Experiência adicionada ao currículo!')
    }

    setIsModalOpen(false)
  }

  function handleDelete(id: string) {
    deleteProfessionalExperience(id)
    setDeleteConfirmId(null)
    toast.success('Experiência removida.')
  }

  function formatDisplayDate(dateStr: string) {
    if (!dateStr) return ''
    const [year, month] = dateStr.split('-')
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${months[parseInt(month, 10) - 1] || ''} ${year}`
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-[#0e0d16] text-white rounded-3xl shadow-xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black text-white flex items-center gap-2">
              <Briefcase className="size-5 text-cyan-400" /> Experiência Profissional
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Cadastre seu histórico de cargos, empresas e projetos para compor seu currículo profissional.
            </CardDescription>
          </div>

          <Button
            type="button"
            onClick={openNewModal}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs gap-1.5 rounded-xl shadow-lg shadow-cyan-500/20 shrink-0 cursor-pointer"
          >
            <Plus className="size-4" /> Adicionar Experiência
          </Button>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          {professionalExperiences.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-10 text-center space-y-3">
              <Briefcase className="size-10 text-zinc-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Nenhuma experiência cadastrada</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Você ainda não cadastrou nenhuma experiência profissional. Adicione seu histórico para valorizar seu perfil.
                </p>
              </div>
              <Button
                type="button"
                onClick={openNewModal}
                className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-bold gap-1.5 rounded-xl mt-2"
              >
                <Plus className="size-4" /> Adicionar Primeira Experiência
              </Button>
            </div>
          ) : (
            <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
              {professionalExperiences.map((exp) => (
                <div key={exp.id} className="relative group space-y-2">
                  {/* Timeline dot */}
                  <div className="absolute -left-[27px] top-1 size-3.5 rounded-full border-2 border-cyan-400 bg-[#0e0d16] group-hover:scale-125 transition-transform" />

                  <div className="rounded-2xl border border-white/5 bg-black/30 p-5 space-y-3 transition-all hover:border-cyan-500/30">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-white">{exp.role}</h3>
                          {exp.isCurrent && (
                            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                              Atual
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-1">
                          <span className="font-semibold text-cyan-300 flex items-center gap-1">
                            <Building2 className="size-3.5" /> {exp.company}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="size-3.5 text-zinc-500" />
                            {formatDisplayDate(exp.startDate)} até {exp.isCurrent ? 'o momento' : formatDisplayDate(exp.endDate || '')}
                          </span>
                        </div>
                      </div>

                      {/* Edit / Delete Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(exp)}
                          className="size-8 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirmId(exp.id)}
                          className="size-8 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    {exp.description && (
                      <p className="text-xs text-zinc-300 leading-relaxed pt-1 whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
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
              <Briefcase className="size-5 text-cyan-400" />
              {editingId ? 'Editar Experiência Profissional' : 'Nova Experiência Profissional'}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Preencha os detalhes do cargo e suas principais responsabilidades e conquistas.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Cargo / Título *</Label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ex: Desenvolvedor Front-end, Engenheiro de Software"
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Empresa *</Label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ex: Nubank, Google, TechSolutions"
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-300">Data de Entrada *</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-300">Data de Saída</Label>
                <Input
                  type="date"
                  value={endDate}
                  disabled={isCurrent}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm disabled:opacity-40"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="isCurrentExp"
                checked={isCurrent}
                onCheckedChange={(checked) => setIsCurrent(Boolean(checked))}
                className="data-[state=checked]:bg-cyan-500 data-[state=checked]:text-black border-white/20"
              />
              <label htmlFor="isCurrentExp" className="text-xs font-semibold text-zinc-300 cursor-pointer">
                Trabalho atualmente nesta empresa
              </label>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Descrição das Atividades</Label>
              <Textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva as tecnologias utilizadas, projetos entregues e impacto do seu trabalho..."
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm leading-relaxed"
              />
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
                <Check className="size-3.5" /> Salvar Experiência
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
              Excluir Experiência Profissional?
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Esta ação removerá o registro do seu currículo. Tem certeza de que deseja continuar?
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
