'use client'

import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Code2,
  FileText,
  Globe,
  GraduationCap,
  MessageSquare,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GithubIcon, LinkedinIcon } from '@/components/icons'

export default function CareerPage() {
  return (
    <AppShell
      title="Aceleração de Carreira & Portfólio"
      subtitle="Guia completo para conquistar sua primeira vaga como desenvolvedor de software"
    >
      <div className="space-y-8">
        {/* Main CTA: AI Technical Interview Simulator */}
        <section className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/15 via-card to-card p-6 sm:p-8 shadow-xl shadow-primary/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge className="bg-primary text-primary-foreground font-bold gap-1.5">
              <Sparkles className="size-3.5" /> Simulador de Entrevistas com IA
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Treine para Entrevistas Técnicas Reais
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              Responda perguntas técnicas e comportamentais formuladas pela IA para vagas de Frontend, Backend e Full Stack Júnior e receba um relatório completo com sua nota e pontos a melhorar.
            </p>
          </div>

          <Link href="/carreira/entrevista">
            <Button size="lg" className="gap-2 font-bold shadow-xl shadow-primary/25 py-6 px-8 rounded-2xl shrink-0">
              Iniciar Simulação <ArrowRight className="size-5" />
            </Button>
          </Link>
        </section>

        {/* 4 Pillars of Career Preparation Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* 1. GitHub Checklist */}
          <Card className="border-border/80 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <GithubIcon className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">GitHub Campeão</CardTitle>
                  <CardDescription className="text-xs">Como destacar seus repositórios para recrutadores</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {[
                'README com prints, descrição do problema e instruções de instalação',
                'Commits descritivos em português ou inglês seguindo boas práticas',
                'Pinned repositories com seus 3 melhores projetos full stack',
                'README de perfil com links de contato e tecnologias dominadas',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-2.5">
                  <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 2. LinkedIn Estratégico */}
          <Card className="border-border/80 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
                  <LinkedinIcon className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">LinkedIn Estratégico</CardTitle>
                  <CardDescription className="text-xs">Atraia mensagens de recrutadores e Tech Recruiters</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {[
                'Título profissional focado: "Desenvolvedor Full Stack Júnior | React | Node | TypeScript"',
                'Seção Sobre contando sua trajetória, projetos e tecnologias de foco',
                'Publicação periódica sobre o que você aprendeu e projetos concluídos',
                'Conexão com desenvolvedores sêniores e tech recruiters',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-2.5">
                  <CheckCircle2 className="size-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 3. Currículo Tech Direto ao Ponto */}
          <Card className="border-border/80 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Currículo Tech</CardTitle>
                  <CardDescription className="text-xs">Formato ideal para passar pelos filtros ATS</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {[
                '1 página no máximo, limpa e sem gráficos de barras de habilidades',
                'Links diretos para seu GitHub, LinkedIn e Deploy dos projetos',
                'Destaque para projetos práticos com descrição técnica das ferramentas',
                'Seção de tecnologias dominadas no topo do documento',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-2.5">
                  <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 4. Inglês Técnico para Desenvolvedores */}
          <Card className="border-border/80 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-purple-500/10 text-purple-500">
                  <Globe className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Inglês Técnico</CardTitle>
                  <CardDescription className="text-xs">Termos fundamentais para documentações e vagas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {[
                'Bug, Feature, Pull Request, Merge, Refactoring, Deploy, Pipeline',
                'State Management, Middleware, Endpoint, Payload, Cache, Query',
                'Scope, Hoisting, Closure, Asynchronous, Promise, Event Loop',
                'Leitura fluida de documentações oficiais (MDN, React Docs)',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-2.5">
                  <CheckCircle2 className="size-4 text-purple-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
