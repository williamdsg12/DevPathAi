'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Code2, Sparkles } from 'lucide-react'

interface FloatingCodeCardProps {
  language?: 'typescript' | 'python' | 'react'
  className?: string
}

export function FloatingCodeCard({ language = 'typescript', className = '' }: FloatingCodeCardProps) {
  return (
    <motion.div
      animate={{
        y: [0, -8, 0],
        rotate: [0, 0.75, -0.5, 0],
      }}
      transition={{
        duration: 5.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`relative rounded-xl border border-violet-500/25 bg-[#0e0d18]/85 p-2.5 sm:p-3 shadow-[0_0_25px_-6px_rgba(139,92,246,0.3)] backdrop-blur-xl font-mono text-[10px] text-left max-w-[210px] sm:max-w-[230px] select-none ${className}`}
    >
      {/* Subtle Ambient Glow */}
      <div className="absolute -top-8 -right-8 size-16 rounded-full bg-violet-600/15 blur-xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
        <div className="flex items-center gap-1">
          <div className="size-2 rounded-full bg-rose-500/80" />
          <div className="size-2 rounded-full bg-amber-500/80" />
          <div className="size-2 rounded-full bg-emerald-500/80" />
          <span className="ml-1 text-[9px] font-bold text-zinc-400">
            {language === 'typescript' ? 'algorithm.ts' : language === 'python' ? 'mentor_ai.py' : 'App.tsx'}
          </span>
        </div>
        <span className="inline-flex items-center gap-0.5 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
          <Sparkles className="size-2" /> AI Verified
        </span>
      </div>

      {/* Concise Code Snippet */}
      {language === 'typescript' ? (
        <div className="space-y-0.5 text-zinc-300 leading-snug">
          <div>
            <span className="text-purple-400">const</span> <span className="text-amber-300">binarySearch</span> = (arr, target) =&gt; &#123;
          </div>
          <div className="pl-2">
            <span className="text-purple-400">const</span> mid = Math.<span className="text-amber-300">floor</span>((low + high) / <span className="text-emerald-400">2</span>);
          </div>
          <div className="pl-2">
            <span className="text-purple-400">return</span> arr[mid] === target ? mid : -<span className="text-emerald-400">1</span>;
          </div>
          <div>&#125;;</div>
        </div>
      ) : language === 'python' ? (
        <div className="space-y-0.5 text-zinc-300 leading-snug">
          <div>
            <span className="text-purple-400">async def</span> <span className="text-amber-300">evaluate_student</span>(code):
          </div>
          <div className="pl-2">
            analysis = <span className="text-purple-400">await</span> DevMentor.<span className="text-blue-400">inspect</span>(code)
          </div>
          <div className="pl-2">
            <span className="text-purple-400">return</span> &#123;<span className="text-emerald-300">"status"</span>: <span className="text-emerald-300">"OK"</span>, <span className="text-emerald-300">"xp"</span>: <span className="text-emerald-400">150</span>&#125;
          </div>
        </div>
      ) : (
        <div className="space-y-0.5 text-zinc-300 leading-snug">
          <div>
            <span className="text-purple-400">export function</span> <span className="text-amber-300">DevPathApp</span>() &#123;
          </div>
          <div className="pl-2">
            <span className="text-purple-400">const</span> &#123; mastery &#125; = <span className="text-blue-400">useLearningPath</span>();
          </div>
          <div className="pl-2">
            <span className="text-purple-400">return</span> &lt;<span className="text-violet-400">Roadmap</span> score=&#123;mastery&#125; /&gt;;
          </div>
          <div>&#125;</div>
        </div>
      )}
    </motion.div>
  )
}
