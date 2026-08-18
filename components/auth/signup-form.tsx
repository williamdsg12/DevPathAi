'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function SignupForm() {
  const router = useRouter()
  const { signUp } = useAppStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage(null)

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Por favor, preencha todos os campos do formulário.')
      return
    }
    if (password.length < 6) {
      setErrorMessage('A senha precisa ter no mínimo 6 caracteres para garantir sua segurança.')
      return
    }

    setLoading(true)
    const res = await signUp(name, email, password)
    setLoading(false)

    if (res.success) {
      toast.success('Conta criada com sucesso! Vamos iniciar seu teste de nivelamento.')
      router.push('/onboarding')
    } else {
      setErrorMessage(res.error || 'Erro ao criar sua conta. Verifique os dados e tente novamente.')
      toast.error('Erro ao criar conta.')
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
          <label htmlFor="name" className="text-xs font-bold text-zinc-300">
            Nome Completo
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500 pointer-events-none" />
            <Input
              id="name"
              autoComplete="name"
              placeholder="Ex: William Santos"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errorMessage) setErrorMessage(null)
              }}
              className="pl-10 h-11 bg-black/40 border-white/10 text-xs rounded-xl text-white placeholder:text-zinc-500 focus-visible:ring-violet-500/50"
            />
          </div>
        </div>

        <div className="space-y-1.5 text-left">
          <label htmlFor="email" className="text-xs font-bold text-zinc-300">
            E-mail Profissional
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
          <label htmlFor="password" className="text-xs font-bold text-zinc-300">
            Criar Senha
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500 pointer-events-none" />
            <Input
              id="password"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
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

      <div className="pt-1 text-left text-[11px] text-zinc-400 leading-relaxed font-medium">
        Ao se cadastrar, você concorda com nossos termos e fará um teste prático de nivelamento para adaptar sua trilha.
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-purple-600/30 gap-2 cursor-pointer transition-all hover:scale-[1.02] border border-violet-400/30 mt-2"
      >
        <span>{loading ? 'Criando sua conta...' : 'Criar Conta Gratuita'}</span>
        <ArrowRight className="size-4" />
      </Button>

      <p className="pt-2 text-center text-xs text-zinc-400 font-medium">
        Já tem uma conta?{' '}
        <Link href="/login" className="font-bold text-violet-400 hover:text-violet-300 hover:underline">
          Entrar na plataforma
        </Link>
      </p>
    </form>
  )
}
