import {
  Bot,
  Code2,
  FolderGit2,
  GraduationCap,
  ListChecks,
  Map,
  MessageSquareText,
  Repeat,
  Route,
  Trophy,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function HowItWorks() {
  const steps = [
    {
      icon: MessageSquareText,
      title: 'A IA te entrevista',
      desc: 'Um onboarding conduzido por IA entende seu nível, objetivos, tempo disponível e dificuldades.',
    },
    {
      icon: Route,
      title: 'Sua trilha é gerada',
      desc: 'Com base no teste de nivelamento, a IA monta uma árvore de aprendizado personalizada só para você.',
    },
    {
      icon: GraduationCap,
      title: 'Você evolui de verdade',
      desc: 'Aulas, exercícios, projetos e avaliações. Nada de avançar sem realmente aprender.',
    },
  ]

  return (
    <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Como funciona"
        title="Um mentor que decide o que você precisa aprender em seguida"
        description="Não é uma biblioteca de cursos. É um sistema inteligente que responde: o que eu estudo agora?"
      />
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <Card key={s.title} className="relative">
            <CardHeader>
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="size-5" />
              </span>
              <span className="absolute right-5 top-5 font-display text-3xl font-bold text-muted/60">
                {String(i + 1).padStart(2, '0')}
              </span>
              <CardTitle className="mt-3">{s.title}</CardTitle>
              <CardDescription className="leading-relaxed">{s.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}

export function Features() {
  const features = [
    {
      icon: Bot,
      title: 'DevMentor AI',
      desc: 'Um mentor contextualizado que conhece sua trilha, seu desempenho e suas dificuldades — e explica no seu nível.',
    },
    {
      icon: Map,
      title: 'Trilhas inteligentes',
      desc: 'Fases, módulos e pré-requisitos. A trilha se recalcula conforme você avança ou trava.',
    },
    {
      icon: Code2,
      title: 'Code Lab',
      desc: 'Editor de código no navegador para praticar de verdade, com análise de IA do seu código.',
    },
    {
      icon: FolderGit2,
      title: 'Projetos práticos',
      desc: 'Cada módulo tem um projeto obrigatório. Construa seu portfólio enquanto aprende.',
    },
    {
      icon: ListChecks,
      title: 'Avaliações reais',
      desc: 'Nota mínima para avançar. Se você não atinge, a IA cria um plano de reforço personalizado.',
    },
    {
      icon: Repeat,
      title: 'Revisão espaçada',
      desc: 'Revisões automáticas em intervalos crescentes para fixar de verdade o conhecimento.',
    },
    {
      icon: Trophy,
      title: 'Gamificação',
      desc: 'XP, níveis, conquistas e streak para manter a consistência dia após dia.',
    },
    {
      icon: GraduationCap,
      title: 'Preparação de carreira',
      desc: 'Portfólio, currículo, LinkedIn e simulação de entrevista técnica com IA.',
    },
  ]

  return (
    <section id="recursos" className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Recursos"
          title="Tudo o que você precisa para se tornar dev, em um só lugar"
          description="Do primeiro if até a entrevista técnica."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="h-full transition-colors hover:border-primary/40">
              <CardHeader>
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </span>
                <CardTitle className="mt-2 text-base">{f.title}</CardTitle>
                <CardDescription className="leading-relaxed">{f.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ProblemSolution() {
  return (
    <section id="trilhas" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            O problema
          </p>
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Estudar sem direção é o motivo nº 1 de desistência
          </h2>
          <ul className="flex flex-col gap-3 text-muted-foreground">
            {[
              'Cursos soltos que não conversam entre si',
              '"Tutorial hell": assistir sem nunca praticar',
              'Não saber o que estudar depois',
              'Avançar sem base e travar mais na frente',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-destructive" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Card className="border-primary/30 bg-primary/[0.03]">
          <CardHeader>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              A solução
            </p>
            <CardTitle className="font-display text-2xl">
              A DevPath AI responde por você:
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {[
                'O que eu preciso estudar agora?',
                'O que eu ainda não sei?',
                'Por que estou tendo dificuldade?',
                'Estou pronto para avançar?',
                'Quais projetos devo construir?',
                'Estou preparado para uma vaga?',
              ].map((q) => (
                <li key={q} className="flex items-center gap-3 text-sm font-medium">
                  <MessageSquareText className="size-4 shrink-0 text-primary" />
                  {q}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
      <h2 className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      <p className="text-pretty text-lg text-muted-foreground">{description}</p>
    </div>
  )
}
