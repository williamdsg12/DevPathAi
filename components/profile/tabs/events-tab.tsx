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
import type { UserEvent } from '@/lib/types'
import { CalendarDays, Plus, Edit2, Trash2, MapPin, Mic, Users, Check, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export function EventsTab() {
  const { userEvents, addUserEvent, updateUserEvent, deleteUserEvent } = useAppStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [organizer, setOrganizer] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [speakerRole, setSpeakerRole] = useState('Participante')
  const [description, setDescription] = useState('')

  function openNewModal() {
    setEditingId(null)
    setTitle('')
    setOrganizer('')
    setDate(new Date().toISOString().slice(0, 10))
    setLocation('')
    setSpeakerRole('Participante')
    setDescription('')
    setIsModalOpen(true)
  }

  function openEditModal(evt: UserEvent) {
    setEditingId(evt.id)
    setTitle(evt.title)
    setOrganizer(evt.organizer || '')
    setDate(evt.date)
    setLocation(evt.location || '')
    setSpeakerRole(evt.speakerRole || 'Participante')
    setDescription(evt.description || '')
    setIsModalOpen(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !date) {
      toast.error('Preencha os campos obrigatórios: Título e Data do Evento.')
      return
    }

    if (editingId) {
      updateUserEvent(editingId, {
        title,
        organizer,
        date,
        location,
        speakerRole,
        description,
      })
      toast.success('Evento atualizado com sucesso!')
    } else {
      addUserEvent({
        title,
        organizer,
        date,
        location,
        speakerRole,
        description,
      })
      toast.success('Evento registrado no perfil!')
    }

    setIsModalOpen(false)
  }

  function handleDelete(id: string) {
    deleteUserEvent(id)
    setDeleteConfirmId(null)
    toast.success('Evento removido.')
  }

  function formatDisplayDate(dateStr: string) {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${day || '01'} de ${months[parseInt(month, 10) - 1] || ''} de ${year}`
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-[#0e0d16] text-white rounded-3xl shadow-xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black text-white flex items-center gap-2">
              <CalendarDays className="size-5 text-cyan-400" /> Eventos, Hackathons & Meetups
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Registre sua participação em conferências, hackathons, palestras e encontros de comunidade.
            </CardDescription>
          </div>

          <Button
            type="button"
            onClick={openNewModal}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs gap-1.5 rounded-xl shadow-lg shadow-cyan-500/20 shrink-0 cursor-pointer"
          >
            <Plus className="size-4" /> Adicionar Evento
          </Button>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          {userEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-10 text-center space-y-3">
              <CalendarDays className="size-10 text-zinc-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Nenhum evento registrado</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Participou de algum congresso, webinar ou maratona de programação? Adicione aqui ao seu currículo.
                </p>
              </div>
              <Button
                type="button"
                onClick={openNewModal}
                className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-bold gap-1.5 rounded-xl mt-2"
              >
                <Plus className="size-4" /> Adicionar Primeiro Evento
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {userEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="rounded-2xl border border-white/5 bg-black/30 p-5 flex flex-col justify-between gap-4 transition-all hover:border-cyan-500/30"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <Badge className="bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center gap-1">
                        <Mic className="size-3" /> {evt.speakerRole || 'Participante'}
                      </Badge>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(evt)}
                          className="size-7 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                        >
                          <Edit2 className="size-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirmId(evt.id)}
                          className="size-7 rounded-lg text-red-400 hover:text-red-300 cursor-pointer"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{evt.title}</h3>
                      {evt.organizer && (
                        <p className="text-xs text-zinc-400 font-medium flex items-center gap-1.5 mt-0.5">
                          <Users className="size-3.5 text-zinc-500" /> {evt.organizer}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
                      <span>{formatDisplayDate(evt.date)}</span>
                      {evt.location && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-cyan-300">
                            <MapPin className="size-3 text-cyan-400" /> {evt.location}
                          </span>
                        </>
                      )}
                    </div>

                    {evt.description && (
                      <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                        {evt.description}
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
              <CalendarDays className="size-5 text-cyan-400" />
              {editingId ? 'Editar Evento' : 'Novo Evento / Conferência'}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Cadastre suas participações em encontros técnicos da comunidade dev.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Título / Nome do Evento *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Next.js Conf Brasil, Hackathon Dev 2025"
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Organizador / Comunidade</Label>
              <Input
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="Ex: Vercel, Comunidade React Brasil, Rocketseat"
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-300">Data do Evento *</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-300">Papel / Função</Label>
                <select
                  value={speakerRole}
                  onChange={(e) => setSpeakerRole(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Participante">Participante</option>
                  <option value="Palestrante">Palestrante</option>
                  <option value="Mentor / Juiz">Mentor / Juiz</option>
                  <option value="Organizador">Organizador</option>
                  <option value="Voluntário">Voluntário</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Local (Cidade/UF ou Online)</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: São Paulo, SP / Presencial & Online"
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Descrição / Aprendizados</Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Conte sobre os tópicos abordados, sua contribuição ou premiações recebidas..."
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
                <Check className="size-3.5" /> Salvar Evento
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
              Excluir Registro de Evento?
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Esta ação removerá este evento do seu currículo.
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
