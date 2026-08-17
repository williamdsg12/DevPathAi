'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Menu, Sparkles, X } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#trilhas', label: 'Trilha IA' },
  { href: '#devmentor', label: 'DevMentor' },
  { href: '#pratica', label: 'Prática & Lab' },
  { href: '#carreira', label: 'Carreira' },
  { href: '#depoimentos', label: 'Depoimentos' },
  { href: '#faq', label: 'FAQ' },
]

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 py-2 transition-all duration-300 pointer-events-none">
      <nav
        className={cn(
          'pointer-events-auto mx-auto transition-all duration-300 flex items-center justify-between',
          isScrolled
            ? 'max-w-5xl rounded-2xl border border-white/10 bg-[#0d0c14]/85 px-4 sm:px-6 py-2.5 shadow-2xl shadow-purple-950/20 backdrop-blur-xl'
            : 'max-w-7xl px-3 sm:px-6 py-4 bg-transparent border-b border-white/5',
        )}
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <Logo />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl"
          >
            <Link href="/login">Entrar</Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="text-xs font-bold rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 gap-1.5 px-4"
          >
            <Link href="/cadastro">
              <span>Começar agora</span>
              <ArrowRight className="size-3" />
            </Link>
          </Button>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          className="lg:hidden p-2 rounded-xl border border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white focus:outline-none"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="pointer-events-auto lg:hidden mx-auto mt-2 max-w-lg rounded-3xl border border-white/10 bg-[#0d0c14]/95 p-6 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-2 border-b border-white/10 pb-4">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 pt-4">
            <Button asChild variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl border-white/10 text-white">
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                Entrar na minha conta
              </Link>
            </Button>
            <Button asChild size="sm" className="w-full text-xs font-bold rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30">
              <Link href="/cadastro" onClick={() => setMenuOpen(false)}>
                Criar conta gratuita
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
