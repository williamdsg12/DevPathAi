'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  Bot,
  Code2,
  Lightbulb,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function DevMentorAISection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 30,
  })

  // Left column transforms
  const leftX = useTransform(smoothProgress, [0.1, 0.4], [-50, 0])
  const leftOpacity = useTransform(smoothProgress, [0.1, 0.35], [0, 1])

  // Right chat elements progressive reveal linked directly to scroll
  const userMsgY = useTransform(smoothProgress, [0.18, 0.38], [30, 0])
  const userMsgOpacity = useTransform(smoothProgress, [0.18, 0.35], [0, 1])

  const aiMsgY = useTransform(smoothProgress, [0.32, 0.52], [40, 0])
  const aiMsgOpacity = useTransform(smoothProgress, [0.32, 0.5], [0, 1])

  const codeBoxScale = useTransform(smoothProgress, [0.45, 0.65], [0.92, 1])
  const codeBoxOpacity = useTransform(smoothProgress, [0.45, 0.62], [0, 1])

  return (
    <section
      ref={sectionRef}
      id="devmentor"
      className="py-24 sm:py-32 border-t border-white/5 bg-[#0d0c14] relative overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Explanations & Capabilities */}
          <motion.div
            style={{
              x: leftX,
              opacity: leftOpacity,
            }}
            className="lg:col-span-6 space-y-6"
          >
            <Badge className="bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-bold gap-1.5 px-3 py-1">
              <Bot className="size-3.5 text-violet-400" /> Assistente Pedagógico 24/7
            </Badge>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Um mentor que não entrega o gabarito. Ensina você a pensar.
            </h2>

            <p className="text-sm sm:text-base text-zinc-400 font-medium leading-relaxed">
              O <strong className="text-white">DevMentor AI</strong> é conectado diretamente à aula que você está assistindo, ao código que está digitando e ao seu histórico de acertos e erros.
            </p>

            <div className="grid gap-3.5 pt-2">
              <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-black/40 p-4 transition-colors hover:border-violet-500/30">
                <Lightbulb className="size-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">Dicas Progressivas</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    Se errar um exercício, a IA fornece uma dica reflexiva na 1ª tentativa e um roteiro guiado na 2ª tentativa.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-black/40 p-4 transition-colors hover:border-violet-500/30">
                <Code2 className="size-5 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">Revisão de Código & Rubrica</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    Avaliação detalhada da arquitetura, tratamento de exceções e clareza do seu código nos projetos de módulo.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-black/40 p-4 transition-colors hover:border-violet-500/30">
                <Zap className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">Plano de Recuperação Automático</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    Identifica os tópicos em que você teve menor aproveitamento e gera aulas de reforço personalizadas.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Scroll-animated Interactive Chat UI Mockup */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-violet-500/30 bg-[#12111a] p-5 sm:p-7 shadow-2xl shadow-purple-950/40 space-y-4 ring-1 ring-violet-500/20">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-2xl bg-violet-600 text-white shadow-md shadow-violet-600/30">
                    <Bot className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">DevMentor AI</h4>
                    <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ativo na Aula: Métodos de Array em JavaScript
                    </p>
                  </div>
                </div>
                <Badge className="bg-violet-950 text-violet-300 border-violet-500/30 text-[10px] font-bold">
                  Modo Tutor
                </Badge>
              </div>

              {/* Chat Dialogue Driven by Scroll */}
              <div className="space-y-3.5 pt-2 text-xs">
                {/* User message (Enters first on scroll) */}
                <motion.div
                  style={{
                    y: userMsgY,
                    opacity: userMsgOpacity,
                  }}
                  className="flex items-start justify-end gap-2.5"
                >
                  <div className="max-w-[85%] rounded-2xl bg-violet-600 text-white p-3.5 leading-relaxed font-medium shadow-md">
                    &quot;Qual a diferença entre usar `.map()` e `.forEach()` para transformar uma lista de usuários?&quot;
                  </div>
                </motion.div>

                {/* AI response (Enters second on scroll) */}
                <motion.div
                  style={{
                    y: aiMsgY,
                    opacity: aiMsgOpacity,
                  }}
                  className="flex items-start gap-2.5"
                >
                  <div className="grid size-7 place-items-center rounded-xl bg-violet-950 text-violet-300 border border-violet-500/30 shrink-0">
                    <Sparkles className="size-3.5" />
                  </div>
                  <div className="max-w-[90%] rounded-2xl border border-white/10 bg-black/50 p-4 space-y-2 text-zinc-300 leading-relaxed font-medium">
                    <p>
                      Excelente pergunta! A diferença principal está no <strong>retorno e na imutabilidade</strong>:
                    </p>
                    <ul className="space-y-1 list-disc list-inside text-zinc-300 text-[11px]">
                      <li><strong className="text-violet-300">.map()</strong>: Cria e retorna um <em>novo array</em> com os resultados transformados.</li>
                      <li><strong className="text-zinc-400">.forEach()</strong>: Apenas itera executando efeitos colaterais, sem retornar nada (<code className="text-zinc-500 font-mono">undefined</code>).</li>
                    </ul>

                    {/* AI Code block (Zooms in third on scroll) */}
                    <motion.div
                      style={{
                        scale: codeBoxScale,
                        opacity: codeBoxOpacity,
                      }}
                      className="p-2.5 rounded-xl bg-black/80 border border-white/10 font-mono text-[11px] text-emerald-300"
                    >
                      <p className="text-zinc-500">// Usando map para transformar:</p>
                      <p><span className="text-violet-400">const</span> nomes = users.<span className="text-violet-400">map</span>(u =&gt; u.nome);</p>
                    </motion.div>

                    <p className="text-[11px] text-violet-400 font-semibold pt-1">
                      💡 Quer tentar resolver o exercício #03 da aula agora aplicando o .map()?
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
