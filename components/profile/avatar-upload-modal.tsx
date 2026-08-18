'use client'

import { useState, useRef, ChangeEvent, DragEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Camera, Upload, Trash2, Check, AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface AvatarUploadModalProps {
  isOpen: boolean
  onClose: () => void
  currentAvatarUrl?: string
  userName: string
  onSaveAvatar: (dataUrl: string) => void
  onRemoveAvatar: () => void
}

export function AvatarUploadModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  userName,
  onSaveAvatar,
  onRemoveAvatar,
}: AvatarUploadModalProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initials = userName ? userName.slice(0, 2).toUpperCase() : 'US'

  function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  function handleConfirm() {
    if (!preview) return
    setIsSaving(true)
    setTimeout(() => {
      onSaveAvatar(preview)
      setIsSaving(false)
      toast.success('Foto de perfil atualizada com sucesso!')
      onClose()
    }, 300)
  }

  function handleRemove() {
    onRemoveAvatar()
    setPreview(null)
    toast.success('Foto de perfil removida.')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#0f0e17] border-white/10 text-white rounded-3xl p-6 shadow-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-black flex items-center gap-2 text-white">
            <Camera className="size-5 text-cyan-400" /> Alterar Foto de Perfil
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            Adicione uma foto profissional para seu currículo, portfólio público e comunidade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Avatar Preview Section */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative size-32 rounded-full overflow-hidden border-4 border-cyan-500/30 bg-[#171526] shadow-xl flex items-center justify-center">
              {preview || currentAvatarUrl ? (
                <img
                  src={preview || currentAvatarUrl}
                  alt={userName}
                  className="size-full object-cover"
                />
              ) : (
                <div className="text-3xl font-black text-white">{initials}</div>
              )}
            </div>

            {preview && (
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[11px] font-bold">
                Pré-visualização da nova foto
              </Badge>
            )}
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
              isDragging
                ? 'border-cyan-400 bg-cyan-500/10'
                : 'border-white/10 bg-white/[0.02] hover:border-cyan-500/40 hover:bg-white/[0.04]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={onInputChange}
              className="hidden"
            />
            <Upload className="mx-auto size-8 text-zinc-400 mb-2" />
            <p className="text-xs font-bold text-white">
              Arraste sua imagem aqui ou <span className="text-cyan-400 underline">clique para selecionar</span>
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">PNG, JPG ou WEBP até 5MB</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
            {currentAvatarUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5 text-xs font-bold"
              >
                <Trash2 className="size-3.5" /> Remover Foto
              </Button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="border-white/10 text-zinc-400 hover:text-white text-xs font-bold"
              >
                Cancelar
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={!preview || isSaving}
                onClick={handleConfirm}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" /> Salvar Foto
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
