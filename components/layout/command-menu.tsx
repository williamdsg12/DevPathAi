'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  Bot,
  CheckCircle2,
  Code2,
  FolderGit2,
  GraduationCap,
  LayoutDashboard,
  Map,
  Search,
  Sparkles,
  Target,
  Trophy,
  User,
  X,
} from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'

interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter()
  const { allCourses, allModules, allLessons, projects } = useAppStore()
  const [query, setQuery] = useState('')

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  // Filtered results
  const results = useMemo(() => {
    if (!query.trim()) {
      return {
        navigation: [
          { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, category: 'Navegação Rápida' },
          { title: 'Minha Trilha', url: '/trilha', icon: Map, category: 'Navegação Rápida' },
          { title: 'Catálogo de Cursos', url: '/cursos', icon: BookOpen, category: 'Navegação Rápida' },
          { title: 'Atividades Práticas', url: '/exercicios', icon: CheckCircle2, category: 'Navegação Rápida' },
          { title: 'DevMentor AI', url: '/mentor', icon: Bot, category: 'Navegação Rápida' },
          { title: 'Code Lab (IDE)', url: '/code-lab', icon: Code2, category: 'Navegação Rápida' },
          { title: 'Meus Projetos', url: '/projetos', icon: FolderGit2, category: 'Navegação Rápida' },
          { title: 'Conquistas & Certificados', url: '/certificados', icon: Trophy, category: 'Navegação Rápida' },
        ],
        courses: [],
        lessons: [],
      }
    }

    const q = query.toLowerCase()

    const navMatches = [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Minha Trilha', url: '/trilha', icon: Map },
      { title: 'Catálogo de Cursos', url: '/cursos', icon: BookOpen },
      { title: 'Atividades Práticas', url: '/exercicios', icon: CheckCircle2 },
      { title: 'DevMentor AI', url: '/mentor', icon: Bot },
      { title: 'Code Lab (IDE)', url: '/code-lab', icon: Code2 },
      { title: 'Meus Projetos', url: '/projetos', icon: FolderGit2 },
      { title: 'Meu Perfil', url: '/perfil', icon: User },
    ].filter((n) => n.title.toLowerCase().includes(q))

    const courseMatches = allCourses
      .filter((c) => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || (c.technology || '').toLowerCase().includes(q))
      .slice(0, 4)

    const lessonMatches = allLessons
      .filter((l) => l.title.toLowerCase().includes(q))
      .slice(0, 5)

    return {
      navigation: navMatches,
      courses: courseMatches,
      lessons: lessonMatches,
    }
  }, [query, allCourses, allLessons])

  const handleSelect = (url: string) => {
    onOpenChange(false)
    setQuery('')
    router.push(url)
  }

  const handleAskMentor = () => {
    if (!query.trim()) return
    onOpenChange(false)
    router.push(`/mentor?q=${encodeURIComponent(query.trim())}`)
    setQuery('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#12111d] border-white/10 text-white rounded-3xl p-0 overflow-hidden shadow-2xl">
        {/* Search input header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-black/40">
          <Search className="size-4 text-violet-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por cursos, aulas, tópicos ou faça uma pergunta para o Mentor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                handleAskMentor()
              }
            }}
            className="w-full bg-transparent text-xs sm:text-sm font-medium text-white placeholder:text-zinc-500 focus:outline-none"
            autoFocus
          />
          {query ? (
            <button onClick={() => setQuery('')} className="text-zinc-400 hover:text-white">
              <X className="size-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/10 rounded-md">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-3 space-y-4 scrollbar-thin">
          {/* Ask AI prompt option */}
          {query.trim() && (
            <div
              onClick={handleAskMentor}
              className="flex items-center justify-between p-3 rounded-2xl bg-violet-950/40 border border-violet-500/30 hover:bg-violet-900/40 cursor-pointer transition-colors text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-lg bg-violet-600 text-white shadow-sm">
                  <Bot className="size-4" />
                </span>
                <div>
                  <span className="text-violet-300 font-bold">Perguntar ao DevMentor AI:</span>
                  <p className="text-zinc-300 font-medium truncate max-w-md">&quot;{query}&quot;</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-violet-400">Pressione ↵</span>
            </div>
          )}

          {/* Navigation Items */}
          {results.navigation.length > 0 && (
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                Navegação
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
                {results.navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.url}
                      onClick={() => handleSelect(item.url)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.05] text-left text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <Icon className="size-4 text-violet-400 shrink-0" />
                      <span>{item.title}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Courses Results */}
          {results.courses.length > 0 && (
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                Cursos & Formações
              </span>
              <div className="space-y-1 pt-1">
                {results.courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => handleSelect(`/cursos`)}
                    className="flex w-full items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] text-left text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <BookOpen className="size-4 text-purple-400 shrink-0" />
                      <span className="font-bold truncate">{course.title}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">{course.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lessons Results */}
          {results.lessons.length > 0 && (
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                Aulas
              </span>
              <div className="space-y-1 pt-1">
                {results.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleSelect(`/aulas/${lesson.id}`)}
                    className="flex w-full items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] text-left text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                      <span className="font-semibold truncate">{lesson.title}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">{lesson.durationMin || 20}m</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-white/5 bg-black/40 px-4 py-2.5 text-[11px] text-zinc-500 font-medium">
          <span>Dica: Use <strong>Ctrl + K</strong> em qualquer tela para abrir a busca</span>
          <span className="text-violet-400 font-bold">DEVPATH AI Navigator</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
