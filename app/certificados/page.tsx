'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Download,
  ExternalLink,
  Flame,
  GraduationCap,
  Lock,
  Printer,
  QrCode,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Logo } from '@/components/logo'
import { useAppStore } from '@/lib/store'

const badgesList = [
  { id: 'b1', name: 'Primeira Aula Concluída', desc: 'Assistiu e completou a primeira aula da trilha', icon: '🎯', unlocked: true },
  { id: 'b2', name: 'Mestre da Lógica', desc: '100% de aproveitamento no módulo de Lógica & Algoritmos', icon: '🧠', unlocked: true },
  { id: 'b3', name: 'Streak de 7 Dias', desc: 'Estudou 7 dias consecutivos na plataforma', icon: '🔥', unlocked: true },
  { id: 'b4', name: 'Dev Prático (Code Lab)', desc: 'Escreveu e executou mais de 10 códigos no Sandbox', icon: '💻', unlocked: true },
  { id: 'b5', name: 'Primeiro Projeto de Portfólio', desc: 'Submeteu o primeiro projeto validado pelo DevMentor', icon: '🚀', unlocked: false },
  { id: 'b6', name: 'Full Stack Certified', desc: 'Concluiu 100% da formação e todas as avaliações', icon: '🏆', unlocked: false },
]

export default function CertificatesPage() {
  const { certificates, generateCertificate, overallProgress, profile, xp, level } = useAppStore()
  const [selectedCert, setSelectedCert] = useState(certificates[0] || null)

  const isEligible = overallProgress >= 100

  function handleIssueCert() {
    if (!isEligible) {
      toast.error('Você precisa concluir 100% da trilha e passar em todas as avaliações para emitir o certificado.')
      return
    }
    const cert = generateCertificate('Full Stack JavaScript')
    setSelectedCert(cert)
    toast.success('Parabéns! Certificado oficial emitido com sucesso!')
    try {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } })
    } catch {}
  }

  function handlePrint() {
    window.print()
  }

  return (
    <AppShell
      title="Conquistas & Certificados Oficiais"
      subtitle="Emissão e autenticação criptográfica de certificados de conclusão de formação"
    >
      <div className="space-y-10 pb-16">
        {/* Header Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-950/40 via-[#12111d] to-[#0a0910] p-6 sm:p-8 shadow-2xl">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-violet-950/80 border border-violet-500/30 text-violet-300 font-bold text-xs">
                Certificação Oficial
              </Badge>
              <span className="text-xs text-zinc-400 font-semibold">Validação por Hash Criptográfico</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Comprove sua Especialização Técnica
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
              Ao concluir 100% dos módulos da sua trilha e atingir nota mínima de 70% em todas as avaliações, seu certificado oficial com ID único de validação é liberado automaticamente.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-3 shrink-0">
            {isEligible ? (
              <Button
                onClick={handleIssueCert}
                className="gap-2 font-bold text-sm bg-violet-600 hover:bg-violet-500 text-white shadow-xl shadow-purple-600/30 py-6 px-8 rounded-2xl"
              >
                <Sparkles className="size-4" /> Emitir Certificado Oficial
              </Button>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-center sm:text-right space-y-1.5 shadow-inner">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Progresso para o Certificado</span>
                <p className="text-xl font-black text-white font-mono">{overallProgress}% Concluído</p>
                <div className="h-2 w-40 rounded-full bg-white/10 overflow-hidden">
                  <div
                    style={{ width: `${overallProgress}%` }}
                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Certificate Preview / Viewer */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="size-5 text-violet-400" />
              {selectedCert ? 'Seu Certificado Oficial' : 'Prévia do Certificado de Conclusão'}
            </h3>
            {selectedCert && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs font-bold border-white/10 text-white">
                  <Printer className="size-3.5" /> Imprimir / PDF
                </Button>
                <Link href={`/certificados/validar/${selectedCert.validationCode}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold border-violet-500/30 text-violet-300">
                    <ExternalLink className="size-3.5" /> Página Pública
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Stylized Certificate Frame */}
          <div className="relative rounded-3xl border-4 border-double border-violet-500/40 bg-gradient-to-b from-[#141224] via-[#0f0e1a] to-[#0a0910] p-8 sm:p-12 shadow-2xl overflow-hidden text-center space-y-8">
            {/* Watermark */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]"
            >
              <Award className="size-[500px]" />
            </div>

            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <div className="flex flex-col items-center gap-2">
                <Logo />
                <p className="text-xs font-black uppercase tracking-widest text-violet-400 mt-2">
                  Certificado Oficial de Formação Profissional
                </p>
              </div>

              <div className="space-y-2 py-4">
                <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Certificamos com distinção que</p>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight underline decoration-violet-500/60 underline-offset-8">
                  {selectedCert?.recipientName || profile?.name || 'William Santos'}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                Concluiu com êxito a formação intensiva em{' '}
                <strong className="text-white font-bold">
                  {selectedCert?.pathTitle || 'Formação Desenvolvedor Full Stack JavaScript'}
                </strong>
                , cumprindo todas as aulas práticas, projetos de portfólio e avaliações com nota de corte mínima de 70%, totalizando{' '}
                <strong className="text-white font-bold">{selectedCert?.hours || 120} horas</strong> de capacitação prática com inteligência artificial.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-white/10 items-center text-xs text-zinc-400">
                <div>
                  <p className="font-bold text-white">Data de Emissão</p>
                  <p className="mt-0.5 font-mono">{selectedCert?.completionDate || new Date().toLocaleDateString('pt-BR')}</p>
                </div>

                <div className="hidden sm:block">
                  <div className="mx-auto w-32 border-b border-zinc-600 mb-1" />
                  <p className="font-bold text-white">DevPath AI Education</p>
                  <p className="text-[10px] text-zinc-500">Coordenação Pedagógica</p>
                </div>

                <div>
                  <p className="font-bold text-white">Código de Autenticação</p>
                  <p className="mt-0.5 font-mono text-violet-400 font-bold">{selectedCert?.validationCode || 'DEVPATH-2026-AUTH-982X'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gamified Achievements & Badges Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="size-5 text-amber-400" />
              Conquistas & Badges Gamificadas
            </h3>
            <span className="text-xs text-zinc-400 font-semibold">
              {badgesList.filter((b) => b.unlocked).length} de {badgesList.length} desbloqueadas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badgesList.map((badge) => (
              <div
                key={badge.id}
                className={`p-5 rounded-3xl border transition-all flex items-start gap-4 ${
                  badge.unlocked
                    ? 'border-violet-500/30 bg-[#12111d] shadow-lg shadow-purple-950/20'
                    : 'border-white/5 bg-[#12111d]/40 opacity-50'
                }`}
              >
                <span className="text-3xl shrink-0">{badge.icon}</span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-white">{badge.name}</h4>
                    {badge.unlocked ? (
                      <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="size-3.5 text-zinc-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
