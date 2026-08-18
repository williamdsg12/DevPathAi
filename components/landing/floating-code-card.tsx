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
        y: [0, -10, 0],
        rotate: [0, 1, -0.5, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`relative rounded-2xl border border-violet-500/30 bg-[#0e0d18]/90 p-4 shadow-[0_0_35px_-8px_rgba(139,92,246,0.35)] backdrop-blur-xl font-mono text-[11px] sm:text-xs text-left max-w-sm ${className}`}
    >
      {/* Glow highlight */}
      <div className="absolute -top-12 -right-12 size-24 rounded-full bg-violet-600/20 blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-rose-500/80" />
          <div className="size-2.5 rounded-full bg-amber-500/80" />
          <div className="size-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-[10px] font-bold text-zinc-400">
            {language === 'typescript' ? 'algorithm.ts' : language === 'python' ? 'mentor_ai.py' : 'App.tsx'}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
          <Sparkles className="size-2.5" /> AI Verified
        </span>
      </div>

      {/* Code Snippet */}
      {language === 'typescript' ? (
        <div className="space-y-1 text-zinc-300 leading-relaxed">
          <div>
            <span className="text-purple-400">const</span> <span className="text-amber-300">binarySearch</span> = (
            <span className="text-zinc-400">arr: number[], target: number</span>
            ): <span className="text-blue-400">number</span> =&gt; &#123;
          </div>
          <div className="pl-3">
            <span className="text-purple-400">let</span> [low, high] = [
            <span className="text-emerald-400">0</span>, arr.length - <span className="text-emerald-400">1</span>];
          </div>
          <div className="pl-3">
            <span className="text-purple-400">while</span> (low &lt;= high) &#123;
          </div>
          <div className="pl-6">
            <span className="text-purple-400">const</span> mid = Math.
            <span className="text-amber-300">floor</span>((low + high) / <span className="text-emerald-400">2</span>);
          </div>
          <div className="pl-6">
            <span className="text-purple-400">if</span> (arr[mid] === target) <span className="text-purple-400">return</span> mid;
          </div>
          <div className="pl-6">
            arr[mid] &lt; target ? (low = mid + <span className="text-emerald-400">1</span>) : (high = mid - <span className="text-emerald-400">1</span>);
          </div>
          <div className="pl-3">&#125;</div>
          <div className="pl-3"><span className="text-purple-400">return</span> -<span className="text-emerald-400">1</span>;</div>
          <div>&#125;;</div>
        </div>
      ) : language === 'python' ? (
        <div className="space-y-1 text-zinc-300 leading-relaxed">
          <div>
            <span className="text-purple-400">async def</span> <span className="text-amber-300">evaluate_student</span>(
            <span className="text-zinc-400">code, test_cases</span>
            ):
          </div>
          <div className="pl-3">
            analysis = <span className="text-purple-400">await</span> DevMentorAI.<span className="text-blue-400">inspect_ast</span>(code)
          </div>
          <div className="pl-3">
            <span className="text-purple-400">if</span> analysis.score &gt;= <span className="text-emerald-400">85</span>:
          </div>
          <div className="pl-6">
            <span className="text-purple-400">return</span> &#123;<span className="text-emerald-300">"status"</span>: <span className="text-emerald-300">"UNLOCKED"</span>, <span className="text-emerald-300">"xp"</span>: <span className="text-emerald-400">150</span>&#125;
          </div>
        </div>
      ) : (
        <div className="space-y-1 text-zinc-300 leading-relaxed">
          <div>
            <span className="text-purple-400">export function</span> <span className="text-amber-300">DevPathApp</span>() &#123;
          </div>
          <div className="pl-3">
            <span className="text-purple-400">const</span> &#123; mastery, nextStep &#125; = <span className="text-blue-400">useLearningPath</span>();
          </div>
          <div className="pl-3">
            <span className="text-purple-400">return</span> &lt;<span className="text-violet-400">InteractiveRoadmap</span> score=&#123;mastery&#125; /&gt;;
          </div>
          <div>&#125;</div>
        </div>
      )}
    </motion.div>
  )
}
