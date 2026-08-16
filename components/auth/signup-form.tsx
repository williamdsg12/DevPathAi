'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

export function SignupForm() {
  const router = useRouter()
  const { signUp } = useAppStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !password) {
      toast.error('Preencha todos os campos.')
      return
    }
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    const res = await signUp(name, email, password)
    setLoading(false)

    if (res.success) {
      toast.success('Conta criada com sucesso! Vamos personalizar sua trilha de aprendizado.')
      router.push('/onboarding')
    } else {
      toast.error(res.error || 'Erro ao criar conta. Tente novamente.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Nome completo</FieldLabel>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
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
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="password"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
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
          <FieldDescription>
            Após criar a conta você responderá ao onboarding e fará o teste de nivelamento adaptativo.
          </FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={loading} className="font-bold shadow-md shadow-primary/20">
            {loading ? 'Criando conta...' : 'Criar conta gratuita'}
          </Button>
        </Field>
      </FieldGroup>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  )
}
