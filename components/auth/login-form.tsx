'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'

export function LoginForm() {
  const router = useRouter()
  const { signIn, onboarding, placement } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage(null)

    if (!email || !password) {
      setErrorMessage('Preencha seu e-mail e senha para continuar.')
      return
    }

    setLoading(true)
    const res = await signIn(email, password)
    setLoading(false)

    if (res.success) {
      toast.success('Bem-vindo de volta ao DevPath AI!')
      if (!onboarding) {
        router.push('/onboarding')
      } else if (!placement) {
        router.push('/nivelamento')
      } else {
        router.push('/dashboard')
      }
    } else {
      setErrorMessage(res.error || 'Credenciais inválidas. Verifique seu e-mail e senha.')
      toast.error('Erro ao realizar login.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Consistent Error Alert Box */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs text-rose-300 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="size-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed font-medium">{errorMessage}</div>
        </div>
      )}

      <div className="space-y-3.5">
        <div className="space-y-1.5 text-left">
          <label htmlFor="email" className="text-xs font-bold text-zinc-300">
            E-mail
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500 pointer-events-none" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errorMessage) setErrorMessage(null)
              }}
              className="pl-10 h-11 bg-black/40 border-white/10 text-xs rounded-xl text-white placeholder:text-zinc-500 focus-visible:ring-violet-500/50"
            />
          </div>
        </div>

        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-bold text-zinc-300">
              Senha
            </label>
            <button
              type="button"
              onClick={() => toast.info('Instruções de recuperação enviadas para seu e-mail.')}
              className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            >
              Esqueceu a senha?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500 pointer-events-none" />
            <Input
              id="password"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errorMessage) setErrorMessage(null)
              }}
              className="pl-10 pr-10 h-11 bg-black/40 border-white/10 text-xs rounded-xl text-white placeholder:text-zinc-500 focus-visible:ring-violet-500/50"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              aria-label={show ? 'Ocultar senha' : 'Exibir senha'}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-purple-600/30 gap-2 cursor-pointer transition-all hover:scale-[1.02] border border-violet-400/30 mt-2"
      >
        <span>{loading ? 'Acessando conta...' : 'Entrar na Plataforma'}</span>
        <ArrowRight className="size-4" />
      </Button>

      <p className="pt-2 text-center text-xs text-zinc-400 font-medium">
        Ainda não tem conta?{' '}
        <Link href="/cadastro" className="font-bold text-violet-400 hover:text-violet-300 hover:underline">
          Criar conta gratuita
        </Link>
      </p>
    </form>
  )
}
