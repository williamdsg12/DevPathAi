'use client'

import { useEffect, useState } from 'react'
import {
  Bell,
  CheckCircle2,
  Lock,
  Moon,
  Save,
  Shield,
  Sun,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [studyReminders, setStudyReminders] = useState(true)
  const [streakAlerts, setStreakAlerts] = useState(true)
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
      toast.success('Preferências salvas com sucesso!')
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
    toast.success('Senha alterada com sucesso!')
    setCurrentPassword('')
    setNewPassword('')
  }

  return (
    <AppShell
      title="Configurações da Conta"
      subtitle="Gerencie suas preferências de tema, notificações diárias e segurança de acesso"
    >
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Theme Settings */}
        <Card className="border-border/80 shadow-md">
          <CardHeader className="pb-4 border-b border-border/60">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sun className="size-4 text-primary" /> Tema da Interface
            </CardTitle>
            <CardDescription className="text-xs">
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
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/40'
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
        <Card className="border-border/80 shadow-md">
          <CardHeader className="pb-4 border-b border-border/60">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Bell className="size-4 text-primary" /> Notificações & Lembretes
            </CardTitle>
            <CardDescription className="text-xs">
              Mantenha o foco e a consistência nos estudos diários.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground">Lembrete de Estudo Diário</p>
                <p className="text-muted-foreground">Notificar no horário planejado para manter sua meta.</p>
              </div>
              <input
                type="checkbox"
                checked={studyReminders}
                onChange={(e) => setStudyReminders(e.target.checked)}
                className="size-4 accent-primary rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              <div>
                <p className="font-bold text-foreground">Alertas de Streak & Conquistas</p>
                <p className="text-muted-foreground">Avisar quando você estiver prestes a bater recordes.</p>
              </div>
              <input
                type="checkbox"
                checked={streakAlerts}
                onChange={(e) => setStreakAlerts(e.target.checked)}
                className="size-4 accent-primary rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              <div>
                <p className="font-bold text-foreground">Perfil Público Ativo (/u/username)</p>
                <p className="text-muted-foreground">Permitir que recrutadores visualizem seu portfólio.</p>
              </div>
              <input
                type="checkbox"
                checked={publicProfile}
                onChange={(e) => setPublicProfile(e.target.checked)}
                className="size-4 accent-primary rounded cursor-pointer"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button onClick={handleSavePreferences} disabled={isSaving} size="sm" className="gap-2 text-xs font-bold">
                <Save className="size-3.5" />
                {isSaving ? 'Salvando...' : 'Salvar Preferências'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security & Password */}
        <Card className="border-border/80 shadow-md">
          <CardHeader className="pb-4 border-b border-border/60">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Lock className="size-4 text-primary" /> Segurança da Conta
            </CardTitle>
            <CardDescription className="text-xs">
              Atualize sua senha de acesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Senha Atual</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Nova Senha</label>
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="outline" size="sm" className="font-bold text-xs">
                  Atualizar Senha
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
