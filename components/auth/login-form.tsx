'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

export function LoginForm() {
  const router = useRouter()
  const { signIn, profile, onboarding, placement } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Preencha e-mail e senha.')
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
      toast.error(res.error || 'Erro ao realizar login. Verifique suas credenciais.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Senha</FieldLabel>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault()
                toast.info('Instruções de recuperação enviadas para seu e-mail.')
              }}
              className="text-xs font-medium text-primary hover:underline"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <InputGroup>
            <InputGroupInput
              id="password"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                size="icon-xs"
                aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setShow((s) => !s)}
              >
                {show ? <EyeOff /> : <Eye />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>
        <Field>
          <Button type="submit" disabled={loading} className="font-bold shadow-md shadow-primary/20">
            {loading ? 'Entrando...' : 'Entrar no DevPath AI'}
          </Button>
        </Field>
      </FieldGroup>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Ainda não tem conta?{' '}
        <Link href="/cadastro" className="font-medium text-primary hover:underline">
          Criar conta gratuita
        </Link>
      </p>
    </form>
  )
}
