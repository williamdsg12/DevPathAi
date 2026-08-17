'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Plano Gratuito',
    price: 'R$ 0',
    period: 'para sempre',
    desc: 'Ideal para quem quer conhecer a metodologia e iniciar na lógica de programação.',
    badge: 'Acesso Inicial',
    recommended: false,
    features: [
      'Teste de nivelamento por IA',
      'Acesso aos módulos fundamentais',
      'Code Lab com execuções básicas',
      'Comunidade de desenvolvedores',
      'Suporte básico',
    ],
    cta: 'Criar conta gratuita',
    href: '/cadastro',
  },
  {
    name: 'Plano Pro Carreira',
    price: 'R$ 39',
    period: '/ mês (anual)',
    desc: 'A experiência completa: trilha adaptativa, DevMentor 24/7 ilimitado e preparação profissional.',
    badge: 'Recomendado',
    recommended: true,
    features: [
      'Trilha adaptativa 100% personalizada',
      'DevMentor AI ilimitado 24/7 com dicas progressivas',
      'Code Lab avançado com testes unitários',
      'Avaliação de projetos no GitHub por rubrica da IA',
      'Planos de recuperação automáticos',
      'Simulador de entrevistas técnicas com IA',
      'Certificados oficiais com validação pública por QR Code',
    ],
    cta: 'Começar com Plano Pro',
    href: '/cadastro',
  },
]

export function PricingPlansSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 30,
  })

  return (
    <section ref={sectionRef} id="planos" className="py-24 sm:py-32 border-t border-white/5 bg-[#0d0c14]/80 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3.5 text-center">
          <Badge className="bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-bold gap-1.5 px-3 py-1">
            <Zap className="size-3 text-violet-400" /> Planos de Acesso
          </Badge>
          <h2 className="text-balance font-sans text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Invista na sua carreira com valor acessível
          </h2>
          <p className="text-pretty text-base sm:text-lg text-zinc-400 font-medium leading-relaxed max-w-2xl">
            Comece gratuitamente e evolua para a mentoria com IA completa quando estiver pronto para acelerar sua contratação.
          </p>
        </div>

        <div className="grid gap-8 max-w-4xl mx-auto md:grid-cols-2 items-stretch">
          {plans.map((p, i) => {
            const start = 0.15 + (i * 0.1)
            const end = start + 0.25
            const cardY = useTransform(smoothProgress, [start, end], [40, 0])
            const cardOpacity = useTransform(smoothProgress, [start, end], [0, 1])

            return (
              <motion.div
                key={p.name}
                style={{
                  y: cardY,
                  opacity: cardOpacity,
                }}
                className="h-full flex flex-col"
              >
                <Card
                  className={`h-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                    p.recommended
                      ? 'border-violet-500/60 bg-gradient-to-b from-[#18142a] via-[#121020] to-[#0d0c16] shadow-2xl shadow-purple-950/50 ring-1 ring-violet-500/30'
                      : 'border-white/10 bg-[#12111a] shadow-lg'
                  }`}
                >
                  {p.recommended && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-violet-600 to-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider py-1 px-4 rounded-bl-xl shadow-md">
                      Mais Escolhido
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          p.recommended
                            ? 'text-violet-300 border-violet-500/40 bg-violet-950/40'
                            : 'text-zinc-400 border-white/10'
                        }`}
                      >
                        {p.badge}
                      </Badge>
                      <h3 className="text-xl font-black text-white">{p.name}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">{p.desc}</p>
                    </div>

                    <div className="flex items-baseline gap-1.5 pt-2 border-t border-white/5">
                      <span className="font-mono text-4xl sm:text-5xl font-black text-white">{p.price}</span>
                      <span className="text-xs text-zinc-400 font-medium">{p.period}</span>
                    </div>

                    <ul className="space-y-2.5 pt-2 text-xs">
                      {p.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5 text-zinc-300 leading-snug">
                          <CheckCircle2
                            className={`size-4 shrink-0 mt-0.5 ${
                              p.recommended ? 'text-violet-400' : 'text-emerald-400'
                            }`}
                          />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8 mt-auto">
                    <Button
                      asChild
                      size="lg"
                      className={`w-full font-bold rounded-2xl py-6 text-xs sm:text-sm shadow-md transition-all ${
                        p.recommended
                          ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/30'
                          : 'bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/10'
                      }`}
                    >
                      <Link href={p.href}>
                        <span>{p.cta}</span>
                        <ArrowRight className="size-4 ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default PricingPlansSection
