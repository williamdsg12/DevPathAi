'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Download,
  ExternalLink,
  GraduationCap,
  Lock,
  Printer,
  QrCode,
  ShieldCheck,
  Sparkles,
  Trophy,
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

export default function CertificatesPage() {
  const { certificates, generateCertificate, overallProgress, profile } = useAppStore()
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
      title="Certificados Oficiais"
      subtitle="Emissão e autenticação pública de certificados de conclusão de formação"
    >
      <div className="space-y-8">
        {/* Header Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-primary/20 bg-primary/5 p-6 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground font-bold">Certificação Oficial</Badge>
              <span className="text-xs text-muted-foreground font-semibold">Validação por Hash Criptográfico</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Comprove sua Especialização
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Ao concluir 100% dos módulos da sua trilha e atingir nota mínima de 70% em todas as avaliações, seu certificado oficial com ID único de validação é liberado automaticamente.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            {isEligible ? (
              <Button
                onClick={handleIssueCert}
                className="gap-2 font-bold shadow-lg shadow-primary/20 py-6 px-6"
              >
                <Sparkles className="size-4" /> Emitir Certificado Oficial
              </Button>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-3 text-center sm:text-right space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Progresso para o Certificado</span>
                <p className="text-lg font-extrabold text-foreground">{overallProgress}% Concluído</p>
                <Progress value={overallProgress} className="h-1.5 w-36" />
              </div>
            )}
          </div>
        </div>

        {/* Certificate Viewer Card */}
        {selectedCert ? (
          <div className="space-y-4">
            <div className="flex justify-end gap-2 print:hidden">
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
                <Printer className="size-3.5" /> Imprimir / PDF
              </Button>
              <Link href={`/certificados/validar/${selectedCert.validationCode}`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <ExternalLink className="size-3.5" /> Página Pública de Validação
                </Button>
              </Link>
            </div>

            {/* Official Stylized Certificate */}
            <div className="relative rounded-3xl border-4 border-double border-primary/40 bg-card p-8 sm:p-12 shadow-2xl overflow-hidden print:border-2 print:p-6">
              {/* Background watermark */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]"
              >
                <Award className="size-96" />
              </div>

              <div className="relative z-10 text-center space-y-8">
                {/* Header */}
                <div className="flex flex-col items-center gap-2">
                  <Logo />
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mt-2">
                    Certificado Oficial de Formação Profissional
                  </p>
                </div>

                {/* Recipient */}
                <div className="space-y-2 py-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Certificamos que</p>
                  <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground underline decoration-primary/50 underline-offset-8">
                    {selectedCert.recipientName}
                  </h3>
                </div>

                {/* Description */}
                <p className="max-w-2xl mx-auto text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Concluiu com êxito a formação intensiva em <strong className="text-foreground">{selectedCert.pathTitle}</strong>, cumprindo todas as aulas teóricas, desafios práticos, projetos de módulos e avaliações oficiais com carga horária de <strong className="text-foreground">{selectedCert.hours} horas</strong> e aproveitamento de <strong className="text-foreground">{selectedCert.averageGrade}%</strong>.
                </p>

                {/* Footer Signatures & Hash */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-border/80 items-center text-xs">
                  <div>
                    <p className="font-bold text-foreground">Data de Conclusão</p>
                    <p className="text-muted-foreground mt-0.5">{selectedCert.completionDate}</p>
                  </div>

                  <div className="hidden sm:block">
                    <div className="mx-auto w-32 border-b border-foreground/60 mb-1" />
                    <p className="font-bold text-foreground">DevPath AI Education</p>
                    <p className="text-[10px] text-muted-foreground">Coordenação Pedagógica</p>
                  </div>

                  <div>
                    <p className="font-bold text-foreground">Código de Autenticidade</p>
                    <p className="font-mono text-[11px] text-primary font-bold mt-0.5">{selectedCert.validationCode}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Card className="border-dashed border-border/80 p-12 text-center space-y-4">
            <div className="grid size-16 place-items-center rounded-3xl bg-muted text-muted-foreground mx-auto">
              <Award className="size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Nenhum certificado emitido ainda</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                Você ainda não concluiu todos os requisitos. Para desbloquear sua certificação oficial, complete todos os 11 módulos da sua trilha e obtenha aprovação nas avaliações teóricas e práticas.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/trilha">
                <Button className="gap-2 font-bold text-xs">
                  Acessar Minha Trilha de Estudos <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
