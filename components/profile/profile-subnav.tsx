'use client'

import { Camera, Edit, Eye, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProfileSubnavProps {
  activeTab: string
  onSelectTab: (tabKey: string) => void
  onOpenAvatarModal: () => void
  onOpenPublicProfile: () => void
}

export function ProfileSubnav({
  activeTab,
  onSelectTab,
  onOpenAvatarModal,
  onOpenPublicProfile,
}: ProfileSubnavProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0e0d16] p-2 sm:p-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-white pl-2">Informações Pessoais</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => onSelectTab('dados')}
          className={`text-xs font-bold gap-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'dados'
              ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
              : 'bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-white/10'
          }`}
        >
          <UserCheck className="size-3.5" /> Dados Pessoais
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onOpenAvatarModal}
          className="bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-white/10 text-xs font-bold gap-1.5 rounded-xl cursor-pointer"
        >
          <Camera className="size-3.5 text-cyan-400" /> Alterar Foto
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={() => onSelectTab('dados')}
          className="bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-white/10 text-xs font-bold gap-1.5 rounded-xl cursor-pointer"
        >
          <Edit className="size-3.5 text-amber-400" /> Editar Perfil
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onOpenPublicProfile}
          className="bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-white/10 text-xs font-bold gap-1.5 rounded-xl cursor-pointer"
        >
          <Eye className="size-3.5 text-violet-400" /> Visualizar Perfil
        </Button>
      </div>
    </div>
  )
}
