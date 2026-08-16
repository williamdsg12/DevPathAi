import { ArrowRight, Quote, Star } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LinkButton } from '@/components/link-button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const testimonials = [
  {
    name: 'Marina Costa',
    role: 'Front-end Júnior',
    initials: 'MC',
    text: 'Finalmente parei de pular de curso em curso. A trilha me disse exatamente o que estudar e eu consegui minha primeira vaga em 7 meses.',
  },
  {
    name: 'Rafael Lima',
    role: 'Transição de carreira',
    initials: 'RL',
    text: 'O DevMentor AI explica no meu nível. Quando travo em algo, ele me faz pensar em vez de entregar a resposta. Aprendi de verdade.',
  },
  {
    name: 'Júlia Fernandes',
    role: 'Full Stack em formação',
    initials: 'JF',
    text: 'As avaliações com nota mínima me forçaram a não pular etapas. Hoje tenho uma base sólida e um portfólio real.',
  },
]

const faq = [
  {
    q: 'Preciso já saber programar?',
    a: 'Não. A DevPath AI foi feita para levar você do nível iniciante absoluto até níveis profissionais. O teste de nivelamento identifica seu ponto de partida.',
  },
  {
    q: 'Como a trilha é personalizada?',
    a: 'Após o onboarding e o teste de nivelamento, a IA monta uma árvore de aprendizado com fases, módulos e pré-requisitos de acordo com o seu objetivo, tempo e dificuldades.',
  },
  {
    q: 'Posso pular módulos que já domino?',
    a: 'Você não pode simplesmente pular. Mas se o teste comprovar seu domínio, a IA ajusta a trilha e reduz reforços. A progressão sempre valida conhecimento real.',
  },
  {
    q: 'A plataforma hospeda os vídeos?',
    a: 'A DevPath AI funciona como um orquestrador de aprendizado: usa embeds e APIs oficiais, e pode apontar conteúdos em plataformas externas, registrando seu progresso sem redistribuir material protegido.',
  },
  {
    q: 'O que acontece se eu for mal em uma avaliação?',
    a: 'Nada de "reprovado". A IA analisa seus erros e gera um plano de reforço com aulas complementares, exercícios extras e uma nova avaliação.',
  },
]

export function Testimonials() {
  return (
    <section id="depoimentos" className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <div className="flex gap-1 text-warning" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-5 fill-current" />
            ))}
          </div>
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Quem seguiu a trilha, chegou lá
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="h-full">
              <CardContent className="flex h-full flex-col gap-4 pt-6">
                <Quote className="size-6 text-primary/40" />
                <p className="flex-1 text-pretty leading-relaxed">{t.text}</p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{t.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Perguntas frequentes
        </h2>
        <p className="text-lg text-muted-foreground">Tudo o que você precisa saber antes de começar.</p>
      </div>
      <Accordion>
        {faq.map((item) => (
          <AccordionItem key={item.q} value={item.q}>
            <AccordionTrigger className="text-left text-base font-medium">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="leading-relaxed text-muted-foreground">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px, 60px 60px',
          }}
        />
        <h2 className="relative mx-auto max-w-2xl text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Comece hoje sua jornada rumo à carreira dev
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-pretty text-lg text-primary-foreground/80">
          Crie sua conta gratuita, faça o teste de nivelamento e receba sua trilha personalizada em minutos.
        </p>
        <div className="relative mt-8 flex justify-center">
          <LinkButton size="lg" variant="secondary" href="/cadastro">
            Começar minha jornada
            <ArrowRight data-icon="inline-end" />
          </LinkButton>
        </div>
      </div>
    </section>
  )
}
