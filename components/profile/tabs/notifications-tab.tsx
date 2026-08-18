'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { Bell, Sparkles, BookOpen, Calendar, Bot, Check, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export function NotificationsTab() {
  const { profile, updateNotificationPreferences } = useAppStore()
  const initial = profile?.notificationPreferences || {
    newPrograms: true,
    contentUpdates: true,
    activitiesDeadlines: true,
    aiFeedback: true,
  }

  const [newPrograms, setNewPrograms] = useState(initial.newPrograms)
  const [contentUpdates, setContentUpdates] = useState(initial.contentUpdates)
  const [activitiesDeadlines, setActivitiesDeadlines] = useState(initial.activitiesDeadlines)
  const [aiFeedback, setAiFeedback] = useState(initial.aiFeedback)
  const [isSaving, setIsSaving] = useState(false)

  function handleSave() {
    setIsSaving(true)
    updateNotificationPreferences({
      newPrograms,
      contentUpdates,
      activitiesDeadlines,
      aiFeedback,
    })

    setTimeout(() => {
      setIsSaving(false)
      toast.success('Preferências de notificações salvas!')
    }, 300)
  }

  return (
    <Card className="border-white/10 bg-[#0e0d16] text-white rounded-3xl shadow-xl">
      <CardHeader className="border-b border-white/5 pb-6">
        <CardTitle className="text-xl font-black text-white flex items-center gap-2">
          <Bell className="size-5 text-cyan-400" /> Notificações de Atividades (Push)
        </CardTitle>
        <CardDescription className="text-xs text-zinc-400">
          Escolha quais alertas, lembretes de estudo e atualizações de cursos você deseja receber.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="space-y-4">
          {/* Option 1: Novos Programas */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-black/30">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400">
                <Sparkles className="size-5" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-xs sm:text-sm font-bold text-white cursor-pointer">
                  Novos Programas e Formações
                </Label>
                <p className="text-[11px] text-zinc-400">
                  Receba avisos em primeira mão quando novas trilhas e cursos forem lançados.
                </p>
              </div>
            </div>
            <Switch
              checked={newPrograms}
              onCheckedChange={setNewPrograms}
              className="data-[state=checked]:bg-cyan-500"
            />
          </div>

          {/* Option 2: Atualizações de Conteúdo */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-black/30">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-violet-950/40 border border-violet-500/30 text-violet-400">
                <BookOpen className="size-5" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-xs sm:text-sm font-bold text-white cursor-pointer">
                  Atualizações de Conteúdo & Comunidade
                </Label>
                <p className="text-[11px] text-zinc-400">
                  Notificações sobre melhorias de aulas, novos materiais e novidades de tecnologia.
                </p>
              </div>
            </div>
            <Switch
              checked={contentUpdates}
              onCheckedChange={setContentUpdates}
              className="data-[state=checked]:bg-cyan-500"
            />
          </div>

          {/* Option 3: Notificações de Atividades */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-black/30">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-400">
                <Calendar className="size-5" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-xs sm:text-sm font-bold text-white cursor-pointer">
                  Lembretes de Estudos e Sequência (Streak)
                </Label>
                <p className="text-[11px] text-zinc-400">
                  Alertas diários para manter seu foco e não perder o progresso consecutivo.
                </p>
              </div>
            </div>
            <Switch
              checked={activitiesDeadlines}
              onCheckedChange={setActivitiesDeadlines}
              className="data-[state=checked]:bg-cyan-500"
            />
          </div>

          {/* Option 4: IA Feedback */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-black/30">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
                <Bot className="size-5" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-xs sm:text-sm font-bold text-white cursor-pointer">
                  Feedbacks e Recomendações do Mentor Dev (IA)
                </Label>
                <p className="text-[11px] text-zinc-400">
                  Análises de código, planos de recuperação e dicas pedagógicas personalizadas.
                </p>
              </div>
            </div>
            <Switch
              checked={aiFeedback}
              onCheckedChange={setAiFeedback}
              className="data-[state=checked]:bg-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-white/10">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs sm:text-sm px-8 py-5 rounded-2xl shadow-xl shadow-cyan-500/20 gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="size-4 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Check className="size-4" /> Salvar Preferências
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
