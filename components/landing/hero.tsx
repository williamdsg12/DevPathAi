import {
  ArrowRight,
  CheckCircle2,
  Lock,
  PlayCircle,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { LinkButton } from '@/components/link-button'
import { Progress } from '@/components/ui/progress'

const journey = [
  { label: 'Lógica de Programação', state: 'done' },
  { label: 'Algoritmos', state: 'done' },
  { label: 'HTML & CSS', state: 'done' },
  { label: 'JavaScript — Fundamentos', state: 'current' },
  { label: 'React & TypeScript', state: 'locked' },
  { label: 'Node.js & Banco de Dados', state: 'locked' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* subtle grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.4] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div className="flex flex-col items-start gap-6">
          <Badge variant="secondary" className="gap-1.5 rounded-full py-1 pl-1.5 pr-3">
            <span className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
              <Sparkles className="size-3" />
            </span>
            Mentoria guiada por Inteligência Artificial
          </Badge>

          <h1 className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Pare de estudar programação{' '}
            <span className="text-gradient">sem saber para onde ir.</span>
          </h1>

          <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Uma plataforma com IA que cria sua trilha personalizada, acompanha seu progresso e
            guia você do zero até sua carreira como desenvolvedor.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <LinkButton size="lg" href="/cadastro">
              Começar minha jornada
              <ArrowRight data-icon="inline-end" />
            </LinkButton>
            <LinkButton size="lg" variant="outline" href="#como-funciona">
              <PlayCircle data-icon="inline-start" />
              Conhecer a plataforma
            </LinkButton>
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-6">
            {[
              ['12+', 'Módulos guiados'],
              ['100%', 'Trilha personalizada'],
              ['24/7', 'Mentor IA'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-2xl font-bold">{value}</dt>
                <dd className="text-sm text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Composed product preview: the journey map */}
        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/10 blur-2xl" aria-hidden />
          <div className="rounded-2xl border border-border bg-card p-5 shadow-2xl shadow-primary/5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Sua trilha</p>
                <p className="font-display font-semibold">Full Stack JavaScript</p>
              </div>
              <Badge className="bg-success/15 text-success">72% concluído</Badge>
            </div>
            <Progress value={72} className="mb-5" />
            <ol className="flex flex-col gap-2.5">
              {journey.map((step) => (
                <li
                  key={step.label}
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/60 px-3 py-2.5"
                  data-current={step.state === 'current'}
                >
                  {step.state === 'done' && <CheckCircle2 className="size-5 text-success" />}
                  {step.state === 'current' && (
                    <span className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                      <PlayCircle className="size-4" />
                    </span>
                  )}
                  {step.state === 'locked' && <Lock className="size-5 text-muted-foreground" />}
                  <span
                    className={
                      step.state === 'locked'
                        ? 'text-sm text-muted-foreground'
                        : 'text-sm font-medium'
                    }
                  >
                    {step.label}
                  </span>
                  {step.state === 'current' && (
                    <Badge variant="secondary" className="ml-auto">
                      Agora
                    </Badge>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
