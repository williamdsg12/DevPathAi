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
  } = useAppStore()

  const [name, setName] = useState(profile?.name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [github, setGithub] = useState(profile?.github || '')
  const [linkedin, setLinkedin] = useState(profile?.linkedin || '')
  const [desiredRole, setDesiredRole] = useState(
    profile?.desiredRole || 'Desenvolvedor Full Stack Júnior'
  )
  const [isSaving, setIsSaving] = useState(false)

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
      toast.success('Perfil atualizado com sucesso!')
    }, 400)
  }

  const displayName = name || profile?.name || 'Desenvolvedor'
  const username = github || 'dev'
  const currentMod = allModules.find((m) => m.id === currentModuleId) || allModules[0]
  const currentMastery = getModuleMastery(currentMod?.id || 'mod-logica')

  // Default fallback skills if none recorded yet
  const skillMasteryMap = activePath.skillMastery || {
    'Lógica de Programação': 60,
    'Algoritmos & Estruturas': 45,
    'Git & GitHub': 40,
    'HTML5 Semântico': 35,
    'CSS3 & Layouts': 30,
    'JavaScript Moderno': 25,
    'React & Next.js': 10,
    'Node.js & APIs': 10,
    'Banco de Dados & SQL': 15,
    'Arquitetura de Software': 10,
  }

  return (
    <AppShell
      title="Meu Perfil Profissional"
      subtitle="Gerencie suas competências técnicas, histórico de formação, projetos e certificações"
    >
      <div className="space-y-8">
        {/* Profile Hero Header */}
        <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-card p-6 sm:p-8 shadow-xl shadow-primary/5">
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="grid size-20 place-items-center rounded-3xl bg-primary text-primary-foreground text-3xl font-black shadow-xl shadow-primary/30 ring-4 ring-primary/20">
                {displayName.slice(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground">{displayName}</h1>
                  <Badge className="bg-primary text-primary-foreground text-xs font-bold">
                    Nível {level}
                  </Badge>
                  <Badge variant="secondary" className="gap-1 font-semibold text-xs text-warning">
                    <Flame className="size-3.5 fill-warning" /> {streak} {streak === 1 ? 'dia' : 'dias'}
                  </Badge>
                </div>

                <p className="text-sm font-semibold text-primary">{desiredRole}</p>
                <p className="text-xs text-muted-foreground max-w-md">
                  {bio || 'Estudante dedicado na formação adaptativa DevPath AI.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <Link href={`/u/${username}`}>
                <Button variant="outline" size="sm" className="gap-2 text-xs font-bold w-full sm:w-auto">
                  <ExternalLink className="size-3.5" /> Portfólio Público (/u/{username})
                </Button>
              </Link>
              <Link href="/trilha">
                <Button size="sm" className="gap-2 text-xs font-bold bg-primary text-primary-foreground shadow-md shadow-primary/20 w-full sm:w-auto">
                  <Layers className="size-3.5" /> Minha Trilha
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 4 Summary Metric Indicators */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Card className="border-border/70">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progresso da Trilha</span>
              <GraduationCap className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">{overallProgress}%</div>
              <Progress value={overallProgress} className="h-1.5 mt-2" />
              <p className="text-[11px] text-muted-foreground mt-2">{activePath.title}</p>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mastery do Módulo</span>
              <Brain className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">{currentMastery.totalMastery}%</div>
              <Progress value={currentMastery.totalMastery} className="h-1.5 mt-2" />
              <p className="text-[11px] text-muted-foreground mt-2 capitalize">{currentMastery.statusLabel.replace('_', ' ')}</p>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tempo Dedicado</span>
              <Clock className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">{Math.round(studiedMinutes / 60)}h <span className="text-sm font-semibold text-muted-foreground">{studiedMinutes % 60}m</span></div>
              <p className="text-[11px] text-muted-foreground mt-2">Horas reais de estudo registradas</p>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total XP & Projetos</span>
              <Trophy className="size-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">{xp.toLocaleString('pt-BR')} <span className="text-sm font-semibold text-muted-foreground">XP</span></div>
              <p className="text-[11px] text-muted-foreground mt-2">{projects.length} projetos entregues</p>
            </CardContent>
          </Card>
        </section>

        {/* Tabbed Workspace: Skills, Journey, Projects, Certificates, Edit */}
        <Tabs defaultValue="skills" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto p-1 bg-muted/40 rounded-2xl border border-border/60">
            <TabsTrigger value="skills" className="py-2.5 text-xs font-bold rounded-xl">
              🎯 Habilidades & Skills
            </TabsTrigger>
            <TabsTrigger value="journey" className="py-2.5 text-xs font-bold rounded-xl">
              🗺️ Minha Jornada
            </TabsTrigger>
            <TabsTrigger value="projects" className="py-2.5 text-xs font-bold rounded-xl">
              💻 Meus Projetos ({projects.length})
            </TabsTrigger>
            <TabsTrigger value="certificates" className="py-2.5 text-xs font-bold rounded-xl">
              📜 Certificados ({certificates.length})
            </TabsTrigger>
            <TabsTrigger value="edit" className="py-2.5 text-xs font-bold rounded-xl">
              ⚙️ Dados Pessoais
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Skills & Competencies */}
          <TabsContent value="skills" className="space-y-6">
            <Card className="border-border/80 shadow-lg shadow-primary/5">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Target className="size-5 text-primary" /> Matriz de Competências & Habilidades Técnicas
                </CardTitle>
                <CardDescription className="text-xs">
                  Seu índice de domínio é recalculado continuamente conforme você assiste aulas, resolve exercícios e passa nas avaliações.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {Object.entries(skillMasteryMap).map(([skill, val]) => (
                  <div key={skill} className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-foreground">{skill}</span>
                      <span className="text-primary">{val}%</span>
                    </div>
                    <Progress value={val} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Journey & Active Learning Path */}
          <TabsContent value="journey" className="space-y-6">
            <Card className="border-border/80 shadow-lg shadow-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold">{activePath.title}</CardTitle>
                    <CardDescription className="text-xs">{activePath.description}</CardDescription>
                  </div>
                  <Link href="/trilha">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                      Ver Mapa Completo <ArrowRight className="size-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentMod ? (
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-primary">Módulo Ativo no Momento</span>
                      <h3 className="text-base font-bold text-foreground">{currentMod.title}</h3>
                      <p className="text-xs text-muted-foreground">{currentMod.description}</p>
                    </div>
                    <Link href={currentMod.lessonIds[0] ? `/aulas/${currentMod.lessonIds[0]}` : '/cursos'}>
                      <Button size="sm" className="gap-2 font-bold text-xs bg-primary text-primary-foreground shadow-md shadow-primary/20">
                        Continuar Módulo <ArrowRight className="size-3.5" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed p-6 text-center text-xs text-muted-foreground space-y-2">
                    <p>Nenhum módulo ativo no momento.</p>
                    <Link href="/cursos">
                      <Button size="sm" variant="outline" className="text-xs font-bold">
                        Explorar Catálogo de Cursos
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Projects & Portfolio */}
          <TabsContent value="projects" className="space-y-6">
            <Card className="border-border/80 shadow-lg shadow-primary/5">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <FolderGit2 className="size-5 text-primary" /> Projetos Reais do Portfólio
                  </CardTitle>
                  <CardDescription className="text-xs">Aplicações que compõem sua experiência profissional prática.</CardDescription>
                </div>
                <Link href="/projetos">
                  <Button size="sm" className="gap-1.5 text-xs font-bold">
                    + Novo Projeto
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-10 space-y-3 bg-muted/20 rounded-2xl border border-dashed border-border/80">
                    <Code2 className="size-10 text-muted-foreground mx-auto" />
                    <h4 className="text-sm font-bold text-foreground">Nenhum projeto entregue ainda</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Conforme você avançar nos módulos com projetos obrigatórios (Landing Pages, APIs, SPAs), suas entregas aparecerão aqui.
                    </p>
                    <Link href="/projetos">
                      <Button variant="outline" size="sm" className="text-xs">
                        Acessar Área de Projetos
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {projects.map((p) => (
                      <div key={p.id} className="rounded-2xl border border-border bg-card p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-bold text-foreground">{p.title}</h4>
                          <Badge variant="secondary" className="text-[10px] capitalize font-bold">
                            {p.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {p.tech.map((t) => (
                            <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold">
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                          {p.github && (
                            <a href={p.github} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold">
                              <GithubIcon className="size-3.5" /> GitHub
                            </a>
                          )}
                          {p.deploy && (
                            <a href={p.deploy} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold ml-auto">
                              <ExternalLink className="size-3.5" /> Demonstração
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: Certificates */}
          <TabsContent value="certificates" className="space-y-6">
            <Card className="border-border/80 shadow-lg shadow-primary/5">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <ShieldCheck className="size-5 text-success" /> Certificados de Formação Emitidos
                  </CardTitle>
                  <CardDescription className="text-xs">Certificados válidos com assinatura e hash criptográfico de autenticidade.</CardDescription>
                </div>
                <Link href="/certificados">
                  <Button size="sm" variant="outline" className="text-xs">
                    Ver Certificações
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {certificates.length === 0 ? (
                  <div className="text-center py-10 space-y-3 bg-muted/20 rounded-2xl border border-dashed border-border/80">
                    <Award className="size-10 text-muted-foreground mx-auto" />
                    <h4 className="text-sm font-bold text-foreground">Nenhum certificado emitido ainda</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Conclua 100% da sua trilha formativa com aproveitamento mínimo de 70% nas avaliações para desbloquear seu certificado oficial.
                    </p>
                    <Link href="/trilha">
                      <Button size="sm" className="text-xs">
                        Continuar Minha Trilha
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {certificates.map((c) => (
                      <div key={c.id} className="rounded-2xl border border-primary/20 bg-card p-5 space-y-2">
                        <Badge className="bg-success text-success-foreground text-[10px] font-bold">Oficial</Badge>
                        <h4 className="text-sm font-bold text-foreground">{c.pathTitle}</h4>
                        <p className="text-xs text-muted-foreground">Emitido em: {c.completionDate} • Carga Horária: {c.hours}h</p>
                        <p className="text-[11px] font-mono text-primary font-bold">Hash: {c.validationCode}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: Edit Personal Data */}
          <TabsContent value="edit" className="space-y-6">
            <Card className="border-border/80 shadow-lg shadow-primary/5">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <User className="size-5 text-primary" /> Editar Dados do Perfil
                </CardTitle>
                <CardDescription className="text-xs">
                  Atualize suas informações cadastrais, links profissionais e objetivos de carreira.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Nome Completo</label>
                      <Input
                        placeholder="Seu nome completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-background text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Objetivo Profissional / Cargo Desejado</label>
                      <Input
                        placeholder="Ex: Desenvolvedor Full Stack Júnior"
                        value={desiredRole}
                        onChange={(e) => setDesiredRole(e.target.value)}
                        className="bg-background text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Usuário do GitHub</label>
                      <Input
                        placeholder="Ex: seunome"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        className="bg-background text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">LinkedIn (URL ou usuário)</label>
                      <Input
                        placeholder="Ex: linkedin.com/in/seunome"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        className="bg-background text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Biografia Profissional</label>
                    <Textarea
                      rows={3}
                      placeholder="Conte um pouco sobre sua trajetória, tecnologias preferidas e metas..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="bg-background text-xs leading-relaxed"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" disabled={isSaving} className="gap-2 font-bold text-xs">
                      <Save className="size-3.5" />
                      {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
