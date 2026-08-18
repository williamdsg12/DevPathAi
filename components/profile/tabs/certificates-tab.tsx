'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import type { UserCertificateRecord } from '@/lib/types'
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building,
  Check,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export function CertificatesTab() {
  const {
    certificates: platformCerts,
    userCertificates,
    addUserCertificate,
    updateUserCertificate,
    deleteUserCertificate,
  } = useAppStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [institution, setInstitution] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [validationUrl, setValidationUrl] = useState('')
  const [certificateCode, setCertificateCode] = useState('')

  function openNewModal() {
    setEditingId(null)
    setName('')
    setInstitution('')
    setIssueDate(new Date().toISOString().slice(0, 10))
    setValidationUrl('')
    setCertificateCode('')
    setIsModalOpen(true)
  }

  function openEditModal(cert: UserCertificateRecord) {
    setEditingId(cert.id)
    setName(cert.name)
    setInstitution(cert.institution)
    setIssueDate(cert.issueDate)
    setValidationUrl(cert.validationUrl || '')
    setCertificateCode(cert.certificateCode || '')
    setIsModalOpen(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !institution.trim() || !issueDate) {
      toast.error('Preencha os campos obrigatórios: Nome do Certificado, Instituição e Data.')
      return
    }

    if (editingId) {
      updateUserCertificate(editingId, {
        name,
        institution,
        issueDate,
        validationUrl,
        certificateCode,
      })
      toast.success('Certificado atualizado com sucesso!')
    } else {
      addUserCertificate({
        name,
        institution,
        issueDate,
        validationUrl,
        certificateCode,
        isOfficialDevPath: false,
      })
      toast.success('Certificado adicionado ao seu perfil!')
    }

    setIsModalOpen(false)
  }

  function handleDelete(id: string) {
    deleteUserCertificate(id)
    setDeleteConfirmId(null)
    toast.success('Certificado removido.')
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-[#0e0d16] text-white rounded-3xl shadow-xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black text-white flex items-center gap-2">
              <Award className="size-5 text-cyan-400" /> Certificados e Conquistas Profissionais
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Gerencie seus certificados emitidos pela DevPath AI e cadastre certificações externas de tecnologia.
            </CardDescription>
          </div>

          <Button
            type="button"
            onClick={openNewModal}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs gap-1.5 rounded-xl shadow-lg shadow-cyan-500/20 shrink-0 cursor-pointer"
          >
            <Plus className="size-4" /> Adicionar Certificado
          </Button>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Section 1: Certificados DevPath AI Oficiais */}
          {platformCerts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <ShieldCheck className="size-4" /> Certificados Oficiais DevPath AI ({platformCerts.length})
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {platformCerts.map((cert) => (
                  <div
                    key={cert.id}
                    className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <Badge className="bg-cyan-500 text-black font-black text-[10px] uppercase tracking-wider">
                          Oficial Verificado
                        </Badge>
                        <span className="text-[11px] font-mono text-zinc-400">
                          {cert.verificationCode}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-white">{cert.trackTitle}</h4>
                        <p className="text-xs text-cyan-300 font-semibold mt-0.5">
                          DevPath AI — Carga Horária: {cert.totalHours} horas
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                        <Calendar className="size-3.5 text-zinc-500" />
                        <span>Emitido em {cert.issuedAt}</span>
                      </div>
                    </div>

                    <Link href={`/certificados`} className="w-full">
                      <Button
                        type="button"
                        size="sm"
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs gap-1.5"
                      >
                        <ExternalLink className="size-3.5" /> Visualizar Certificado Oficial
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Certificados Cadastrados */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Certificações & Cursos Concluídos ({userCertificates.length})
            </h3>

            {userCertificates.length === 0 && platformCerts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-10 text-center space-y-3">
                <Award className="size-10 text-zinc-600 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Nenhum certificado registrado</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Conclua as formações oficiais para receber certificados com validação pública ou cadastre suas certificações externas.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={openNewModal}
                  className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-bold gap-1.5 rounded-xl mt-2"
                >
                  <Plus className="size-4" /> Cadastrar Certificado Externo
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {userCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="rounded-2xl border border-white/5 bg-black/30 p-5 flex flex-col justify-between gap-4 transition-all hover:border-cyan-500/30"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <Badge
                          variant="outline"
                          className="border-white/10 text-zinc-300 text-[10px] font-bold"
                        >
                          {cert.isOfficialDevPath ? 'DevPath AI' : 'Certificação Externa'}
                        </Badge>

                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(cert)}
                            className="size-7 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                          >
                            <Edit2 className="size-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirmId(cert.id)}
                            className="size-7 rounded-lg text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-white">{cert.name}</h4>
                        <p className="text-xs text-cyan-300 font-semibold flex items-center gap-1 mt-0.5">
                          <Building className="size-3.5" /> {cert.institution}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
                        <span>Data: {cert.issueDate}</span>
                        {cert.certificateCode && (
                          <>
                            <span>•</span>
                            <span>Cód: {cert.certificateCode}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {cert.validationUrl && (
                      <a
                        href={cert.validationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full pt-2 border-t border-white/5"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full text-xs font-bold gap-1.5 border-white/10 bg-white/[0.02] text-zinc-300 hover:text-white"
                        >
                          <ExternalLink className="size-3.5 text-cyan-400" /> Validar Autenticidade
                        </Button>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Criação / Edição */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-[#0f0e17] border-white/10 text-white rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <Award className="size-5 text-cyan-400" />
              {editingId ? 'Editar Certificado' : 'Cadastrar Certificado'}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Adicione suas certificações de cursos, workshops e exames de proficiência.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Nome do Certificado *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Formação React Developer, AWS Certified Cloud Practitioner"
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Instituição Emissora *</Label>
              <Input
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Ex: DevPath AI, Udemy, Coursera, AWS, Google Cloud"
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-300">Data de Emissão *</Label>
                <Input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-300">Código de Validação</Label>
                <Input
                  value={certificateCode}
                  onChange={(e) => setCertificateCode(e.target.value)}
                  placeholder="Ex: CERT-9921-X"
                  className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Link de Validação Online (URL)</Label>
              <Input
                value={validationUrl}
                onChange={(e) => setValidationUrl(e.target.value)}
                placeholder="https://sua-plataforma.com/validar/cert-123"
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="border-white/10 text-zinc-400 hover:text-white text-xs font-bold"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                size="sm"
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                <Check className="size-3.5" /> Salvar Certificado
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={Boolean(deleteConfirmId)} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-sm bg-[#0f0e17] border-white/10 text-white rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="space-y-2 text-center">
            <div className="size-12 rounded-full bg-red-500/10 text-red-400 grid place-items-center mx-auto border border-red-500/20">
              <AlertCircle className="size-6" />
            </div>
            <DialogTitle className="text-base font-black text-white">
              Excluir Certificado?
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Esta ação removerá este certificado do seu currículo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmId(null)}
              className="border-white/10 text-zinc-300 hover:text-white text-xs font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs gap-1.5"
            >
              <Trash2 className="size-3.5" /> Confirmar Exclusão
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
