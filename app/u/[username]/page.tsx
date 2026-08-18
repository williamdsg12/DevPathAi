'use client'

import { use } from 'react'
import Link from 'next/link'
import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  Code2,
  ExternalLink,
  Flame,
  FolderGit2,
  Globe,
  GraduationCap,
  MapPin,
  Mic,
  School,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import {
  GithubIcon,
  LinkedinIcon,
  YoutubeIcon,
  TwitterIcon,
  InstagramIcon,
} from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/logo'
import { useAppStore } from '@/lib/store'

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params)
  const username = resolvedParams.username
  const {
    profile,
    professionalExperiences,
    educationalBackgrounds,
    portfolioProjects,
    userEvents,
    userCertificates,
    certificates: platformCerts,
    userTechnologies,
    xp,
    level,
    streak,
  } = useAppStore()

  const displayName = profile?.name || 'William'
  const initials = displayName.slice(0, 2).toUpperCase()
  const bio = profile?.bio || 'Desenvolvedor em constante evolução, construindo produtos modernos com React, Next.js, Node.js e inteligência artificial.'
  const desiredRole = profile?.desiredRole || 'Desenvolvedor Full Stack Júnior'
  const socials = profile?.socialLinks || {}

  function formatDisplayDate(dateStr?: string) {
    if (!dateStr) return ''
    const [year, month] = dateStr.split('-')
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${months[parseInt(month, 10) - 1] || ''} ${year}`
  }

  return (
    <div className="min-h-screen bg-[#07060b] text-white flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07060b]/80 backdrop-blur-xl px-4 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/cadastro">
              <Button
                size="sm"
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs px-4 rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                Criar Minha Trilha na DevPath AI
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-10 px-4 py-10 sm:px-8">
        {/* Profile Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#131121] via-[#0e0d18] to-[#08070d] p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 size-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-80 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* Avatar */}
              <div className="size-28 sm:size-32 rounded-full overflow-hidden border-4 border-cyan-500/50 bg-gradient-to-br from-violet-900 to-indigo-950 shadow-2xl shadow-cyan-950/50 flex items-center justify-center shrink-0">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={displayName}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="text-4xl font-black text-white">{initials}</div>
                )}
              </div>

              {/* Bio & Details */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {displayName}
                  </h1>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold text-xs">
                    Nível {level}
                  </Badge>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold text-xs gap-1">
                    <UserCheck className="size-3" /> Dev Verificado
                  </Badge>
                </div>

                <p className="text-sm font-bold text-cyan-400">{desiredRole}</p>

                <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
                  {bio}
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-400 font-mono">
                  <span className="flex items-center gap-1 text-zinc-300">
                    <MapPin className="size-3.5 text-cyan-400" />
                    {profile?.locationType === 'exterior' ? 'Exterior' : 'Brasil'}
                  </span>
                  <span>•</span>
                  <span>{xp.toLocaleString('pt-BR')} XP DevPath AI</span>
                  {streak > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-amber-400 flex items-center gap-1">
                        <Flame className="size-3.5 fill-amber-400" /> {streak} dias seguidos
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Social Links Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 shrink-0">
              {socials.github && (
                <a href={socials.github.startsWith('http') ? socials.github : `https://github.com/${socials.github}`} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white text-xs font-bold gap-1.5 rounded-xl">
                    <GithubIcon className="size-3.5" /> GitHub
                  </Button>
                </a>
              )}

              {socials.linkedin && (
                <a href={socials.linkedin} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="border-cyan-500/30 bg-cyan-950/20 text-cyan-300 hover:bg-cyan-950/40 text-xs font-bold gap-1.5 rounded-xl">
                    <LinkedinIcon className="size-3.5 text-blue-400" /> LinkedIn
                  </Button>
                </a>
              )}

              {socials.blog && (
                <a href={socials.blog} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white text-xs font-bold gap-1.5 rounded-xl">
                    <Globe className="size-3.5 text-emerald-400" /> Website
                  </Button>
                </a>
              )}

              {socials.youtube && (
                <a href={socials.youtube} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white text-xs font-bold gap-1.5 rounded-xl">
                    <YoutubeIcon className="size-3.5 text-red-500" /> YouTube
                  </Button>
                </a>
              )}

              {socials.twitter && (
                <a href={socials.twitter} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white text-xs font-bold gap-1.5 rounded-xl">
                    <TwitterIcon className="size-3.5 text-sky-400" /> X / Twitter
                  </Button>
                </a>
              )}

              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white text-xs font-bold gap-1.5 rounded-xl">
                    <InstagramIcon className="size-3.5 text-pink-400" /> Instagram
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Section: Matriz de Tecnologias */}
        {userTechnologies.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Code2 className="size-5 text-cyan-400" /> Stacks & Competências Técnicas
            </h2>

            <div className="flex flex-wrap gap-2.5">
              {userTechnologies.map((tech) => (
                <div
                  key={tech.id}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0f0e18] px-3.5 py-2 text-xs font-semibold text-white shadow-sm"
                >
                  <span>{tech.name}</span>
                  {tech.proficiencyLevel && (
                    <Badge
                      variant="outline"
                      className="border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-[10px] font-bold"
                    >
                      {tech.proficiencyLevel}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Projetos em Destaque */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <FolderGit2 className="size-5 text-cyan-400" /> Projetos do Portfólio ({portfolioProjects.length})
            </h2>
          </div>

          {portfolioProjects.length === 0 ? (
            <Card className="border-white/10 bg-[#0e0d16] p-8 text-center text-zinc-400">
              <p className="text-xs">Nenhum projeto público cadastrado no momento.</p>
            </Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {portfolioProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-3xl border border-white/10 bg-[#0f0e18] p-6 flex flex-col justify-between gap-5 hover:border-cyan-500/40 transition-all hover:shadow-xl hover:shadow-cyan-950/20"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold border-cyan-500/30 text-cyan-300 bg-cyan-950/30"
                      >
                        {proj.status}
                      </Badge>
                      <span className="text-[10px] font-mono text-zinc-500">{proj.date}</span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{proj.title}</h3>
                      <p className="text-xs text-zinc-400 line-clamp-3 mt-1.5 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.technologies.map((t, i) => (
                        <span
                          key={i}
                          className="rounded-md border border-white/5 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono font-semibold text-zinc-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                    {proj.repositoryUrl && (
                      <a href={proj.repositoryUrl} target="_blank" rel="noreferrer" className="flex-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full text-xs font-bold gap-1.5 border-white/10 bg-white/[0.02] text-zinc-300 hover:text-white"
                        >
                          <Github className="size-3.5" /> Código
                        </Button>
                      </a>
                    )}

                    {proj.projectUrl && (
                      <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="flex-1">
                        <Button
                          type="button"
                          size="sm"
                          className="w-full text-xs font-bold gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20"
                        >
                          <ExternalLink className="size-3.5" /> Ver Demo
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Experiência Profissional */}
        {professionalExperiences.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Briefcase className="size-5 text-cyan-400" /> Experiência Profissional
            </h2>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
              {professionalExperiences.map((exp) => (
                <div key={exp.id} className="relative group space-y-2">
                  <div className="absolute -left-[27px] top-1 size-3.5 rounded-full border-2 border-cyan-400 bg-[#07060b]" />

                  <div className="rounded-2xl border border-white/5 bg-[#0e0d16] p-5 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="text-base font-bold text-white">{exp.role}</h3>
                      <span className="text-xs text-zinc-400 font-mono">
                        {formatDisplayDate(exp.startDate)} até {exp.isCurrent ? 'o momento' : formatDisplayDate(exp.endDate)}
                      </span>
                    </div>

                    <p className="text-xs text-cyan-300 font-semibold flex items-center gap-1.5">
                      <Building2 className="size-3.5" /> {exp.company}
                    </p>

                    {exp.description && (
                      <p className="text-xs text-zinc-400 leading-relaxed pt-1 whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Formação Educacional */}
        {educationalBackgrounds.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <GraduationCap className="size-5 text-cyan-400" /> Formação Educacional
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {educationalBackgrounds.map((edu) => (
                <div key={edu.id} className="rounded-2xl border border-white/5 bg-[#0e0d16] p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-violet-950/80 border border-violet-500/40 text-violet-300 font-bold text-[10px]">
                      {edu.level}
                    </Badge>
                    <span className="text-[11px] text-zinc-400 font-mono">{edu.status}</span>
                  </div>

                  <h3 className="text-base font-bold text-white">{edu.course}</h3>
                  <p className="text-xs text-cyan-300 font-semibold flex items-center gap-1">
                    <School className="size-3.5" /> {edu.institution}
                  </p>

                  <div className="text-xs text-zinc-400 font-mono pt-1">
                    {formatDisplayDate(edu.startDate)} — {edu.endDate ? formatDisplayDate(edu.endDate) : 'Atual'}
                  </div>

                  {edu.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed pt-1">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Certificados Oficiais e Validações */}
        {(platformCerts.length > 0 || userCertificates.length > 0) && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Award className="size-5 text-cyan-400" /> Certificados & Validações
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {platformCerts.map((cert) => (
                <div
                  key={cert.id}
                  className="rounded-2xl border border-cyan-500/40 bg-cyan-950/20 p-5 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-cyan-500 text-black font-black text-[10px]">
                        Oficial DevPath AI
                      </Badge>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {cert.verificationCode}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{cert.trackTitle}</h3>
                    <p className="text-xs text-cyan-300 font-semibold">
                      Carga Horária: {cert.totalHours}h • Emitido em {cert.issuedAt}
                    </p>
                  </div>
                </div>
              ))}

              {userCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="rounded-2xl border border-white/5 bg-[#0e0d16] p-5 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <Badge variant="outline" className="border-white/10 text-zinc-300 text-[10px]">
                      {cert.institution}
                    </Badge>
                    <h3 className="text-base font-bold text-white">{cert.name}</h3>
                    <p className="text-xs text-zinc-400 font-mono">Emitido em {cert.issueDate}</p>
                  </div>

                  {cert.validationUrl && (
                    <a
                      href={cert.validationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-cyan-400 font-bold hover:underline flex items-center gap-1 pt-1"
                    >
                      <ExternalLink className="size-3" /> Validar certificado
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Eventos & Hackathons */}
        {userEvents.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Calendar className="size-5 text-cyan-400" /> Eventos, Hackathons & Encontros
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {userEvents.map((evt) => (
                <div key={evt.id} className="rounded-2xl border border-white/5 bg-[#0e0d16] p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                      {evt.speakerRole || 'Participante'}
                    </Badge>
                    <span className="text-[11px] text-zinc-400 font-mono">{evt.date}</span>
                  </div>

                  <h3 className="text-base font-bold text-white">{evt.title}</h3>
                  {evt.organizer && (
                    <p className="text-xs text-zinc-400 font-semibold">{evt.organizer}</p>
                  )}

                  {evt.location && (
                    <p className="text-xs text-cyan-300 flex items-center gap-1 font-mono">
                      <MapPin className="size-3" /> {evt.location}
                    </p>
                  )}

                  {evt.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed pt-1">{evt.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#07060b] px-4 py-8 text-center text-xs text-zinc-500">
        <p>
          Perfil e Portfólio Profissional gerados na plataforma{' '}
          <Link href="/" className="font-bold text-cyan-400 hover:underline">
            DevPath AI
          </Link>
          .
        </p>
      </footer>
    </div>
  )
}
