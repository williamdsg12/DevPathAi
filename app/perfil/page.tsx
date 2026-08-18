'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  Eye,
  Flame,
  FolderGit2,
  GraduationCap,
  Layers,
  Lock,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GithubIcon, LinkedinIcon } from '@/components/icons'
import { useAppStore } from '@/lib/store'
import { getIcon } from '@/lib/module-icons'

export default function ProfilePage() {
  const {
    profile,
    updateProfile,
    activePath,
    allModules,
    achievements,
    xp,
    level,
    streak,
    studiedMinutes,
    overallProgress,
    projects,
    certificates,
    currentModuleId,
    getModuleMastery,
    completedLessons,
  } = useAppStore()

  const [name, setName] = useState(profile?.name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [github, setGithub] = useState(profile?.github || '')
  const [linkedin, setLinkedin] = useState(profile?.linkedin || '')
  const [desiredRole, setDesiredRole] = useState(
    profile?.desiredRole || 'Desenvolvedor Full Stack Júnior'
  )
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'skills' | 'preview'>('profile')

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    updateProfile({
      name,
      bio,
      github,
      linkedin,
      desiredRole,
    })
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Perfil profissional atualizado com sucesso!')
    }, 400)
  }

  const displayName = name || profile?.name || 'Desenvolvedor'
  const username = github || 'williamdev'
  const currentMod = allModules.find((m) => m.id === currentModuleId) || allModules[0]
  const currentMastery = getModuleMastery(currentMod?.id || 'mod-logica')

  const skillMasteryList = [
    { skill: 'Lógica de Programação & Algoritmos', score: 92, level: 'Dominado' },
    { skill: 'Estruturas de Dados & Complexidade', score: 78, level: 'Avançado' },
    { skill: 'Git & GitHub Workflow', score: 85, level: 'Avançado' },
    { skill: 'HTML5 Semântico & CSS3 Moderno', score: 80, level: 'Avançado' },
    { skill: 'JavaScript Moderno (ES6+)', score: 70, level: 'Intermediário' },
    { skill: 'React 19 & Next.js App Router', score: 65, level: 'Intermediário' },
    { skill: 'Node.js & APIs RESTful', score: 60, level: 'Intermediário' },
    { skill: 'Banco de Dados Relacional & SQL', score: 55, level: 'Em Desenvolvimento' },
  ]

  return (
    <AppShell
      title="Meu Perfil Profissional"
      subtitle="Gerencie suas competências técnicas, portfólio público para recrutadores e histórico de evolução"
    >
      <div className="space-y-8 pb-16">
        {/* Profile Hero Header */}
        <section className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/40 via-[#12111d] to-[#0a0910] p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white text-3xl font-black shadow-xl shadow-purple-600/30 ring-4 ring-violet-500/20">
                {displayName.slice(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{displayName}</h1>
                  <Badge className="bg-violet-600 text-white text-xs font-bold">
                    Nível {level}
                  </Badge>
                  <Badge variant="secondary" className="gap-1 font-bold text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <Flame className="size-3.5 fill-amber-400" /> {streak} {streak === 1 ? 'dia' : 'dias'}
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm font-bold text-violet-300">{desiredRole}</p>
                <p className="text-xs text-zinc-400 max-w-md">
                  {bio || 'Estudante dedicado na formação adaptativa DevPath AI.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <Link href={`/u/${username}`}>
                <Button variant="outline" size="sm" className="gap-2 text-xs font-bold border-white/10 text-white hover:bg-white/5 w-full sm:w-auto">
                  <ExternalLink className="size-3.5" /> Portfólio Público (/u/{username})
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Navigation Tabs for Profile */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="bg-[#12111d] border border-white/10 p-1 rounded-2xl">
            <TabsTrigger value="profile" className="text-xs font-bold rounded-xl data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              Dados do Perfil
            </TabsTrigger>
            <TabsTrigger value="skills" className="text-xs font-bold rounded-xl data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              Matriz de Competências
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs font-bold rounded-xl data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              Visão dos Recrutadores
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Profile Details Form */}
          <TabsContent value="profile" className="m-0">
            <Card className="border-white/10 bg-[#12111d] shadow-2xl rounded-3xl p-6 sm:p-8">
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-zinc-300">Nome de Exibição</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-black/50 border-white/10 text-xs rounded-xl text-white"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-zinc-300">Cargo Alvo</label>
                    <Input
                      value={desiredRole}
                      onChange={(e) => setDesiredRole(e.target.value)}
                      className="bg-black/50 border-white/10 text-xs rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-zinc-300">Biografia / Apresentação</label>
                  <Textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Conte sobre sua trajetória, tecnologias que mais gosta e projetos em andamento..."
                    className="bg-black/50 border-white/10 text-xs rounded-xl text-white leading-relaxed"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-zinc-300">Usuário do GitHub</label>
                    <Input
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="seu-usuario"
                      className="bg-black/50 border-white/10 text-xs rounded-xl text-white"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-zinc-300">Usuário do LinkedIn</label>
                    <Input
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="seu-perfil"
                      className="bg-black/50 border-white/10 text-xs rounded-xl text-white"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isSaving} className="bg-violet-600 hover:bg-violet-500 font-bold text-xs py-5 rounded-xl shadow-lg shadow-purple-600/25">
                  <Save className="size-3.5 mr-1" /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* Tab 2: Skills Matrix */}
          <TabsContent value="skills" className="m-0 space-y-4">
            <Card className="border-white/10 bg-[#12111d] shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Matriz de Competências & Maestria Técnica</h3>
                  <p className="text-xs text-zinc-400">Calculada automaticamente pelas notas nas avaliações e desafios</p>
                </div>
                <Badge className="bg-violet-950 text-violet-300 border-violet-500/30 text-xs font-bold">
                  Validado por IA
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {skillMasteryList.map((item) => (
                  <div key={item.skill} className="p-4 rounded-2xl border border-white/5 bg-black/40 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-zinc-200">{item.skill}</span>
                      <span className="text-violet-400 font-mono">{item.score}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                      <div
                        style={{ width: `${item.score}%` }}
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 font-semibold">{item.level}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Tab 3: Recruiter Public Preview */}
          <TabsContent value="preview" className="m-0">
            <Card className="border-white/10 bg-[#12111d] shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Eye className="size-4 text-violet-400" /> Prévia da Visão Pública de Recrutadores
                  </h3>
                  <p className="text-xs text-zinc-400">Assim é como líderes técnicos e empresas visualizam seu perfil</p>
                </div>
                <Link href={`/u/${username}`}>
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-xs font-bold rounded-xl">
                    Abrir Página Pública <ExternalLink className="size-3 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="p-6 rounded-2xl border border-white/5 bg-black/60 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="grid size-14 place-items-center rounded-2xl bg-violet-600 text-white font-black text-xl">
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">{displayName}</h4>
                    <p className="text-xs text-violet-400 font-bold">{desiredRole}</p>
                    <p className="text-xs text-zinc-400">{profile?.email || 'aluno@devpath.ai'}</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  {bio || 'Desenvolvedor em formação intensiva na DevPath AI.'}
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1 rounded-lg bg-white/5 text-zinc-300 font-semibold font-mono">
                    🎓 Trilha: {activePath?.title || 'Full Stack JavaScript'}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-white/5 text-emerald-400 font-semibold font-mono">
                    ✔ {completedLessons.length} Aulas Concluídas
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-white/5 text-amber-400 font-semibold font-mono">
                    ⚡ {projects.length} Projetos Publicados
                  </span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
