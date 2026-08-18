'use client'

import { useEffect, useState } from 'react'
import {
  Bell,
  CheckCircle2,
  CreditCard,
  Download,
  Lock,
  Mail,
  Moon,
  Save,
  Shield,
  Sparkles,
  Sun,
  User,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { profile, xp, level, overallProgress, completedLessons, projects } = useAppStore()
  const [mounted, setMounted] = useState(false)
  const [studyReminders, setStudyReminders] = useState(true)
  const [streakAlerts, setStreakAlerts] = useState(true)
  const [emailDigest, setEmailDigest] = useState('daily')
  const [publicProfile, setPublicProfile] = useState(true)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  function handleSavePreferences() {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Preferências de estudo e notificações salvas com sucesso!')
    }, 400)
  }

  function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (!currentPassword || !newPassword) {
      toast.error('Preencha a senha atual e a nova senha.')
      return
    }
    if (newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }
    toast.success('Senha de acesso alterada com sucesso!')
    setCurrentPassword('')
    setNewPassword('')
  }

  function handleExportData() {
    const data = {
      user: profile,
      xp,
      level,
      overallProgress,
      completedLessonsCount: completedLessons.length,
      projectsCount: projects.length,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `devpath-data-${profile?.name?.replace(/\s+/g, '_') || 'aluno'}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Dados e histórico de estudos exportados com sucesso!')
  }

  return (
    <AppShell
      title="Configurações da Conta"
      subtitle="Gerencie seu plano, tema visual, preferências de e-mail e segurança de acesso"
    >
      <div className="mx-auto max-w-4xl space-y-8 pb-16">
        {/* Subscription & Plan Status Card */}
        <Card className="border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-[#12111d] to-[#0a0910] shadow-2xl rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <Badge className="bg-violet-600 text-white font-bold text-xs">
                  <Sparkles className="size-3 mr-1" /> Plano Pro DevPath Ativo
                </Badge>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-bold">
                  Acesso Total
                </Badge>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Assinatura Anual — Acesso Completo
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                Seu plano inclui acesso ilimitado a todas as trilhas, DevMentor AI 24/7, Code Lab, projetos guiados e emissão de certificados oficiais.
              </p>
            </div>

            <Button variant="outline" className="border-violet-500/40 text-violet-300 hover:bg-violet-950/40 font-bold text-xs rounded-xl shrink-0">
              <CreditCard className="size-3.5 mr-1.5" /> Gerenciar Assinatura
            </Button>
          </div>
        </Card>

        {/* Theme Settings */}
        <Card className="border-white/10 bg-[#12111d] shadow-xl rounded-3xl">
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Sun className="size-4 text-violet-400" /> Tema da Interface
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Escolha a aparência preferida para o seu ambiente de estudos.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'dark', label: 'Escuro (Dark)', icon: Moon },
                { id: 'light', label: 'Claro (Light)', icon: Sun },
                { id: 'system', label: 'Automático', icon: Shield },
              ].map((t) => {
                const isSelected = mounted && theme === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-violet-500 bg-violet-950/50 text-white ring-1 ring-violet-400'
                        : 'border-white/5 bg-black/30 text-zinc-400 hover:border-violet-500/40 hover:text-white'
                    }`}
                  >
                    <t.icon className="size-5" />
                    <span>{t.label}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Notifications & Reminders */}
        <Card className="border-white/10 bg-[#12111d] shadow-xl rounded-3xl">
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Bell className="size-4 text-violet-400" /> Notificações & Lembretes Diários
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Mantenha o foco e a consistência nas suas metas de programação.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Lembrete de Estudo Diário</p>
                <p className="text-zinc-400">Notificar no horário programado para manter sua meta diária.</p>
              </div>
              <input
                type="checkbox"
                checked={studyReminders}
                onChange={(e) => setStudyReminders(e.target.checked)}
                className="size-4 accent-violet-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div>
                <p className="font-bold text-white">Alertas de Streak & Conquistas</p>
                <p className="text-zinc-400">Avisar quando você estiver prestes a bater novos recordes de consistência.</p>
              </div>
              <input
                type="checkbox"
                checked={streakAlerts}
                onChange={(e) => setStreakAlerts(e.target.checked)}
                className="size-4 accent-violet-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div>
                <p className="font-bold text-white">Frequência de Resumos por E-mail</p>
                <p className="text-zinc-400">Receba boletins semanais com seu progresso e recomendações.</p>
              </div>
              <select
                value={emailDigest}
                onChange={(e) => setEmailDigest(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-500"
              >
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="none">Desativado</option>
              </select>
            </div>

            <div className="pt-2">
              <Button onClick={handleSavePreferences} className="bg-violet-600 hover:bg-violet-500 text-xs font-bold rounded-xl py-4">
                <Save className="size-3.5 mr-1" /> Salvar Preferências
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Export & Privacy */}
        <Card className="border-white/10 bg-[#12111d] shadow-xl rounded-3xl">
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Download className="size-4 text-emerald-400" /> Exportar Dados de Progresso
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Faça o download de todas as suas métricas, notas, XP e projetos em formato JSON.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-white">Backup do Histórico do Aluno</p>
              <p className="text-xs text-zinc-400">Inclui histórico de avaliações e tempo de estudo registrado.</p>
            </div>
            <Button onClick={handleExportData} variant="outline" className="border-white/10 text-xs font-bold rounded-xl text-white hover:bg-white/5">
              <Download className="size-3.5 mr-1.5" /> Exportar JSON
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
