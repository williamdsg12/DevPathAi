'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { Check, RefreshCw, User, Mail, CreditCard, Calendar, Phone, MapPin, Globe } from 'lucide-react'
import { toast } from 'sonner'

export function PersonalDataTab() {
  const { profile, updatePersonalData } = useAppStore()

  const [name, setName] = useState(profile?.name || '')
  const [email, setEmail] = useState(profile?.email || '')
  const [cpf, setCpf] = useState(profile?.cpf || '')
  const [birthDate, setBirthDate] = useState(profile?.birthDate || '')
  const [locationType, setLocationType] = useState<'brasil' | 'exterior'>(profile?.locationType || 'brasil')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [commercialPhone, setCommercialPhone] = useState(profile?.commercialPhone || '')
  const [cep, setCep] = useState(profile?.cep || '')
  const [desiredRole, setDesiredRole] = useState(profile?.desiredRole || 'Desenvolvedor Full Stack Júnior')
  const [bio, setBio] = useState(profile?.bio || '')
  const [isSaving, setIsSaving] = useState(false)

  // Mask helpers
  function formatCPF(val: string) {
    return val
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14)
  }

  function formatPhone(val: string) {
    return val
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15)
  }

  function formatCEP(val: string) {
    return val
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 9)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('O campo Nome é obrigatório.')
      return
    }

    setIsSaving(true)
    updatePersonalData({
      name,
      email,
      cpf,
      birthDate,
      locationType,
      phone,
      commercialPhone,
      cep,
      desiredRole,
      bio,
    })

    setTimeout(() => {
      setIsSaving(false)
      toast.success('Informações pessoais atualizadas com sucesso!')
    }, 400)
  }

  return (
    <Card className="border-white/10 bg-[#0e0d16] text-white rounded-3xl shadow-xl">
      <CardHeader className="border-b border-white/5 pb-6">
        <CardTitle className="text-xl font-black text-white flex items-center gap-2">
          <User className="size-5 text-cyan-400" /> Dados Pessoais e Cadastrais
        </CardTitle>
        <CardDescription className="text-xs text-zinc-400">
          Mantenha seus dados sempre atualizados para emissão de certificados oficiais e comunicação.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Nome */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Nome Completo *</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 size-4 text-zinc-500" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: William Silva"
                  className="pl-10 bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">E-mail Principal *</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 size-4 text-zinc-500" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="pl-10 bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
                  required
                />
              </div>
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">CPF</Label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-3 size-4 text-zinc-500" />
                <Input
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  className="pl-10 bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm font-mono"
                />
              </div>
            </div>

            {/* Data de Nascimento */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Data de Nascimento</Label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 size-4 text-zinc-500" />
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="pl-10 bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Localização Selector */}
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-bold text-zinc-300">Você está localizado:</Label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setLocationType('brasil')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    locationType === 'brasil'
                      ? 'border-cyan-500 bg-cyan-500/15 text-white ring-1 ring-cyan-500'
                      : 'border-white/10 bg-black/20 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <MapPin className="size-4 text-cyan-400" /> No Brasil
                </button>

                <button
                  type="button"
                  onClick={() => setLocationType('exterior')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    locationType === 'exterior'
                      ? 'border-cyan-500 bg-cyan-500/15 text-white ring-1 ring-cyan-500'
                      : 'border-white/10 bg-black/20 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <Globe className="size-4 text-cyan-400" /> Fora do Brasil
                </button>
              </div>
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Telefone / WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 size-4 text-zinc-500" />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(11) 98765-4321"
                  className="pl-10 bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm font-mono"
                />
              </div>
            </div>

            {/* Telefone Comercial */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Telefone Comercial (Opcional)</Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 size-4 text-zinc-500" />
                <Input
                  value={commercialPhone}
                  onChange={(e) => setCommercialPhone(formatPhone(e.target.value))}
                  placeholder="(11) 3456-7890"
                  className="pl-10 bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm font-mono"
                />
              </div>
            </div>

            {/* CEP */}
            <div className="space-y-2 sm:col-span-2 max-w-sm">
              <Label className="text-xs font-bold text-zinc-300">CEP</Label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 size-4 text-zinc-500" />
                <Input
                  value={cep}
                  onChange={(e) => setCep(formatCEP(e.target.value))}
                  placeholder="00000-000"
                  className="pl-10 bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm font-mono"
                />
              </div>
            </div>

            {/* Cargo Desejado */}
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-bold text-zinc-300">Cargo Desejado / Especialidade</Label>
              <Input
                value={desiredRole}
                onChange={(e) => setDesiredRole(e.target.value)}
                placeholder="Ex: Desenvolvedor Full Stack Júnior, Front-end React, etc."
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-bold text-zinc-300">Resumo Profissional / Biografia</Label>
              <Textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte brevemente sobre seu momento de carreira, tecnologias de interesse e objetivos..."
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm leading-relaxed"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end pt-4 border-t border-white/10">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs sm:text-sm px-8 py-5 rounded-2xl shadow-xl shadow-cyan-500/20 gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="size-4 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <Check className="size-4" /> Confirmar e Salvar
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
