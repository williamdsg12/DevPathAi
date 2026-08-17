'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  Brain,
  CheckCircle2,
  Code2,
  FolderGit2,
  Play,
  Sparkles,
  Terminal,
  Trophy,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const criteria5 = [
  {
    title: '1. Aulas Obrigatórias',
    desc: 'Conteúdo em vídeo de alta qualidade com transcrições e materiais de apoio para download.',
    icon: Play,
  },
  {
    title: '2. Atividades Práticas',
    desc: 'Exercícios de código e desafios de lógica contextualizados com a aula, com dicas progressivas da IA.',
    icon: Code2,
  },
  {
    title: '3. Projeto do Módulo',
    desc: 'Aplicação prática publicada no GitHub avaliada contra rubrica ponderada de critérios arquiteturais.',
    icon: FolderGit2,
  },
  {
    title: '4. Avaliação Oficial (70%+)',
    desc: 'Prova diagnóstica cronometrada para certificar que o conhecimento foi fixado de verdade.',
    icon: Trophy,
  },
  {
    title: '5. Reflexão Pedagógica',
    desc: 'Autoavaliação guiada para consolidar os pontos fortes e identificar o que ainda precisa de reforço.',
    icon: Brain,
  },
]

export function PracticeCodeLabSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 30,
  })

  // 3D perspective rotation on the code lab window linked to scroll
  const labRotateX = useTransform(smoothProgress, [0.2, 0.65], [16, 0])
  const labScale = useTransform(smoothProgress, [0.2, 0.65], [0.93, 1])
  const labOpacity = useTransform(smoothProgress, [0.15, 0.45], [0, 1])

  return (
    <section ref={sectionRef} id="pratica" className="py-24 sm:py-32 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-16">
        {/* Top: 5 Module Completion Criteria */}
        <div className="space-y-10">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3.5 text-center">
            <Badge className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold gap-1.5 px-3 py-1">
              <CheckCircle2 className="size-3 text-emerald-400" /> Rigor Pedagógico
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Os 5 critérios de conclusão de cada módulo
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 font-medium leading-relaxed max-w-2xl">
              Na DEVPATH AI, você nunca avança apenas marcando &quot;concluído&quot;. O avanço é conquistado por domínio prático comprovado.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {criteria5.map((c, i) => {
              const start = 0.1 + (i * 0.06)
              const end = start + 0.2
              const cY = useTransform(smoothProgress, [start, end], [30, 0])
              const cOpacity = useTransform(smoothProgress, [start, end], [0, 1])

              return (
                <motion.div
                  key={c.title}
                  style={{
                    y: cY,
                    opacity: cOpacity,
                  }}
                  className="rounded-2xl border border-white/10 bg-[#12111a] p-5 space-y-3 hover:border-emerald-500/30 transition-colors shadow-md h-full"
                >
                  <div className="grid size-10 place-items-center rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                    <c.icon className="size-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{c.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">{c.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Bottom: Code Lab 3D Scroll Reveal Window */}
        <motion.div
          style={{
            rotateX: labRotateX,
            scale: labScale,
            opacity: labOpacity,
            transformStyle: 'preserve-3d',
          }}
          className="rounded-3xl border border-white/10 bg-[#100f18] p-5 sm:p-8 shadow-2xl space-y-6 ring-1 ring-white/5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Terminal className="size-4 text-violet-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                  Code Lab Integrado
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">Ambiente de Programação no Navegador</h3>
            </div>
            <Badge className="bg-violet-950 text-violet-300 border-violet-500/30 text-xs font-mono font-bold w-fit">
              Node.js & JavaScript Runner
            </Badge>
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            {/* Code Editor Window */}
            <div className="lg:col-span-8 rounded-2xl border border-white/5 bg-black/60 p-4 font-mono text-xs text-emerald-300 space-y-1.5 overflow-x-auto">
              <div className="text-zinc-500 text-[11px] pb-2 border-b border-white/5 flex items-center justify-between">
                <span>// desafio_02_estruturas_repeticao.js</span>
                <span className="text-violet-400">Linha 1, Coluna 1</span>
              </div>
              <p><span className="text-violet-400">function</span> <span className="text-amber-300">calcularMediaPonderada</span>(notas, pesos) &#123;</p>
              <p className="pl-4"><span className="text-violet-400">const</span> somaPonderada = notas.<span className="text-blue-400">reduce</span>((acc, nota, i) =&gt; acc + (nota * pesos[i]), 0);</p>
              <p className="pl-4"><span className="text-violet-400">const</span> somaPesos = pesos.<span className="text-blue-400">reduce</span>((acc, peso) =&gt; acc + peso, 0);</p>
              <p className="pl-4"><span className="text-violet-400">return</span> (somaPonderada / somaPesos).<span className="text-blue-400">toFixed</span>(2);</p>
              <p>&#125;</p>
              <p className="text-zinc-500 pt-2">// Execução do teste:</p>
              <p>console.<span className="text-blue-400">log</span>(calcularMediaPonderada([8, 9, 7], [2, 3, 5]));</p>
            </div>

            {/* Console Output & AI Analysis */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <div className="rounded-2xl border border-white/5 bg-black/80 p-4 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-zinc-500 text-[11px] border-b border-white/5 pb-1">
                  <span>CONSOLE OUTPUT</span>
                  <span className="text-emerald-400 font-bold">200 OK</span>
                </div>
                <p className="text-emerald-400 font-bold">&gt; Resultado: 7.80</p>
                <p className="text-zinc-500 text-[10px]">&gt; 3/3 Testes unitários passaram com sucesso.</p>
              </div>

              <div className="rounded-2xl border border-violet-500/30 bg-violet-950/20 p-4 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-violet-400 font-bold text-xs">
                  <Sparkles className="size-3.5" /> Análise de Qualidade de Código
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  Excelente uso de <code className="text-violet-300">Array.reduce</code> e funções puras sem mutações de estado!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
