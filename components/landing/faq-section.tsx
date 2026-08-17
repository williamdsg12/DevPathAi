'use client'

import React from 'react'
import { HelpCircle, Sparkles } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

const faq = [
  {
    q: 'Preciso já saber programar para começar?',
    a: 'Não. A DEVPATH AI foi desenhada para levar qualquer pessoa do nível iniciante absoluto até padrões profissionais de mercado. O teste de nivelamento no onboarding identifica exatamente o seu ponto de partida.',
  },
  {
    q: 'Como a trilha é personalizada especificamente para mim?',
    a: 'Após o onboarding e o teste de nivelamento, nossa IA monta uma árvore de aprendizado com fases, módulos e pré-requisitos alinhados ao seu objetivo profissional (Frontend, Backend ou Full Stack), sua disponibilidade semanal de horas e suas dificuldades diagnosticadas.',
  },
  {
    q: 'Posso pular módulos que eu já domino?',
    a: 'Você não pode simplesmente clicar em pular sem validação. Porém, se o teste de nivelamento ou a avaliação diagnóstica comprovarem seu domínio técnico com nota satisfatória, a IA ajusta sua trilha e desbloqueia os módulos avançados imediatamente.',
  },
  {
    q: 'A plataforma hospeda os vídeos ou utiliza fontes externas?',
    a: 'A DEVPATH AI opera como um orquestrador e hub educacional inteligente: integra APIs e embeds oficiais (como YouTube e canais parceiros verificados), enriquecendo cada aula com transcrições, resumos por IA, atividades práticas, Code Lab e emissão de certificados.',
  },
  {
    q: 'O que acontece se eu não atingir a nota mínima (70%) em uma avaliação?',
    a: 'Nada de punição ou bloqueio permanente. A IA mapeia os tópicos em que você teve menor pontuação e gera imediatamente um Plano de Recuperação com aulas recomendadas de reforço e mini desafios antes de liberar uma nova tentativa.',
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="py-24 sm:py-32 border-t border-white/5 relative">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-12">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3.5 text-center">
          <Badge className="bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-bold gap-1.5 px-3 py-1">
            <HelpCircle className="size-3 text-violet-400" /> Dúvidas Frequentes
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Perguntas Frequentes
          </h2>
          <p className="text-base text-zinc-400 font-medium">
            Tudo o que você precisa saber antes de iniciar sua jornada com a DEVPATH AI.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#100f18] p-6 sm:p-8 shadow-xl">
          <Accordion>
            {faq.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-white/5 py-1">
                <AccordionTrigger className="text-left text-sm sm:text-base font-bold text-white hover:text-violet-300 transition-colors">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal pt-1 pb-3">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
