'use client'

import { use } from 'react'
import Link from 'next/link'
import {
  Award,
  CheckCircle2,
  ExternalLink,
  FolderGit2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/logo'
import { GithubIcon, LinkedinIcon } from '@/components/icons'
import { useAppStore } from '@/lib/store'
import { getIcon } from '@/lib/module-icons'

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params)
  const username = resolvedParams.username
  const { profile, projects, achievements, xp, level, certificates } = useAppStore()

  const displayName = profile?.name || username
  const bio = profile?.bio || 'Desenvolvedor em formação contínua no DevPath AI.'
  const role = profile?.desiredRole || 'Desenvolvedor em Formação'
  const unlockedAchievements = achievements.filter((a) => a.unlocked)

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between pb-6 border-b border-border/80">
        <Link href="/">
          <Logo />
        </Link>
        <Link href="/cadastro">
          <Button size="sm" className="font-bold text-xs shadow-md shadow-primary/20">
            Criar Minha Trilha DevPath AI
          </Button>
        </Link>
      </header>

      {/* Main Profile Showcase */}
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 py-8">
        {/* Profile Identity Card */}
        <Card className="border-border/80 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 sm:p-8 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="grid size-20 place-items-center rounded-3xl bg-primary text-primary-foreground text-3xl font-black shadow-xl shadow-primary/30">
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black text-foreground">{displayName}</h1>
                    <Badge className="bg-primary text-primary-foreground text-xs font-bold">
                      Nível {level}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground mt-0.5">{role}</p>
                  <p className="text-xs text-primary font-bold mt-1">
                    {xp.toLocaleString('pt-BR')} XP • DevPath AI Verified
                  </p>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-2">
                {profile?.github ? (
                  <a href={`https://github.com/${profile.github}`} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
                      <GithubIcon className="size-4" /> GitHub
                    </Button>
                  </a>
                ) : null}

                {profile?.linkedin ? (
                  <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold text-blue-500">
                      <LinkedinIcon className="size-4" /> LinkedIn
                    </Button>
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Sobre o Desenvolvedor
              </h3>
              <p className="text-sm text-foreground/90 leading-relaxed">{bio}</p>
            </div>
          </CardContent>
        </Card>

        {/* Public Projects Showcase */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Projetos em Destaque</h2>
            <span className="text-xs text-muted-foreground">{projects.length} projetos</span>
          </div>

          {projects.length === 0 ? (
            <Card className="border-dashed border-border/80 p-8 text-center space-y-2">
              <FolderGit2 className="size-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-semibold text-foreground">Nenhum projeto publicado ainda</p>
              <p className="text-xs text-muted-foreground">
                Projetos desenvolvidos no Code Lab e submetidos nos módulos aparecerão aqui.
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {projects.map((proj) => (
                <Card key={proj.id} className="border-border/80 shadow-md flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold">{proj.title}</CardTitle>
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                        {proj.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs line-clamp-2 mt-1">
                      {proj.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    <div className="flex flex-wrap gap-1.5">
                      {proj.tech.map((t) => (
                        <span key={t} className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                      {proj.github ? (
                        <a href={proj.github} target="_blank" rel="noreferrer" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                            <GithubIcon className="size-3.5" /> Código
                          </Button>
                        </a>
                      ) : null}

                      {proj.deploy ? (
                        <a href={proj.deploy} target="_blank" rel="noreferrer" className="flex-1">
                          <Button size="sm" className="w-full text-xs gap-1.5">
                            <ExternalLink className="size-3.5" /> Deploy Online
                          </Button>
                        </a>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Gamified Achievements Showcase */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Conquistas Validadas</h2>
          {unlockedAchievements.length === 0 ? (
            <Card className="border-dashed border-border/80 p-8 text-center space-y-2">
              <Trophy className="size-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-semibold text-foreground">Nenhuma conquista desbloqueada ainda</p>
              <p className="text-xs text-muted-foreground">
                Badges de consistência, projetos e desafios concluídos serão exibidos aqui.
              </p>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              {unlockedAchievements.map((ach) => {
                const Icon = getIcon(ach.icon)
                return (
                  <div key={ach.id} className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-foreground">{ach.title}</p>
                      <p className="text-[11px] text-muted-foreground">{ach.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-4xl pt-6 text-center text-xs text-muted-foreground border-t border-border/60">
        Perfil público verificado • DevPath AI — Formação Inteligente de Desenvolvedores.
      </footer>
    </div>
  )
}
