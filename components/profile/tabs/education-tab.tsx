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
import type { EducationalBackground } from '@/lib/types'
import { GraduationCap, Plus, Edit2, Trash2, Calendar, School, Check, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export function EducationTab() {
  const {
    educationalBackgrounds,
    addEducationalBackground,
    updateEducationalBackground,
    deleteEducationalBackground,
  } = useAppStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Form State
  const [institution, setInstitution] = useState('')
  const [course, setCourse] = useState('')
  const [level, setLevel] = useState<EducationalBackground['level']>('Graduação')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<EducationalBackground['status']>('Em Andamento')
  const [description, setDescription] = useState('')

  function openNewModal() {
    setEditingId(null)
    setInstitution('')
    setCourse('')
    setLevel('Graduação')
    setStartDate('')
    setEndDate('')
    setStatus('Em Andamento')
    setDescription('')
    setIsModalOpen(true)
  }

  function openEditModal(edu: EducationalBackground) {
    setEditingId(edu.id)
    setInstitution(edu.institution)
    setCourse(edu.course)
    setLevel(edu.level)
    setStartDate(edu.startDate)
    setEndDate(edu.endDate || '')
    setStatus(edu.status)
    setDescription(edu.description || '')
    setIsModalOpen(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!institution.trim() || !course.trim() || !startDate) {
      toast.error('Preencha os campos obrigatórios: Instituição, Curso e Data de Início.')
      return
    }

    if (editingId) {
      updateEducationalBackground(editingId, {
        institution,
        course,
        level,
        startDate,
        endDate,
        status,
        description,
      })
      toast.success('Formação acadêmica atualizada!')
    } else {
      addEducationalBackground({
        institution,
        course,
        level,
        startDate,
        endDate,
        status,
        description,
      })
      toast.success('Formação adicionada com sucesso!')
    }

    setIsModalOpen(false)
  }

  function handleDelete(id: string) {
    deleteEducationalBackground(id)
    setDeleteConfirmId(null)
    toast.success('Formação removida.')
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
              <GraduationCap className="size-5 text-cyan-400" /> Formação Educacional & Acadêmica
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Cadastre suas graduações, pós-graduações, cursos técnicos e certificações acadêmicas.
            </CardDescription>
          </div>

          <Button
            type="button"
            onClick={openNewModal}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs gap-1.5 rounded-xl shadow-lg shadow-cyan-500/20 shrink-0 cursor-pointer"
          >
            <Plus className="size-4" /> Adicionar Formação
          </Button>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          {educationalBackgrounds.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-10 text-center space-y-3">
              <GraduationCap className="size-10 text-zinc-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Nenhuma formação cadastrada</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Adicione seus cursos técnicos, graduações ou pós-graduações para destacar sua base educacional.
                </p>
              </div>
              <Button
                type="button"
                onClick={openNewModal}
                className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-bold gap-1.5 rounded-xl mt-2"
              >
                <Plus className="size-4" /> Adicionar Primeira Formação
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {educationalBackgrounds.map((edu) => (
                <div
                  key={edu.id}
                  className="rounded-2xl border border-white/5 bg-black/30 p-5 flex flex-col justify-between gap-4 transition-all hover:border-cyan-500/30"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <Badge className="bg-violet-950/80 border border-violet-500/40 text-violet-300 font-bold text-[11px]">
                        {edu.level}
                      </Badge>

                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          edu.status === 'Concluído'
                            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                            : edu.status === 'Em Andamento'
                            ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
                            : 'text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {edu.status}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{edu.course}</h3>
                      <p className="text-xs text-cyan-300 font-semibold flex items-center gap-1.5 mt-0.5">
                        <School className="size-3.5" /> {edu.institution}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                      <Calendar className="size-3.5 text-zinc-500" />
                      <span>
                        {formatDisplayDate(edu.startDate)} {edu.endDate ? `até ${formatDisplayDate(edu.endDate)}` : '(Atual)'}
                      </span>
                    </div>

                    {edu.description && (
                      <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                        {edu.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-3 border-t border-white/5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(edu)}
                      className="text-xs text-zinc-400 hover:text-white gap-1"
                    >
                      <Edit2 className="size-3" /> Editar
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmId(edu.id)}
                      className="text-xs text-red-400 hover:text-red-300 gap-1"
                    >
                      <Trash2 className="size-3" /> Excluir
                    </Button>
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
              <GraduationCap className="size-5 text-cyan-400" />
              {editingId ? 'Editar Formação Educacional' : 'Nova Formação Educacional'}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Informe a instituição de ensino, grau acadêmico e período.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Instituição de Ensino *</Label>
              <Input
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Ex: USP, FIAP, PUC, ETEC, Alura, DevPath AI"
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Curso / Programa *</Label>
              <Input
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="Ex: Análise e Desenvolvimento de Sistemas, Ciência da Computação"
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-300">Nível / Grau</Label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Graduação">Graduação</option>
                  <option value="Pós-Graduação">Pós-Graduação</option>
                  <option value="Mestrado">Mestrado</option>
                  <option value="Doutorado">Doutorado</option>
                  <option value="Técnico">Técnico</option>
                  <option value="Tecnólogo">Tecnólogo</option>
                  <option value="Ensino Médio">Ensino Médio</option>
                  <option value="Curso Livre">Curso Livre / Bootcamp</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-300">Situação</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Trancado">Trancado</option>
                  <option value="Interrompido">Interrompido</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-300">Data de Início *</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-300">Data de Conclusão / Previsão</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Descrição / Destaques</Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Principais matérias, TCC, projetos acadêmicos ou realizações..."
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
                <Check className="size-3.5" /> Salvar Formação
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
              Excluir Formação Educacional?
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Esta ação removerá este registro do seu currículo. Tem certeza de que deseja prosseguir?
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
