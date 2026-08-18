'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, Terminal } from 'lucide-react'

const terminalSteps = [
  { type: 'input', text: 'npx devpath create-roadmap --goal="Full Stack Senior"' },
  { type: 'log', text: '⚡ DevPath AI Engine v3.8 inicializado' },
  { type: 'log', text: '🔍 Analisando 11 módulos fundamentais & projetos obrigatórios...' },
  { type: 'log', text: '🧠 Adaptando ritmo de estudos: 45 min/dia + Pomodoro Ativo' },
  { type: 'success', text: '✔ Trilha gerada: 11 Módulos • 17 Projetos de Portfólio • Mentor 24/7' },
  { type: 'ready', text: '$ devpath start --ready' },
]

export function TerminalShowcase() {
  const [currentStep, setCurrentStep] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    const activeStep = terminalSteps[currentStep]

    if (currentStep < terminalSteps.length) {
      if (activeStep.type === 'input') {
        let charIndex = 0
        const inputString = activeStep.text
        const typeInterval = setInterval(() => {
          if (charIndex <= inputString.length) {
            setDisplayText(inputString.slice(0, charIndex))
            charIndex++
          } else {
            clearInterval(typeInterval)
            timer = setTimeout(() => {
              setCurrentStep((s) => s + 1)
            }, 600)
          }
        }, 32)

        return () => clearInterval(typeInterval)
      } else {
        timer = setTimeout(() => {
          setCurrentStep((s) => s + 1)
        }, 500)
      }
    } else {
      // Loop after completion
      timer = setTimeout(() => {
        setCurrentStep(0)
        setDisplayText('')
      }, 5000)
    }

    return () => clearTimeout(timer)
  }, [currentStep])

  const handleCopy = () => {
    navigator.clipboard.writeText('npx devpath-ai start')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-xl mx-auto overflow-hidden rounded-2xl border border-white/10 bg-[#0d0c14]/95 shadow-2xl backdrop-blur-xl ring-1 ring-violet-500/20 text-left font-mono"
    >
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-rose-500/80" />
          <div className="size-3 rounded-full bg-amber-500/80" />
          <div className="size-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
            <Terminal className="size-3.5 text-violet-400" /> devpath-cli — bash
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
          title="Copiar comando"
        >
          {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar'}</span>
        </button>
      </div>

      {/* Terminal Body */}
      <div className="p-4 sm:p-5 space-y-2 text-xs sm:text-[13px] leading-relaxed min-h-[190px]">
        {/* Step 0: Animated input */}
        <div className="flex items-center gap-2 text-zinc-200">
          <span className="text-violet-400 font-bold">~</span>
          <span className="text-zinc-500">❯</span>
          <span className="text-emerald-400 font-semibold">{currentStep === 0 ? displayText : terminalSteps[0].text}</span>
          {currentStep === 0 && <span className="inline-block w-2 h-4 bg-violet-400 animate-pulse ml-0.5" />}
        </div>

        {/* Step 1: Engine init log */}
        {currentStep >= 1 && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-violet-300 font-medium"
          >
            {terminalSteps[1].text}
          </motion.div>
        )}

        {/* Step 2: Analysis log */}
        {currentStep >= 2 && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-zinc-400"
          >
            {terminalSteps[2].text}
          </motion.div>
        )}

        {/* Step 3: Adaptation log */}
        {currentStep >= 3 && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-amber-300/90"
          >
            {terminalSteps[3].text}
          </motion.div>
        )}

        {/* Step 4: Success badge */}
        {currentStep >= 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/30 p-2 rounded-lg"
          >
            {terminalSteps[4].text}
          </motion.div>
        )}

        {/* Step 5: Ready command */}
        {currentStep >= 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-zinc-300 pt-1"
          >
            <span className="text-violet-400 font-bold">~</span>
            <span className="text-zinc-500">❯</span>
            <span className="text-violet-300 font-semibold">{terminalSteps[5].text}</span>
            <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse" />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
