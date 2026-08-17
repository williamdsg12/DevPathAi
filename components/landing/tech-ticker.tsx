'use client'

import React from 'react'
import {
  Code2,
  Cpu,
  Database,
  FileCode2,
  FolderGit2,
  Layers,
  Sparkles,
  Terminal,
} from 'lucide-react'

const techs = [
  { name: 'JavaScript ES6+', icon: Code2 },
  { name: 'TypeScript', icon: FileCode2 },
  { name: 'React 19', icon: Layers },
  { name: 'Next.js 15', icon: Cpu },
  { name: 'Node.js', icon: Terminal },
  { name: 'PostgreSQL', icon: Database },
  { name: 'Tailwind CSS', icon: Sparkles },
  { name: 'Docker', icon: Layers },
  { name: 'Git & GitHub', icon: FolderGit2 },
  { name: 'Prisma ORM', icon: Database },
  { name: 'Python', icon: Code2 },
  { name: 'DevMentor AI', icon: Sparkles },
]

export function TechTicker() {
  return (
    <div className="w-full py-8 overflow-hidden border-y border-white/5 bg-[#08070d]/90 relative select-none">
      {/* Side Fade Masks for Seamless Endless Flow */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0910] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0910] to-transparent z-10" />

      <div className="flex w-max animate-marquee gap-4 items-center">
        {/* Double the list for infinite continuous loop */}
        {[...techs, ...techs].map((item, index) => {
          const Icon = item.icon
          return (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-semibold text-zinc-400 hover:text-white hover:border-violet-500/30 hover:bg-violet-950/20 transition-colors shrink-0"
            >
              <Icon className="size-3.5 text-violet-400" />
              <span>{item.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TechTicker
