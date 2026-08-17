'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Bot, Sparkles, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FinalCtaSection() {
  return (
    <section className="py-20 sm:py-28 relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/40 bg-gradient-to-b from-[#1c1830] via-[#121020] to-[#0d0c14] p-8 sm:p-16 text-center shadow-2xl shadow-purple-950/50">
          {/* Subtle Ambient Radial Glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.25)_0%,transparent_70%)]"
          />

          <div className="mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/60 px-4 py-1.5 text-xs font-semibold text-violet-300">
              <Sparkles className="size-3.5 text-violet-400" />
              <span>Comece a programar com direção hoje mesmo</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Sua carreira de desenvolvedor começa com o primeiro passo certo.
            </h2>

            <p className="mx-auto max-w-xl text-sm sm:text-base lg:text-lg text-zinc-300 font-medium leading-relaxed">
              Crie sua conta gratuita agora, realize o teste de nivelamento com o DevMentor e receba sua trilha de aprendizado personalizada em poucos minutos.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm px-8 py-6 shadow-xl shadow-violet-600/40 gap-2 cursor-pointer transition-all"
              >
                <Link href="/cadastro">
                  <span>Começar minha jornada</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-2xl border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold text-sm px-6 py-6"
              >
                <Link href="/login">
                  <span>Já tenho uma conta</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
