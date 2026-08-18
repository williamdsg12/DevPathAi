'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Camera,
  Edit3,
  ExternalLink,
  Flame,
  LogOut,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AvatarUploadModal } from './avatar-upload-modal'
import { useAppStore } from '@/lib/store'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

interface ProfileHeaderProps {
  onOpenEditTab: () => void
}

export function ProfileHeader({ onOpenEditTab }: ProfileHeaderProps) {
  const router = useRouter()
  const { profile, uploadProfileAvatar, removeProfileAvatar, signOut, level, streak, xp } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)

  const userName = profile?.name || 'William'
  const initials = userName.slice(0, 2).toUpperCase()
  const desiredRole = profile?.desiredRole || 'Desenvolvedor Full Stack Júnior'
  const username = profile?.github || 'williamdev'

  async function handleSignOut() {
    await signOut()
    toast.info('Sessão encerrada.')
    router.push('/login')
  }

  function toggleTheme() {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    toast.success(`Tema alternado para ${nextTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`)
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#12111d] via-[#0d0c15] to-[#08070d] p-6 sm:p-8 shadow-2xl">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 size-72 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-72 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Avatar, Name Greeting & Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Avatar with Camera Overlay */}
            <div className="relative group">
              <div className="size-24 sm:size-28 rounded-full overflow-hidden border-4 border-cyan-500/40 bg-gradient-to-br from-violet-950 to-purple-900 shadow-xl shadow-cyan-950/40 flex items-center justify-center">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={userName}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="text-3xl sm:text-4xl font-black text-white">{initials}</div>
                )}
              </div>

              {/* Quick Camera Action Overlay */}
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/40 transition-transform hover:scale-110 cursor-pointer border-2 border-[#0d0c15]"
                title="Alterar Foto"
                aria-label="Alterar Foto"
              >
                <Camera className="size-4" />
              </button>
            </div>

            {/* Greetings and Details */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-300">{userName}</span>
                </h1>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold text-xs">
                  Nível {level}
                </Badge>
                <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/30 font-bold text-xs gap-1">
                  <Flame className="size-3.5 fill-amber-400 text-amber-400" /> {streak} {streak === 1 ? 'dia' : 'dias'}
                </Badge>
              </div>

              <p className="text-xs sm:text-sm font-bold text-zinc-300">{desiredRole}</p>
              <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
                {profile?.bio || 'Desenvolvedor em formação adaptativa na plataforma DevPath AI.'}
              </p>

              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] font-mono text-zinc-400">
                <span>{xp.toLocaleString('pt-BR')} XP acumulados</span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <UserCheck className="size-3" /> Conta Verificada
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions Buttons & Controls */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2.5 shrink-0 pt-2 lg:pt-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenEditTab}
              className="border-cyan-500/40 bg-cyan-950/20 text-cyan-300 hover:bg-cyan-950/40 text-xs font-bold gap-1.5 rounded-xl cursor-pointer"
            >
              <Edit3 className="size-3.5" /> Editar Cadastro
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAvatarModalOpen(true)}
              className="border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.08] text-xs font-bold gap-1.5 rounded-xl cursor-pointer"
            >
              <Camera className="size-3.5 text-cyan-400" /> Alterar Foto
            </Button>

            <Link href={`/u/${username}`} target="_blank">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.08] text-xs font-bold gap-1.5 rounded-xl cursor-pointer"
              >
                <ExternalLink className="size-3.5 text-violet-400" /> Visualizar Perfil
              </Button>
            </Link>

            {/* Dark Mode Control */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white text-xs font-bold gap-1.5 rounded-xl cursor-pointer"
              title="Alternar Modo Escuro / Claro"
            >
              {theme === 'light' ? (
                <>
                  <Sun className="size-3.5 text-amber-400" /> Light Mode
                </>
              ) : (
                <>
                  <Moon className="size-3.5 text-cyan-400" /> Dark Mode
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs font-bold gap-1.5 rounded-xl cursor-pointer"
            >
              <LogOut className="size-3.5" /> Sair
            </Button>
          </div>
        </div>
      </div>

      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarUrl={profile?.avatarUrl}
        userName={userName}
        onSaveAvatar={uploadProfileAvatar}
        onRemoveAvatar={removeProfileAvatar}
      />
    </>
  )
}
