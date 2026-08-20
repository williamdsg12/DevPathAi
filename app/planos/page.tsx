'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  Bot,
  Check,
  CheckCircle2,
  Code2,
  CreditCard,
  Crown,
  Flame,
  HelpCircle,
  Lock,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'

export default function PlansAndSubscriptionPage() {
  const { profile, xp, level } = useAppStore()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [selectedPlan, setSelectedPlan] = useState<string>('pro')
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'pending' | 'canceled'>('active')
  const [isProcessing, setIsProcessing] = useState(false)

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      badge: 'Iniciante',
      description: 'Ideal para quem está dando os primeiros passos na programação.',
      priceMonthly: 0,
      priceYearly: 0,
      popular: false,
      features: [
        'Acesso às primeiras aulas de cada curso',
        'Code Lab Sandbox básico',
        'Exercícios de fixação introdutórios',
        'Comunidade aberta de estudantes',
        'Acesso ao ranking geral',
      ],
      notIncluded: [
        'DevMentor AI ilimitado com contexto',
        'Projetos de módulo com avaliação da IA',
        'Certificados oficiais autenticados',
        'Simulador de entrevistas técnicas',
      ],
      ctaText: 'Plano Atual',
      ctaDisabled: true,
    },
    {
      id: 'pro',
      name: 'DevPath Pro',
      badge: 'MAIS POPULAR',
      description: 'A formação completa com IA para acelerar sua contratação como dev.',
      priceMonthly: 49.9,
      priceYearly: 34.9,
      popular: true,
      features: [
        'Acesso a 100% de todas as aulas e cursos',
        'DevMentor AI contextualizado ilimitado',
        'Correção automática de código e exercícios',
        'Avaliações com nota de corte e recuperação',
        'Projetos práticos para portfólio no GitHub',
        'Certificados oficiais verificados com QR Code',
        'Simulador de entrevistas técnicas com IA',
        'Modo Foco Pomodoro com XP dobrado',
      ],
      notIncluded: [],
      ctaText: 'Fazer Upgrade para o Pro',
      ctaDisabled: false,
    },
    {
      id: 'career',
      name: 'Carreira & Elite',
      badge: 'RECRUTAMENTO',
      description: 'Para quem busca aceleração máxima para vagas pleno/sênior e liderança.',
      priceMonthly: 89.9,
      priceYearly: 69.9,
      popular: false,
      features: [
        'Tudo do Plano Pro incluído',
        'Revisão detalhada de portfólio e GitHub por IA',
        'Simulação avançada de System Design',
        'Selo de Desenvolvedor Verificado no perfil público',
        'Acesso prioritário a novas trilhas e tecnologias',
        'Exportação de relatórios de proficiência técnica',
      ],
      notIncluded: [],
      ctaText: 'Assinar Plano Carreira',
      ctaDisabled: false,
    },
  ]

  function handleSubscribe(planId: string) {
    if (planId === 'starter') return
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setSelectedPlan(planId)
      setSubscriptionStatus('active')
      toast.success('🎉 Assinatura ativada com sucesso! Bem-vindo ao DevPath Pro.')
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } })
      } catch {}
    }, 800)
  }

  return (
    <AppShell
      title="Planos & Assinatura"
      subtitle="Escolha o plano ideal para acelerar seu aprendizado e transformar sua carreira dev"
    >
      <div className="mx-auto max-w-6xl space-y-12 pb-20">
        {/* =========================================================================
            1. STATUS DA ASSINATURA ATUAL DO USUÁRIO
           ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-950/60 via-[#121024] to-[#0a0914] p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold gap-1.5 px-3 py-0.5">
                  <CheckCircle2 className="size-3.5" /> Assinatura Ativa
                </Badge>
                <Badge variant="outline" className="text-zinc-400 border-white/10 text-xs font-mono">
                  Renovação em 19/09/2026
                </Badge>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">
                Seu Plano Atual: <span className="text-violet-400">DevPath Pro (Anual)</span>
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
                Você possui acesso irrestrito ao DevMentor AI, todas as aulas do catálogo, avaliações oficiais com certificado e Code Lab.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link href="/configuracoes">
                <Button
                  variant="outline"
                  className="text-xs font-bold rounded-xl border-white/10 text-zinc-300 hover:text-white cursor-pointer"
                >
                  <CreditCard className="size-3.5 mr-1.5" /> Gerenciar Faturamento
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. TOGGLE DE CICLO DE COBRANÇA (MENSAL / ANUAL)
           ========================================================================= */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/40 px-4 py-1.5 text-xs font-bold text-violet-300">
            <Sparkles className="size-3.5 text-violet-400" />
            Invista no seu futuro profissional
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Planos transparentes para cada etapa da sua jornada
          </h2>

          <p className="text-sm text-zinc-400 max-w-xl mx-auto font-medium">
            Sem contratos de fidelidade ou taxas escondidas. Cancele a qualquer momento com 1 clique.
          </p>

          <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-[#12111f] border border-white/10 mt-4">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Cobrança Mensal
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'yearly'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Cobrança Anual</span>
              <span className="bg-emerald-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded-md">
                -30% OFF
              </span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            3. CARDS DE PLANOS (STARTER, PRO, CAREER)
           ========================================================================= */}
        <div className="grid gap-8 lg:grid-cols-3 items-stretch">
          {plans.map((plan) => {
            const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly
            const isCurrent = (plan.id === 'pro' && subscriptionStatus === 'active') || (plan.id === 'starter' && subscriptionStatus === 'canceled')

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl transition-all duration-300 ${
                  plan.popular
                    ? 'border-violet-500/60 bg-gradient-to-b from-[#18142e] to-[#0e0c18] shadow-2xl shadow-violet-950/60 ring-2 ring-violet-500/40 lg:-translate-y-2'
                    : 'border-white/10 bg-[#100f1c] hover:border-white/20 shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black text-[10px] tracking-widest uppercase px-4 py-1 shadow-lg shadow-violet-600/40 border border-violet-400/40">
                      <Crown className="size-3 mr-1 fill-white" /> {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="space-y-4 p-6 sm:p-8">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-extrabold text-white">{plan.name}</h3>
                      {!plan.popular && plan.badge && (
                        <Badge variant="outline" className="text-[10px] font-mono text-zinc-400 border-white/10">
                          {plan.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                      {plan.description}
                    </p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                        {price === 0 ? 'Grátis' : `R$ ${price.toFixed(2).replace('.', ',')}`}
                      </span>
                      {price > 0 && (
                        <span className="text-xs font-semibold text-zinc-400">/mês</span>
                      )}
                    </div>
                    {billingCycle === 'yearly' && price > 0 && (
                      <span className="text-[11px] text-emerald-400 font-medium block mt-1">
                        Faturado anualmente (R$ {(price * 12).toFixed(2).replace('.', ',')}/ano)
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-6 sm:p-8 pt-0 space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 border-t border-white/5 pt-6">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                      O que está incluído:
                    </span>
                    <ul className="space-y-2.5 text-xs text-zinc-300">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                      {plan.notIncluded.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-zinc-600">
                          <span className="size-4 grid place-items-center text-zinc-600 shrink-0 text-sm">✕</span>
                          <span className="line-through leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isCurrent || isProcessing}
                      className={`w-full font-black text-xs sm:text-sm py-6 rounded-2xl cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-white/5 border border-white/10 text-zinc-400 cursor-default'
                          : plan.popular
                          ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-xl shadow-violet-600/30'
                          : 'bg-white/10 hover:bg-white/15 text-white'
                      }`}
                    >
                      {isCurrent ? (
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="size-4 text-emerald-400" /> Plano Ativo
                        </span>
                      ) : (
                        <span>{plan.ctaText}</span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* =========================================================================
            4. GARANTIA & BENEFÍCIOS ADICIONAIS
           ========================================================================= */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-[#12111d] p-5 space-y-2 text-center sm:text-left">
            <ShieldCheck className="size-6 text-emerald-400 mx-auto sm:mx-0" />
            <h4 className="text-sm font-bold text-white">Garantia de 7 Dias</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Experimente todas as ferramentas Pro. Se não gostar, devolvemos 100% do seu dinheiro sem perguntas.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#12111d] p-5 space-y-2 text-center sm:text-left">
            <Award className="size-6 text-violet-400 mx-auto sm:mx-0" />
            <h4 className="text-sm font-bold text-white">Certificados com Validação Pública</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Certificados autenticados com hash criptográfico e link de validação para recrutadores no LinkedIn.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#12111d] p-5 space-y-2 text-center sm:text-left">
            <Zap className="size-6 text-amber-400 mx-auto sm:mx-0" />
            <h4 className="text-sm font-bold text-white">Cancelamento Imediato</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Você tem total controle. Cancele com um único clique nas configurações da sua conta a qualquer instante.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
