'use client'

import React from 'react'
import Link from 'next/link'
import { Logo } from '@/components/logo'

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0910] text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <Logo />
            </Link>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium max-w-sm leading-relaxed">
              A plataforma educacional com inteligência artificial que transforma o estudo de programação em uma trilha personalizada com foco em empregabilidade.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3 text-xs">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">Navegação</p>
            <ul className="space-y-2 font-medium">
              <li><a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a></li>
              <li><a href="#trilhas" className="hover:text-white transition-colors">Trilha IA</a></li>
              <li><a href="#devmentor" className="hover:text-white transition-colors">DevMentor</a></li>
              <li><a href="#pratica" className="hover:text-white transition-colors">Code Lab & Prática</a></li>
              <li><a href="#carreira" className="hover:text-white transition-colors">Carreira</a></li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">Plataforma</p>
            <ul className="space-y-2 font-medium">
              <li><Link href="/login" className="hover:text-white transition-colors">Entrar</Link></li>
              <li><Link href="/cadastro" className="hover:text-white transition-colors">Criar conta gratuita</Link></li>
              <li><Link href="/onboarding" className="hover:text-white transition-colors">Teste de nivelamento</Link></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">Legal</p>
            <ul className="space-y-2 font-medium">
              <li><span className="text-zinc-500">Termos de Uso</span></li>
              <li><span className="text-zinc-500">Privacidade</span></li>
              <li><span className="text-zinc-500">Código de Conduta</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} DEVPATH AI. Todos os direitos reservados.</p>
          <p className="text-[11px]">Desenvolvido com foco no aprendizado real de programação.</p>
        </div>
      </div>
    </footer>
  )
}
