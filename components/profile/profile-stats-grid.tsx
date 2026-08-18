'use client'

import {
  Award,
  BookOpen,
  CheckCircle2,
  FileText,
  Heart,
  HelpCircle,
  TrendingUp,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import Link from 'next/link'

export function ProfileStatsGrid() {
  const {
    allCourses,
    allModules,
    completedLessons,
    completedActivities,
    completedExercises,
    lessonNotes,
    certificates,
    userCertificates,
    overallProgress,
    moduleProgress,
  } = useAppStore()

  const totalCourses = allCourses.length || 9
  const totalCertificates = certificates.length + userCertificates.length
  const totalExercises = (completedActivities.length || 0) + (completedExercises.length || 0)
  const totalNotes = Object.keys(lessonNotes || {}).length
  const completedModulesCount = Object.values(moduleProgress).filter(
    (p) => p.status === 'completed' || (p.assessmentScore !== null && p.assessmentScore >= 50)
  ).length

  const stats = [
    {
      label: 'Meus Cursos',
      value: totalCourses,
      subtitle: `${completedLessons.length} aulas assistidas`,
      icon: BookOpen,
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/20 border-cyan-500/30',
      href: '/cursos',
    },
    {
      label: 'Meus Certificados',
      value: totalCertificates,
      subtitle: 'Emitidos e validados',
      icon: Award,
      color: 'text-amber-400',
      bg: 'bg-amber-950/20 border-amber-500/30',
      href: '/certificados',
    },
    {
      label: 'Meus Exercícios',
      value: totalExercises,
      subtitle: 'Atividades e desafios',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/20 border-emerald-500/30',
      href: '/exercicios',
    },
    {
      label: 'Minhas Anotações',
      value: totalNotes,
      subtitle: 'Notas de estudo salvas',
      icon: FileText,
      color: 'text-blue-400',
      bg: 'bg-blue-950/20 border-blue-500/30',
      href: '/estudo',
    },
    {
      label: 'Minhas Dúvidas',
      value: 12,
      subtitle: 'Resolvidas com Mentor IA',
      icon: HelpCircle,
      color: 'text-purple-400',
      bg: 'bg-purple-950/20 border-purple-500/30',
      href: '/mentor',
    },
    {
      label: 'Favoritos & Concluídos',
      value: completedModulesCount,
      subtitle: `${completedModulesCount} módulos finalizados`,
      icon: Heart,
      color: 'text-rose-400',
      bg: 'bg-rose-950/20 border-rose-500/30',
      href: '/trilha',
    },
    {
      label: 'Progresso da Formação',
      value: `${overallProgress}%`,
      subtitle: 'Da trilha concluída',
      icon: TrendingUp,
      color: 'text-violet-400',
      bg: 'bg-violet-950/20 border-violet-500/30',
      href: '/trilha',
    },
  ]

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
        Estatísticas do Meu Aprendizado
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Link
              key={idx}
              href={stat.href}
              className={`group flex flex-col justify-between rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-[#11101b] ${stat.bg}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 group-hover:text-white transition-colors truncate">
                  {stat.label}
                </span>
                <Icon className={`size-4 ${stat.color} shrink-0`} />
              </div>

              <div className="mt-3 space-y-0.5">
                <div className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-[10px] text-zinc-500 font-medium truncate">
                  {stat.subtitle}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
