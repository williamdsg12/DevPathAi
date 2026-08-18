'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { PromoBanner } from '@/components/blocks/promo-banner'
import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfileStatsGrid } from '@/components/profile/profile-stats-grid'
import { ProfileSubnav } from '@/components/profile/profile-subnav'
import { AvatarUploadModal } from '@/components/profile/avatar-upload-modal'
import { PersonalDataTab } from '@/components/profile/tabs/personal-data-tab'
import { SocialLinksTab } from '@/components/profile/tabs/social-links-tab'
import { NotificationsTab } from '@/components/profile/tabs/notifications-tab'
import { ExperienceTab } from '@/components/profile/tabs/experience-tab'
import { EducationTab } from '@/components/profile/tabs/education-tab'
import { ProjectsTab } from '@/components/profile/tabs/projects-tab'
import { EventsTab } from '@/components/profile/tabs/events-tab'
import { CertificatesTab } from '@/components/profile/tabs/certificates-tab'
import { TechnologiesTab } from '@/components/profile/tabs/technologies-tab'
import { useAppStore } from '@/lib/store'
import {
  User,
  Share2,
  Bell,
  Briefcase,
  GraduationCap,
  FolderGit2,
  CalendarDays,
  Award,
  Code2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const { profile, uploadProfileAvatar, removeProfileAvatar } = useAppStore()
  const [activeTab, setActiveTab] = useState<string>('dados')
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)

  const username = profile?.github || 'williamdev'

  const tabsConfig = [
    { id: 'dados', label: 'Dados gerais', icon: User },
    { id: 'sociais', label: 'Redes sociais', icon: Share2 },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'experiencia', label: 'Experiência profissional', icon: Briefcase },
    { id: 'formacao', label: 'Formação educacional', icon: GraduationCap },
    { id: 'projetos', label: 'Projetos', icon: FolderGit2 },
    { id: 'eventos', label: 'Eventos', icon: CalendarDays },
    { id: 'certificados', label: 'Certificados', icon: Award },
    { id: 'tecnologias', label: 'Tecnologias', icon: Code2 },
  ]

  function handleOpenPublicProfile() {
    router.push(`/u/${username}`)
  }

  return (
    <AppShell>
      {/* 1. Promotional Banner */}
      <PromoBanner />

      <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* 2. User Profile Header with Greetings and Actions */}
        <ProfileHeader onOpenEditTab={() => setActiveTab('dados')} />

        {/* 3. Real-time Educational Stats Grid */}
        <ProfileStatsGrid />

        {/* 4. Subnavigation bar */}
        <ProfileSubnav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
          onOpenPublicProfile={handleOpenPublicProfile}
        />

        {/* 5. 9-Tab Horizontal Navigation & Dynamic Contents */}
        <div className="space-y-6">
          {/* Horizontal Tabs Bar */}
          <div className="overflow-x-auto no-scrollbar pb-2">
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0c0b14] border border-white/10 min-w-max">
              {tabsConfig.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25 scale-[1.02]'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className={`size-4 ${isActive ? 'text-black' : 'text-zinc-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Active Tab Panel */}
          <div className="transition-all duration-300">
            {activeTab === 'dados' && <PersonalDataTab />}
            {activeTab === 'sociais' && <SocialLinksTab />}
            {activeTab === 'notificacoes' && <NotificationsTab />}
            {activeTab === 'experiencia' && <ExperienceTab />}
            {activeTab === 'formacao' && <EducationTab />}
            {activeTab === 'projetos' && <ProjectsTab />}
            {activeTab === 'eventos' && <EventsTab />}
            {activeTab === 'certificados' && <CertificatesTab />}
            {activeTab === 'tecnologias' && <TechnologiesTab />}
          </div>
        </div>
      </div>

      {/* Global Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarUrl={profile?.avatarUrl}
        userName={profile?.name || 'William'}
        onSaveAvatar={uploadProfileAvatar}
        onRemoveAvatar={removeProfileAvatar}
      />
    </AppShell>
  )
}
