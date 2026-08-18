'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, KeyRound, RefreshCw, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface TwoFactorVerificationProps {
  email?: string
  onVerify?: (code: string) => void
  onResend?: () => void
}

export function TwoFactorVerification({
  email = 'aluno@devpath.ai',
  onVerify,
  onResend,
}: TwoFactorVerificationProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [cooldown, setCooldown] = useState(60)
  const [isVerifying, setIsVerifying] = useState(false)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  const handleChange = (index: number, value: string) => {
    // Only allow numeric
    const clean = value.replace(/\D/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[index] = clean
    setDigits(newDigits)

    // Auto-advance
    if (clean && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }

    // Auto-submit if completed
    const fullCode = newDigits.join('')
    if (fullCode.length === 6 && !newDigits.includes('')) {
      handleComplete(fullCode)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length > 0) {
      const newDigits = [...digits]
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || ''
      }
      setDigits(newDigits)
      const lastIndex = Math.min(pasted.length, 5)
      inputsRef.current[lastIndex]?.focus()

      if (pasted.length === 6) {
        handleComplete(pasted)
      }
    }
  }

  const handleComplete = (code: string) => {
    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
      if (onVerify) {
        onVerify(code)
      } else {
        toast.success('Código de segurança 2FA verificado com sucesso!')
      }
    }, 800)
  }

  const handleResendClick = () => {
    if (cooldown > 0) return
    setCooldown(60)
    toast.info('Novo código de verificação enviado.')
    if (onResend) onResend()
  }

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-violet-600/15 border border-violet-500/30 text-violet-400 shadow-lg shadow-violet-950/50">
        <KeyRound className="size-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-black text-white">Verificação de Segurança (2FA)</h3>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
          Enviamos um código de 6 dígitos para <strong className="text-zinc-200">{email}</strong>.
        </p>
      </div>

      {/* 6 Digit Inputs */}
      <div className="flex items-center justify-center gap-2 sm:gap-2.5">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputsRef.current[idx] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className="size-11 sm:size-12 rounded-xl border border-white/10 bg-black/40 text-center font-mono text-lg font-black text-white focus:border-violet-500 focus:bg-violet-950/30 focus:outline-none focus:ring-1 focus:ring-violet-400 transition-all shadow-inner"
          />
        ))}
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => handleComplete(digits.join(''))}
          disabled={digits.join('').length < 6 || isVerifying}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-5 rounded-xl shadow-lg shadow-violet-600/25"
        >
          {isVerifying ? 'Verificando...' : 'Confirmar e Continuar'}
        </Button>

        <div className="text-xs text-zinc-400 flex items-center justify-center gap-1.5">
          <span>Não recebeu o código?</span>
          <button
            type="button"
            onClick={handleResendClick}
            disabled={cooldown > 0}
            className={`font-bold transition-colors ${
              cooldown > 0 ? 'text-zinc-600 cursor-not-allowed' : 'text-violet-400 hover:underline cursor-pointer'
            }`}
          >
            {cooldown > 0 ? `Reenviar em ${cooldown}s` : 'Reenviar código'}
          </button>
        </div>
      </div>
    </div>
  )
}
