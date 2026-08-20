'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  Cpu,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileCode2,
  FileText,
  Filter,
  Flame,
  FolderGit2,
  GitBranch,
  History,
  Info,
  Layers,
  Lightbulb,
  ListFilter,
  Lock,
  MessageSquare,
  Play,
  Plus,
  Power,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Target,
  Terminal,
  Trash2,
  Trophy,
  Upload,
  User,
  Users,
  Wrench,
  X,
  XCircle,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { AdminShell } from '@/components/admin/admin-shell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/lib/store'
import { AI_PERSONAS, calculatePromptMetrics } from '@/lib/ai/prompt-compiler'
import type {
  AIInstruction,
  AIInstructionCategory,
  AIInstructionPriority,
  AIModelProvider,
  AIPlaygroundMessage,
  AIPlaygroundPersona,
  AIPromptBlockKey,
  AIKnowledgeItem,
} from '@/lib/types'

const CATEGORIES: AIInstructionCategory[] = [
  'Comportamento',
  'Pedagogia',
  'Programação',
  'Avaliação',
  'Exercícios',
  'Trilhas',
  'Carreira',
  'Código',
  'Segurança',
  'Personalidade',
  'Tom de voz',
  'Regras',
  'Sistema',
  'Outros',
]

const MODELS: { id: string; name: string; provider: AIModelProvider; badge: string }[] = [
  { id: 'gemini-1.5-pro', name: 'Google Gemini 1.5 Pro', provider: 'gemini', badge: 'Recomendado' },
  { id: 'gemini-1.5-flash', name: 'Google Gemini 1.5 Flash', provider: 'gemini', badge: 'Alta Velocidade' },
  { id: 'gpt-4o', name: 'OpenAI GPT-4o (Omni)', provider: 'openai', badge: 'Alta Precisão' },
  { id: 'gpt-4o-mini', name: 'OpenAI GPT-4o Mini', provider: 'openai', badge: 'Econômico' },
  { id: 'claude-3-5-sonnet', name: 'Anthropic Claude 3.5 Sonnet', provider: 'anthropic', badge: 'Raciocínio' },
  { id: 'deepseek-v3', name: 'DeepSeek V3 (Chat)', provider: 'deepseek', badge: 'Open Source' },
]

export default function AdminAIPage() {
  const {
    aiConfig,
    aiInstructions,
    aiPromptBlocks,
    aiVersions,
    aiLogs,
    aiKnowledge,
    compiledPrompt,
    updateAIConfig,
    addAIInstruction,
    updateAIInstruction,
    deleteAIInstruction,
    toggleAIInstruction,
    updatePromptBlock,
    togglePromptBlock,
    publishAIVersion,
    restoreAIVersion,
    toggleAIAgentStatus,
    recordAIAudit,
    addAIKnowledge,
    updateAIKnowledge,
    deleteAIKnowledge,
    toggleAIKnowledge,
  } = useAppStore()

  const [activeTab, setActiveTab] = useState<string>('dashboard')

  // --- Configuration Form State ---
  const [configForm, setConfigForm] = useState(aiConfig)
  useEffect(() => {
    setConfigForm(aiConfig)
  }, [aiConfig])

  // --- Instruction Management State ---
  const [searchInstruction, setSearchInstruction] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false)
  const [editingInstruction, setEditingInstruction] = useState<AIInstruction | null>(null)
  const [instructionForm, setInstructionForm] = useState<{
    title: string
    description: string
    content: string
    category: string
    priority: AIInstructionPriority
    active: boolean
  }>({
    title: '',
    description: '',
    content: '',
    category: 'Pedagogia',
    priority: 'alta',
    active: true,
  })

  // --- Knowledge Base State ---
  const [searchKnowledge, setSearchKnowledge] = useState('')
  const [knowledgeCategoryFilter, setKnowledgeCategoryFilter] = useState<string>('all')
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false)
  const [editingKnowledgeItem, setEditingKnowledgeItem] = useState<AIKnowledgeItem | null>(null)
  const [knowledgeForm, setKnowledgeForm] = useState<{
    title: string
    category: string
    tags: string
    content: string
    sourceUrl: string
    active: boolean
  }>({
    title: '',
    category: 'Programação',
    tags: 'javascript, es6, frontend',
    content: '',
    sourceUrl: '',
    active: true,
  })

  // --- Version Publish Modal State ---
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [publishChangeDescription, setPublishChangeDescription] = useState('')

  // --- Playground State ---
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('iniciante')
  const [playgroundMessages, setPlaygroundMessages] = useState<AIPlaygroundMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: aiConfig.initialGreeting || 'Olá! Sou o seu mentor do DEVPATH AI. Como posso te ajudar hoje?',
      timestamp: new Date().toLocaleTimeString(),
    },
  ])
  const [playgroundInput, setPlaygroundInput] = useState('')
  const [isSendingPlayground, setIsSendingPlayground] = useState(false)

  // Current active persona object
  const selectedPersona: AIPlaygroundPersona = useMemo(() => {
    return AI_PERSONAS.find((p) => p.id === selectedPersonaId) || AI_PERSONAS[0]
  }, [selectedPersonaId])

  // Filtered Instructions
  const filteredInstructions = useMemo(() => {
    return aiInstructions.filter((inst) => {
      const matchSearch =
        inst.title.toLowerCase().includes(searchInstruction.toLowerCase()) ||
        inst.content.toLowerCase().includes(searchInstruction.toLowerCase()) ||
        inst.description.toLowerCase().includes(searchInstruction.toLowerCase())
      const matchCat = categoryFilter === 'all' || inst.category === categoryFilter
      const matchPriority = priorityFilter === 'all' || inst.priority === priorityFilter
      return matchSearch && matchCat && matchPriority
    })
  }, [aiInstructions, searchInstruction, categoryFilter, priorityFilter])

  // Filtered Knowledge Base
  const filteredKnowledge = useMemo(() => {
    return (aiKnowledge || []).filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchKnowledge.toLowerCase()) ||
        item.content.toLowerCase().includes(searchKnowledge.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchKnowledge.toLowerCase()))
      const matchCat = knowledgeCategoryFilter === 'all' || item.category === knowledgeCategoryFilter
      return matchSearch && matchCat
    })
  }, [aiKnowledge, searchKnowledge, knowledgeCategoryFilter])

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (isInstructionModalOpen || isPublishModalOpen || isKnowledgeModalOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isInstructionModalOpen, isPublishModalOpen, isKnowledgeModalOpen])

  // Prompt Metrics
  const promptMetrics = useMemo(() => {
    return calculatePromptMetrics(compiledPrompt)
  }, [compiledPrompt])

  // Handle Save Configuration
  function handleSaveConfig() {
    updateAIConfig(configForm)
    toast.success('Configurações da IA salvas no rascunho com sucesso!')
  }

  // Handle Instruction Create / Edit
  function handleOpenCreateInstruction() {
    setEditingInstruction(null)
    setInstructionForm({
      title: '',
      description: '',
      content: '',
      category: 'Pedagogia',
      priority: 'alta',
      active: true,
    })
    setIsInstructionModalOpen(true)
  }

  function handleOpenEditInstruction(inst: AIInstruction) {
    setEditingInstruction(inst)
    setInstructionForm({
      title: inst.title,
      description: inst.description,
      content: inst.content,
      category: inst.category,
      priority: inst.priority,
      active: inst.active,
    })
    setIsInstructionModalOpen(true)
  }

  function handleSaveInstruction(e: React.FormEvent) {
    e.preventDefault()
    if (!instructionForm.title.trim() || !instructionForm.content.trim()) {
      toast.error('Preencha o título e o conteúdo da instrução.')
      return
    }

    if (editingInstruction) {
      updateAIInstruction(editingInstruction.id, instructionForm)
      toast.success('Instrução de treinamento atualizada com sucesso!')
    } else {
      addAIInstruction(instructionForm)
      toast.success('Nova instrução de treinamento adicionada!')
    }

    setIsInstructionModalOpen(false)
  }

  // Handle Knowledge Base Create / Edit
  function handleOpenCreateKnowledge() {
    setEditingKnowledgeItem(null)
    setKnowledgeForm({
      title: '',
      category: 'Programação',
      tags: 'javascript, es6, fundamentos',
      content: '',
      sourceUrl: '',
      active: true,
    })
    setIsKnowledgeModalOpen(true)
  }

  function handleOpenEditKnowledge(item: AIKnowledgeItem) {
    setEditingKnowledgeItem(item)
    setKnowledgeForm({
      title: item.title,
      category: item.category,
      tags: item.tags.join(', '),
      content: item.content,
      sourceUrl: item.sourceUrl || '',
      active: item.active,
    })
    setIsKnowledgeModalOpen(true)
  }

  function handleSaveKnowledge(e: React.FormEvent) {
    e.preventDefault()
    if (!knowledgeForm.title.trim() || !knowledgeForm.content.trim()) {
      toast.error('Preencha o título e o conteúdo do documento.')
      return
    }

    const tagsArray = knowledgeForm.tags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)

    if (editingKnowledgeItem) {
      updateAIKnowledge(editingKnowledgeItem.id, {
        title: knowledgeForm.title,
        category: knowledgeForm.category,
        tags: tagsArray,
        content: knowledgeForm.content,
        sourceUrl: knowledgeForm.sourceUrl || undefined,
        active: knowledgeForm.active,
      })
      toast.success('Documento da Base de Conhecimento atualizado!')
    } else {
      addAIKnowledge({
        title: knowledgeForm.title,
        category: knowledgeForm.category,
        tags: tagsArray,
        content: knowledgeForm.content,
        sourceUrl: knowledgeForm.sourceUrl || undefined,
        active: knowledgeForm.active,
      })
      toast.success('Novo documento indexado na Base de Conhecimento!')
    }

    setIsKnowledgeModalOpen(false)
  }

  // Handle Publish Version
  function handleExecutePublish() {
    if (!publishChangeDescription.trim()) {
      toast.error('Informe uma descrição das alterações para a versão.')
      return
    }
    publishAIVersion(publishChangeDescription)
    setIsPublishModalOpen(false)
    setPublishChangeDescription('')
    toast.success('🎉 Nova versão da IA publicada e ativada para todos os alunos!')
    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } })
    } catch {}
  }

  // Handle Playground Chat
  async function handleSendPlaygroundMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!playgroundInput.trim() || isSendingPlayground) return

    const userText = playgroundInput
    setPlaygroundInput('')

    const newUserMsg: AIPlaygroundMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString(),
    }

    setPlaygroundMessages((prev) => [...prev, newUserMsg])
    setIsSendingPlayground(true)

    try {
      const res = await fetch('/api/ai/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...playgroundMessages, newUserMsg],
          persona: selectedPersona,
          activeConfig: aiConfig,
          activeInstructions: aiInstructions,
          activeBlocks: aiPromptBlocks,
          knowledgeBase: aiKnowledge,
        }),
      })

      if (!res.ok) throw new Error('Falha na resposta do servidor')
      const data = await res.json()

      const assistantMsg: AIPlaygroundMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Resposta gerada.',
        timestamp: new Date().toLocaleTimeString(),
        tokens: data.tokens,
        latencyMs: data.latencyMs,
        model: data.model || aiConfig.model,
        versionUsed: aiConfig.publishedVersion,
      }

      setPlaygroundMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      toast.error('Erro ao comunicar com o modelo no playground.')
    } finally {
      setIsSendingPlayground(false)
    }
  }

  return (
    <AdminShell
      title="DEVPATH AI Engine"
      subtitle="Painel administrativo de configuração, treinamento pedagógico, versionamento e testes da IA central"
    >
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        {/* =========================================================================
            1. STATUS BANNER & HERO CONTROLS
           ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-950/70 via-[#131124] to-[#0a0914] p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 size-80 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <Badge
                  className={`font-black text-xs px-3 py-1 gap-1.5 shadow-md ${
                    aiConfig.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40'
                  }`}
                >
                  <span
                    className={`size-2 rounded-full ${
                      aiConfig.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                    }`}
                  />
                  {aiConfig.status === 'active' ? '🟢 IA ATIVA NO SISTEMA' : '🔴 IA DESATIVADA'}
                </Badge>

                <Badge variant="outline" className="text-zinc-300 border-white/10 font-mono text-xs">
                  Versão: {aiConfig.publishedVersion}
                </Badge>

                <Badge className="bg-violet-950/80 border border-violet-500/40 text-violet-300 font-bold text-xs">
                  <Cpu className="size-3 mr-1" /> {aiConfig.model}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {aiConfig.name}
              </h1>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                {aiConfig.description}
              </p>
            </div>

            {/* Quick Actions Header */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                variant="outline"
                onClick={toggleAIAgentStatus}
                className={`text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  aiConfig.status === 'active'
                    ? 'border-red-500/30 text-red-400 hover:bg-red-950/30'
                    : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30'
                }`}
              >
                <Power className="size-3.5 mr-1.5" />
                {aiConfig.status === 'active' ? 'Desativar IA' : 'Ativar IA'}
              </Button>

              <Button
                onClick={() => setIsPublishModalOpen(true)}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black text-xs px-5 py-5 rounded-xl shadow-lg shadow-violet-950/60 cursor-pointer"
              >
                <Upload className="size-3.5 mr-1.5" /> Publicar Alterações
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/5 pt-5 mt-6">
            <div className="p-3 rounded-2xl bg-black/30 border border-white/5 space-y-0.5 text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Instruções Ativas</span>
              <p className="text-xl font-black text-white font-mono">
                {aiInstructions.filter((i) => i.active).length} / {aiInstructions.length}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-black/30 border border-white/5 space-y-0.5 text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Tokens Estimados (Prompt)</span>
              <p className="text-xl font-black text-violet-400 font-mono">
                ~{promptMetrics.estimatedTokens.toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-black/30 border border-white/5 space-y-0.5 text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Interações Registradas</span>
              <p className="text-xl font-black text-emerald-400 font-mono">
                {aiConfig.totalInteractions.toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-black/30 border border-white/5 space-y-0.5 text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Versões Históricas</span>
              <p className="text-xl font-black text-amber-400 font-mono">
                {aiVersions.length}
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. MAIN TABS NAVIGATION (8 AREAS)
           ========================================================================= */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto no-scrollbar pb-2">
            <TabsList className="bg-[#100f1c] border border-white/10 p-1.5 rounded-2xl gap-1.5 min-w-max">
              <TabsTrigger
                value="dashboard"
                className="text-xs font-bold gap-1.5 data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-xl px-3.5 py-2"
              >
                <Activity className="size-3.5" /> Dashboard
              </TabsTrigger>

              <TabsTrigger
                value="configuracoes"
                className="text-xs font-bold gap-1.5 data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-xl px-3.5 py-2"
              >
                <Settings className="size-3.5" /> Configuração
              </TabsTrigger>

              <TabsTrigger
                value="treinamento"
                className="text-xs font-bold gap-1.5 data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-xl px-3.5 py-2"
              >
                <Brain className="size-3.5" /> Treinamento ({aiInstructions.length})
              </TabsTrigger>

              <TabsTrigger
                value="construtor"
                className="text-xs font-bold gap-1.5 data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-xl px-3.5 py-2"
              >
                <Layers className="size-3.5" /> Construtor de IA
              </TabsTrigger>

              <TabsTrigger
                value="conhecimento"
                className="text-xs font-bold gap-1.5 data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-xl px-3.5 py-2"
              >
                <BookOpen className="size-3.5 text-emerald-400" /> Base de Conhecimento RAG ({(aiKnowledge || []).length})
              </TabsTrigger>

              <TabsTrigger
                value="prompt-final"
                className="text-xs font-bold gap-1.5 data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-xl px-3.5 py-2"
              >
                <FileCode2 className="size-3.5" /> Prompt Final
              </TabsTrigger>

              <TabsTrigger
                value="playground"
                className="text-xs font-bold gap-1.5 data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-xl px-3.5 py-2"
              >
                <Terminal className="size-3.5 text-cyan-400" /> Playground
              </TabsTrigger>

              <TabsTrigger
                value="versoes"
                className="text-xs font-bold gap-1.5 data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-xl px-3.5 py-2"
              >
                <GitBranch className="size-3.5" /> Versionamento ({aiVersions.length})
              </TabsTrigger>

              <TabsTrigger
                value="historico"
                className="text-xs font-bold gap-1.5 data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-xl px-3.5 py-2"
              >
                <History className="size-3.5" /> Histórico
              </TabsTrigger>
            </TabsList>
          </div>

          {/* =======================================================================
              TAB 1: DASHBOARD
             ======================================================================= */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Card 1: Configuration Summary */}
              <Card className="border-white/10 bg-[#100f1c] rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Settings className="size-4 text-violet-400" /> Configuração do Modelo
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-zinc-400">
                    {aiConfig.provider.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-2.5 text-xs text-zinc-300">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-500">Modelo:</span>
                    <span className="font-bold text-white">{aiConfig.model}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-500">Temperatura:</span>
                    <span className="font-mono text-violet-300">{aiConfig.temperature}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-500">Limite de Tokens:</span>
                    <span className="font-mono text-white">{aiConfig.maxTokens}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-500">Idioma Padrão:</span>
                    <span>{aiConfig.defaultLanguage}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Modo Fallback:</span>
                    <span className="text-emerald-400 font-bold">Ativado (Sem interrupções)</span>
                  </div>
                </div>

                <Button
                  onClick={() => setActiveTab('configuracoes')}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-bold rounded-xl border-white/10 text-zinc-300 hover:text-white"
                >
                  Editar Parâmetros <ChevronRight className="size-3.5 ml-1" />
                </Button>
              </Card>

              {/* Card 2: Training & Instructions Summary */}
              <Card className="border-white/10 bg-[#100f1c] rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Brain className="size-4 text-purple-400" /> Treinamento Pedagógico
                  </h3>
                  <Badge className="bg-purple-950/60 border border-purple-500/30 text-purple-300 text-[10px]">
                    {aiInstructions.length} regras
                  </Badge>
                </div>

                <div className="space-y-2.5 text-xs text-zinc-300">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-500">Prioridade Alta:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {aiInstructions.filter((i) => i.priority === 'alta').length}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-500">Prioridade Média/Baixa:</span>
                    <span className="font-mono text-zinc-300">
                      {aiInstructions.filter((i) => i.priority !== 'alta').length}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-500">Blocos Construtores Ativos:</span>
                    <span className="font-mono text-white">
                      {aiPromptBlocks.filter((b) => b.enabled).length} / {aiPromptBlocks.length}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Último Treinamento:</span>
                    <span className="text-zinc-400 font-mono text-[11px]">
                      {new Date(aiConfig.lastTrainedAt || Date.now()).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setActiveTab('treinamento')}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-bold rounded-xl border-white/10 text-zinc-300 hover:text-white"
                >
                  Gerenciar Instruções <ChevronRight className="size-3.5 ml-1" />
                </Button>
              </Card>

              {/* Card 3: Playground & Testing Shortcut */}
              <Card className="border-violet-500/30 bg-gradient-to-b from-[#18142a] to-[#100e1c] rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="size-4 text-cyan-400" /> Playground de Testes
                  </h3>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px]">
                    Multi-Perfis
                  </Badge>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  Converse com a IA simulando diferentes níveis de alunos (iniciante, intermediário, avançado) antes de publicar alterações para os alunos reais.
                </p>

                <div className="pt-2">
                  <Button
                    onClick={() => setActiveTab('playground')}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs py-5 rounded-xl shadow-lg shadow-violet-950/60"
                  >
                    <Play className="size-3.5 mr-1.5 fill-white" /> Abrir Playground de Testes
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* =======================================================================
              TAB 2: CONFIGURAÇÕES GERAIS
             ======================================================================= */}
          <TabsContent value="configuracoes" className="space-y-6">
            <Card className="border-white/10 bg-[#100f1c] rounded-3xl p-6 sm:p-8 space-y-8">
              <div className="border-b border-white/5 pb-4">
                <h2 className="text-lg font-bold text-white">Parâmetros Centrais da IA</h2>
                <p className="text-xs text-zinc-400">
                  Defina o modelo subjacente, parâmetros de inferência e a mensagem de inicialização.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Nome do Agente de IA</label>
                  <Input
                    value={configForm.name}
                    onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })}
                    className="bg-black/40 border-white/10 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Modelo de Inteligência Artificial</label>
                  <select
                    value={configForm.model}
                    onChange={(e) => {
                      const sel = MODELS.find((m) => m.id === e.target.value)
                      setConfigForm({
                        ...configForm,
                        model: e.target.value,
                        provider: sel?.provider || 'gemini',
                      })
                    }}
                    className="w-full h-10 px-3 rounded-md bg-black/40 border border-white/10 text-xs font-bold text-zinc-200 focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    {MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.badge})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-300">Descrição Pública do Assistente</label>
                  <Input
                    value={configForm.description}
                    onChange={(e) => setConfigForm({ ...configForm, description: e.target.value })}
                    className="bg-black/40 border-white/10 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-zinc-300">Temperatura (Criatividade vs Precisão)</label>
                    <span className="text-xs font-mono text-violet-400 font-bold">{configForm.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={configForm.temperature}
                    onChange={(e) => setConfigForm({ ...configForm, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-violet-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>0.0 (Mais Preciso/Determinístico)</span>
                    <span>1.0 (Mais Criativo)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Limite Máximo de Tokens por Resposta</label>
                  <Input
                    type="number"
                    value={configForm.maxTokens}
                    onChange={(e) => setConfigForm({ ...configForm, maxTokens: parseInt(e.target.value) || 2048 })}
                    className="bg-black/40 border-white/10 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-300">Mensagem Inicial de Boas-Vindas</label>
                  <Input
                    value={configForm.initialGreeting}
                    onChange={(e) => setConfigForm({ ...configForm, initialGreeting: e.target.value })}
                    className="bg-black/40 border-white/10 text-xs text-white"
                  />
                </div>

                {/* System Prompt Base - CRITICAL EDITABLE FIELD */}
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                      <FileCode2 className="size-4" /> System Prompt Base (Editável pelo Administrador)
                    </label>
                    <span className="text-[11px] text-zinc-500">
                      Será utilizado para definir o Prompt Mestre definitivo
                    </span>
                  </div>
                  <Textarea
                    rows={6}
                    value={configForm.systemPromptBase}
                    onChange={(e) => setConfigForm({ ...configForm, systemPromptBase: e.target.value })}
                    placeholder="Insira o System Prompt Base da IA..."
                    className="bg-black/60 border-violet-500/30 text-xs font-mono text-zinc-200 leading-relaxed p-4 rounded-2xl focus:border-violet-500 h-[200px] max-h-[350px] min-h-[140px] overflow-y-auto w-full max-w-full resize-y"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/5">
                <Button
                  onClick={handleSaveConfig}
                  className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-6 py-5 rounded-xl cursor-pointer"
                >
                  <Save className="size-3.5 mr-1.5" /> Salvar Configurações no Rascunho
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* =======================================================================
              TAB 3: TREINAMENTO & INSTRUÇÕES
             ======================================================================= */}
          <TabsContent value="treinamento" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Brain className="size-5 text-purple-400" /> Regras de Treinamento Pedagógico
                </h2>
                <p className="text-xs text-zinc-400">
                  Ensine a IA adicionando diretrizes de comportamento, didática, correção e tom de voz.
                </p>
              </div>

              <Button
                onClick={handleOpenCreateInstruction}
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl px-4 py-5 gap-1.5 cursor-pointer"
              >
                <Plus className="size-4" /> Adicionar Nova Instrução
              </Button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-[#100f1c] border border-white/10">
              <div className="relative flex-1 w-full">
                <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Buscar instruções..."
                  value={searchInstruction}
                  onChange={(e) => setSearchInstruction(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-zinc-300 focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="all">Todas as Categorias</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-zinc-300 focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="all">Todas as Prioridades</option>
                <option value="alta">Prioridade Alta</option>
                <option value="media">Prioridade Média</option>
                <option value="baixa">Prioridade Baixa</option>
              </select>
            </div>

            {/* Instruction Cards List */}
            <div className="space-y-3">
              {filteredInstructions.length === 0 ? (
                <div className="p-12 text-center rounded-3xl border border-white/5 bg-[#100f1c] space-y-2">
                  <Brain className="size-8 text-zinc-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white">Nenhuma instrução encontrada</h4>
                  <p className="text-xs text-zinc-400">Adicione uma nova instrução para treinar o comportamento da IA.</p>
                </div>
              ) : (
                filteredInstructions.map((inst) => (
                  <div
                    key={inst.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                      inst.active
                        ? 'border-white/10 bg-[#100f1c] hover:border-violet-500/30'
                        : 'border-white/5 bg-[#0a0910] opacity-60'
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono border-white/10 text-violet-300 bg-violet-950/40"
                        >
                          {inst.category}
                        </Badge>
                        <Badge
                          className={`text-[9px] font-bold uppercase ${
                            inst.priority === 'alta'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : inst.priority === 'media'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          Prioridade {inst.priority}
                        </Badge>
                        <span className="text-[10px] text-zinc-500">v{inst.version}</span>
                      </div>

                      <h3 className="text-sm font-bold text-white">{inst.title}</h3>
                      {inst.description && (
                        <p className="text-xs text-zinc-400">{inst.description}</p>
                      )}

                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-zinc-200 font-mono leading-relaxed">
                        {inst.content}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAIInstruction(inst.id)}
                        className={`text-xs font-bold ${
                          inst.active ? 'text-emerald-400 hover:text-emerald-300' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {inst.active ? 'Ativa' : 'Inativa'}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditInstruction(inst)}
                        className="text-xs text-zinc-400 hover:text-white"
                      >
                        <Edit className="size-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          deleteAIInstruction(inst.id)
                          toast.info('Instrução removida.')
                        }}
                        className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* =======================================================================
              TAB 4: CONSTRUTOR DE IA (BLOCOS ESTRUTURAIS)
             ======================================================================= */}
          <TabsContent value="construtor" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="size-5 text-violet-400" /> Construtor Modular de Comportamento
                </h2>
                <p className="text-xs text-zinc-400">
                  Estruture a persona da IA através de blocos especializados. O sistema compilará tudo automaticamente.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {aiPromptBlocks.map((block) => (
                <Card
                  key={block.id}
                  className={`border transition-all rounded-3xl p-5 space-y-3 ${
                    block.enabled
                      ? 'border-white/10 bg-[#100f1c]'
                      : 'border-white/5 bg-[#090810] opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-violet-400">[{block.key}]</span>
                      <h4 className="text-xs font-bold text-white">{block.title}</h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => togglePromptBlock(block.key)}
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        block.enabled
                          ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-400'
                          : 'border-white/10 bg-white/5 text-zinc-500'
                      }`}
                    >
                      {block.enabled ? 'Ativo' : 'Desativado'}
                    </button>
                  </div>

                  <p className="text-[11px] text-zinc-400">{block.description}</p>

                  <Textarea
                    rows={4}
                    value={block.content}
                    onChange={(e) => updatePromptBlock(block.key, e.target.value)}
                    disabled={!block.enabled}
                    className="text-xs font-mono bg-black/50 border-white/10 text-zinc-200 rounded-xl leading-relaxed h-[130px] max-h-[220px] min-h-[90px] overflow-y-auto w-full max-w-full resize-y"
                  />
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* =======================================================================
              TAB: BASE DE CONHECIMENTO (RAG)
             ======================================================================= */}
          <TabsContent value="conhecimento" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="size-5 text-emerald-400" /> Base de Conhecimento RAG & Documentações
                </h2>
                <p className="text-xs text-zinc-400">
                  Documentos técnicos, diretrizes pedagógicas e manuais indexados que a IA consulta semanticamente para fornecer respostas embasadas (grounded).
                </p>
              </div>

              <Button
                onClick={handleOpenCreateKnowledge}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                <Plus className="size-3.5 mr-1.5" /> Novo Documento / Conhecimento
              </Button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <Input
                  value={searchKnowledge}
                  onChange={(e) => setSearchKnowledge(e.target.value)}
                  placeholder="Buscar na base por título, conteúdo ou tags..."
                  className="pl-10 bg-[#100f1c] border-white/10 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={knowledgeCategoryFilter}
                  onChange={(e) => setKnowledgeCategoryFilter(e.target.value)}
                  className="h-10 px-3 rounded-md bg-[#100f1c] border border-white/10 text-xs font-bold text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="all">Todas as Categorias</option>
                  <option value="Programação">Programação</option>
                  <option value="Plataforma">Plataforma</option>
                  <option value="Pedagogia">Pedagogia</option>
                  <option value="Lógica">Lógica</option>
                  <option value="Arquitetura">Arquitetura</option>
                </select>
              </div>
            </div>

            {/* Knowledge Items Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {filteredKnowledge.length === 0 ? (
                <div className="md:col-span-2 p-12 text-center rounded-3xl border border-dashed border-white/10 bg-[#100f1c]/50 space-y-3">
                  <BookOpen className="size-10 text-zinc-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white">Nenhum documento de conhecimento encontrado</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Indexe novos manuais, documentações oficiais ou regras técnicas para que o motor RAG forneça respostas precisas.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenCreateKnowledge}
                    className="text-xs font-bold border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30"
                  >
                    <Plus className="size-3.5 mr-1.5" /> Adicionar Primeiro Documento
                  </Button>
                </div>
              ) : (
                filteredKnowledge.map((item) => (
                  <Card
                    key={item.id}
                    className={`border transition-all rounded-3xl p-5 space-y-3.5 flex flex-col justify-between ${
                      item.active
                        ? 'border-white/10 bg-[#100f1c]'
                        : 'border-white/5 bg-[#090810] opacity-60'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/40 bg-emerald-950/30 text-emerald-300">
                            {item.category}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[9px] font-bold uppercase ${
                              item.active
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}
                          >
                            {item.active ? 'Indexado & Ativo' : 'Desativado'}
                          </Badge>
                        </div>

                        {item.sourceUrl && (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                          >
                            <ExternalLink className="size-3" /> Fonte Oficial
                          </a>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white leading-tight">{item.title}</h3>

                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-zinc-400 border border-white/5"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-zinc-300 font-mono leading-relaxed max-h-[140px] overflow-y-auto scrollbar-thin">
                        {item.content}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAIKnowledge(item.id)}
                        className={`text-xs font-bold ${
                          item.active ? 'text-emerald-400 hover:text-emerald-300' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {item.active ? 'Ativo' : 'Desativado'}
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditKnowledge(item)}
                          className="text-xs text-zinc-400 hover:text-white"
                        >
                          <Edit className="size-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            deleteAIKnowledge(item.id)
                            toast.info('Documento removido da Base de Conhecimento.')
                          }}
                          className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* =======================================================================
              TAB 5: PROMPT FINAL ATIVO
             ======================================================================= */}
          <TabsContent value="prompt-final" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileCode2 className="size-5 text-emerald-400" /> Prompt Final Compilado (Somente Leitura)
                </h2>
                <p className="text-xs text-zinc-400">
                  Visualização do prompt mestre gerado em tempo real pela junção do System Prompt + Blocos + Instruções ativas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(compiledPrompt)
                    toast.success('Prompt Final copiado para a área de transferência!')
                  }}
                  className="text-xs font-bold rounded-xl border-white/10 text-zinc-300 hover:text-white"
                >
                  <Copy className="size-3.5 mr-1.5" /> Copiar Prompt
                </Button>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-4 gap-3 p-4 rounded-2xl bg-[#100f1c] border border-white/10 text-center text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Caracteres</span>
                <span className="font-mono font-bold text-white">{promptMetrics.characters.toLocaleString('pt-BR')}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Palavras</span>
                <span className="font-mono font-bold text-white">{promptMetrics.words.toLocaleString('pt-BR')}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Tokens Estimados</span>
                <span className="font-mono font-bold text-violet-400">~{promptMetrics.estimatedTokens.toLocaleString('pt-BR')}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Linhas</span>
                <span className="font-mono font-bold text-white">{promptMetrics.lineCount}</span>
              </div>
            </div>

            {/* Prompt Code Viewer */}
            <div className="rounded-3xl border border-white/10 bg-[#090812] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-6 py-3">
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase">
                  system_prompt_compiled.md (Versão {aiConfig.publishedVersion})
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">● Sincronizado</span>
              </div>
              <pre className="p-6 text-xs font-mono text-zinc-200 leading-relaxed overflow-x-auto max-h-[500px] scrollbar-thin">
                {compiledPrompt}
              </pre>
            </div>
          </TabsContent>

          {/* =======================================================================
              TAB 6: PLAYGROUND DE TESTES COM MULTI-PERFIS
             ======================================================================= */}
          <TabsContent value="playground" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-12 items-start">
              {/* Persona Selector Sidebar (4 Cols) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <User className="size-4 text-cyan-400" /> Perfil de Aluno para Teste
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Selecione o contexto com o qual a IA conversará durante a sessão de teste.
                  </p>
                </div>

                <div className="space-y-2">
                  {AI_PERSONAS.map((persona) => (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => setSelectedPersonaId(persona.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        selectedPersonaId === persona.id
                          ? 'border-cyan-500/60 bg-cyan-950/30 text-white ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-950/30'
                          : 'border-white/5 bg-[#100f1c] text-zinc-300 hover:border-white/10 hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{persona.label}</span>
                        <Badge variant="outline" className="text-[9px] font-mono border-white/10 text-zinc-400">
                          {persona.userLevel}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{persona.description}</p>
                    </button>
                  ))}
                </div>

                {/* Persona Context Card */}
                <div className="p-4 rounded-2xl border border-white/5 bg-black/40 space-y-2 text-xs">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Contexto Injetado na Sessão:</span>
                  <p className="text-zinc-300"><strong>Módulo:</strong> {selectedPersona.currentModule}</p>
                  <p className="text-zinc-300"><strong>Aula:</strong> {selectedPersona.currentLesson}</p>
                  <p className="text-zinc-300"><strong>Meta:</strong> {selectedPersona.careerGoal}</p>
                </div>
              </div>

              {/* Chat Window (8 Cols) */}
              <div className="lg:col-span-8 rounded-3xl border border-white/10 bg-[#0d0c16] flex flex-col h-[560px] shadow-2xl overflow-hidden">
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-white/5 bg-[#121120] p-4">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-white">Playground — {aiConfig.model}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setPlaygroundMessages([
                        {
                          id: 'msg-init',
                          role: 'assistant',
                          content: aiConfig.initialGreeting || 'Olá! Sou o seu mentor do DEVPATH AI.',
                          timestamp: new Date().toLocaleTimeString(),
                        },
                      ])
                    }
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    <RotateCcw className="size-3.5 mr-1" /> Limpar Chat
                  </Button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
                  {playgroundMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-violet-600 text-white rounded-br-none shadow-md'
                            : 'bg-[#181628] border border-white/10 text-zinc-200 rounded-bl-none shadow-md'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>

                      {/* Message Meta Info */}
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-1 px-1 font-mono">
                        <span>{msg.timestamp}</span>
                        {msg.latencyMs && <span>• {msg.latencyMs}ms</span>}
                        {msg.tokens && <span>• ~{msg.tokens} tokens</span>}
                      </div>
                    </div>
                  ))}

                  {isSendingPlayground && (
                    <div className="flex items-center gap-2 text-xs text-violet-400 p-2 animate-pulse">
                      <Brain className="size-4 animate-spin" /> IA processando resposta com o prompt ativo...
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendPlaygroundMessage} className="p-3 border-t border-white/5 bg-[#100f1c] flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Mensagem como ${selectedPersona.label}...`}
                    value={playgroundInput}
                    onChange={(e) => setPlaygroundInput(e.target.value)}
                    disabled={isSendingPlayground}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                  />
                  <Button
                    type="submit"
                    disabled={isSendingPlayground || !playgroundInput.trim()}
                    className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-5 py-3 cursor-pointer"
                  >
                    <Send className="size-4" />
                  </Button>
                </form>
              </div>
            </div>
          </TabsContent>

          {/* =======================================================================
              TAB 7: VERSIONAMENTO & PUBLICAÇÃO
             ======================================================================= */}
          <TabsContent value="versoes" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <GitBranch className="size-5 text-violet-400" /> Controle de Versões dos Prompts
                </h2>
                <p className="text-xs text-zinc-400">
                  Todas as alterações publicadas geram um snapshot imutável para auditoria e restauração segura.
                </p>
              </div>

              <Button
                onClick={() => setIsPublishModalOpen(true)}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl px-5 py-5 cursor-pointer"
              >
                <Upload className="size-4 mr-1.5" /> Publicar Nova Versão
              </Button>
            </div>

            <div className="space-y-3">
              {aiVersions.map((v) => (
                <div
                  key={v.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    v.status === 'publicada'
                      ? 'border-emerald-500/40 bg-gradient-to-r from-[#0e1a14] to-[#0a120e] shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/20'
                      : 'border-white/10 bg-[#100f1c]'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-white">{v.versionNumber}</span>
                      <Badge
                        className={`text-[9px] font-bold uppercase ${
                          v.status === 'publicada'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-zinc-800 text-zinc-400 border border-white/5'
                        }`}
                      >
                        {v.status === 'publicada' ? '● Versão Ativa dos Alunos' : 'Arquivada'}
                      </Badge>
                      <span className="text-[11px] text-zinc-500">
                        {new Date(v.createdAt).toLocaleDateString('pt-BR')} por {v.author}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 font-medium">{v.changeDescription}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {v.status !== 'publicada' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          restoreAIVersion(v.versionNumber)
                          toast.success(`Versão ${v.versionNumber} restaurada com sucesso!`)
                        }}
                        className="text-xs font-bold rounded-xl border-white/10 text-zinc-300 hover:text-white"
                      >
                        <RotateCcw className="size-3.5 mr-1" /> Restaurar Snapshot
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* =======================================================================
              TAB 8: HISTÓRICO DE AUDITORIA
             ======================================================================= */}
          <TabsContent value="historico" className="space-y-6">
            <div className="border-b border-white/5 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="size-5 text-zinc-400" /> Log de Auditoria Administrativa
              </h2>
              <p className="text-xs text-zinc-400">
                Registro cronológico de todas as modificações, treinamentos e publicações da IA.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#100f1c] overflow-hidden">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="border-b border-white/5 bg-black/40 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="p-4">Data / Hora</th>
                    <th className="p-4">Administrador</th>
                    <th className="p-4">Ação</th>
                    <th className="p-4">Detalhes</th>
                    <th className="p-4">Versão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {aiLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </td>
                      <td className="p-4 font-bold text-white">{log.adminUser}</td>
                      <td className="p-4 font-semibold text-violet-300">{log.action}</td>
                      <td className="p-4 text-zinc-300">{log.details}</td>
                      <td className="p-4 font-mono text-[11px] text-zinc-400">{log.version || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* =========================================================================
          MODAL: ADICIONAR / EDITAR INSTRUÇÃO DE TREINAMENTO
         ========================================================================= */}
      {isInstructionModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden"
        >
          {/* Backdrop click closer */}
          <div
            className="fixed inset-0 bg-transparent"
            onClick={() => setIsInstructionModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-violet-500/30 bg-[#100f1c] shadow-2xl shadow-violet-950/50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-10">
            {/* Modal Header — Fixed */}
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4.5 shrink-0 bg-[#131122]">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Brain className="size-5 text-purple-400" />
                {editingInstruction ? 'Editar Instrução de Treinamento' : 'Nova Instrução de Treinamento'}
              </h3>
              <button
                type="button"
                onClick={() => setIsInstructionModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body & Form — Scrollable Content with min-h-0 */}
            <form onSubmit={handleSaveInstruction} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin scrollbar-thumb-violet-600/40 scrollbar-track-transparent overscroll-contain">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Título da Instrução *</label>
                  <Input
                    value={instructionForm.title}
                    onChange={(e) => setInstructionForm({ ...instructionForm, title: e.target.value })}
                    placeholder="Ex: Comportamento para alunos iniciantes"
                    className="bg-black/50 border-white/10 text-xs text-white h-10 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">Categoria</label>
                    <select
                      value={instructionForm.category}
                      onChange={(e) => setInstructionForm({ ...instructionForm, category: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-black/50 border border-white/10 text-xs font-bold text-zinc-200 focus:outline-none focus:border-violet-500 cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">Prioridade</label>
                    <select
                      value={instructionForm.priority}
                      onChange={(e) => setInstructionForm({ ...instructionForm, priority: e.target.value as any })}
                      className="w-full h-10 px-3 rounded-xl bg-black/50 border border-white/10 text-xs font-bold text-zinc-200 focus:outline-none focus:border-violet-500 cursor-pointer"
                    >
                      <option value="alta">Alta (Prioritária)</option>
                      <option value="media">Média</option>
                      <option value="baixa">Baixa</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Descrição Curta (Finalidade)</label>
                  <Input
                    value={instructionForm.description}
                    onChange={(e) => setInstructionForm({ ...instructionForm, description: e.target.value })}
                    placeholder="Ex: Evitar termos avançados sem analogia simples"
                    className="bg-black/50 border-white/10 text-xs text-white h-10 rounded-xl"
                  />
                </div>

                {/* Conteúdo da Instrução com Altura Controlada e Scroll Interno Estrito */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-300">Conteúdo / Regra da Instrução *</label>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {instructionForm.content.length.toLocaleString('pt-BR')} caracteres • {instructionForm.content.split('\n').length} linhas
                    </span>
                  </div>

                  <div className="relative rounded-2xl border border-white/10 bg-black/60 overflow-hidden focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500 transition-all">
                    <textarea
                      value={instructionForm.content}
                      onChange={(e) => setInstructionForm({ ...instructionForm, content: e.target.value })}
                      placeholder="Descreva exatamente a diretriz, regra, conhecimento ou comportamento que a IA deve seguir..."
                      className="w-full h-[220px] sm:h-[240px] max-h-[240px] min-h-[220px] bg-transparent text-xs font-mono text-zinc-200 p-4 leading-relaxed outline-none border-none resize-none overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words scrollbar-thin scrollbar-thumb-violet-600/50 scrollbar-track-white/5 block box-border"
                      style={{ height: '240px', maxHeight: '240px', resize: 'none' }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-zinc-500 px-1">
                    <span>O texto rola internamente sem alterar a altura ou estrutura do modal.</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer — Fixed at the bottom */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 shrink-0 bg-[#0d0c17]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInstructionModalOpen(false)}
                  className="text-xs border-white/10 text-zinc-400 hover:text-white rounded-xl cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl px-6 cursor-pointer shadow-lg shadow-violet-950/50"
                >
                  Salvar Instrução
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PUBLICAR NOVA VERSÃO DA IA
         ========================================================================= */}
      {isPublishModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden"
        >
          <div
            className="fixed inset-0 bg-transparent"
            onClick={() => setIsPublishModalOpen(false)}
          />

          <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border border-violet-500/40 bg-[#100f1c] shadow-2xl shadow-violet-950/50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-10">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4.5 shrink-0 bg-[#131122]">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Upload className="size-5 text-violet-400" /> Publicar Nova Versão da IA
              </h3>
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin scrollbar-thumb-violet-600/40 scrollbar-track-transparent">
              <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                Esta ação compilará todas as instruções ativas, blocos estruturais e configurações em uma nova versão oficial imutável. Todos os alunos passarão a interagir com esta versão imediatamente.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Descrição das Alterações / Release Notes *</label>
                <textarea
                  value={publishChangeDescription}
                  onChange={(e) => setPublishChangeDescription(e.target.value)}
                  placeholder="Ex: Adicionadas novas regras para explicação de funções e ajustada a temperatura para 0.4..."
                  className="w-full h-[120px] max-h-[140px] bg-black/50 border border-white/10 text-xs font-mono text-zinc-200 p-3.5 rounded-xl outline-none resize-none overflow-y-auto leading-relaxed focus:border-violet-500"
                  style={{ height: '120px', resize: 'none' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 shrink-0 bg-[#0d0c17]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPublishModalOpen(false)}
                className="text-xs border-white/10 text-zinc-400 hover:text-white rounded-xl cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleExecutePublish}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl px-6 cursor-pointer shadow-lg shadow-violet-950/50"
              >
                Confirmar Publicação
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADICIONAR / EDITAR DOCUMENTO DA BASE DE CONHECIMENTO
         ========================================================================= */}
      {isKnowledgeModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden"
        >
          <div
            className="fixed inset-0 bg-transparent"
            onClick={() => setIsKnowledgeModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-emerald-500/30 bg-[#100f1c] shadow-2xl shadow-emerald-950/50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-10">
            {/* Modal Header — Fixed */}
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4.5 shrink-0 bg-[#131122]">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="size-5 text-emerald-400" />
                {editingKnowledgeItem ? 'Editar Documento de Conhecimento' : 'Novo Documento de Conhecimento (RAG)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsKnowledgeModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body & Form — Scrollable Content */}
            <form onSubmit={handleSaveKnowledge} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin scrollbar-thumb-emerald-600/40 scrollbar-track-transparent overscroll-contain">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Título do Documento *</label>
                  <Input
                    value={knowledgeForm.title}
                    onChange={(e) => setKnowledgeForm({ ...knowledgeForm, title: e.target.value })}
                    placeholder="Ex: Padrões de Array Methods e Imutabilidade no ES6"
                    className="bg-black/50 border-white/10 text-xs text-white h-10 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">Categoria</label>
                    <select
                      value={knowledgeForm.category}
                      onChange={(e) => setKnowledgeForm({ ...knowledgeForm, category: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-black/50 border border-white/10 text-xs font-bold text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Programação">Programação</option>
                      <option value="Plataforma">Plataforma</option>
                      <option value="Pedagogia">Pedagogia</option>
                      <option value="Lógica">Lógica</option>
                      <option value="Arquitetura">Arquitetura</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">Tags (separadas por vírgula)</label>
                    <Input
                      value={knowledgeForm.tags}
                      onChange={(e) => setKnowledgeForm({ ...knowledgeForm, tags: e.target.value })}
                      placeholder="javascript, arrays, imutabilidade"
                      className="bg-black/50 border-white/10 text-xs text-white h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">URL da Fonte Oficial / Referência Técnica</label>
                  <Input
                    value={knowledgeForm.sourceUrl}
                    onChange={(e) => setKnowledgeForm({ ...knowledgeForm, sourceUrl: e.target.value })}
                    placeholder="https://developer.mozilla.org/..."
                    className="bg-black/50 border-white/10 text-xs text-white h-10 rounded-xl"
                  />
                </div>

                {/* Conteúdo do Documento com Altura Controlada e Scroll Interno */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-300">Conteúdo do Documento Técnico (Grounding) *</label>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {knowledgeForm.content.length.toLocaleString('pt-BR')} caracteres • {knowledgeForm.content.split('\n').length} linhas
                    </span>
                  </div>

                  <div className="relative rounded-2xl border border-white/10 bg-black/60 overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                    <textarea
                      value={knowledgeForm.content}
                      onChange={(e) => setKnowledgeForm({ ...knowledgeForm, content: e.target.value })}
                      placeholder="Insira as explicações técnicas, regras oficiais, boas práticas, APIs ou exemplos de código que a IA deve utilizar como referência real..."
                      className="w-full h-[220px] sm:h-[240px] max-h-[240px] min-h-[220px] bg-transparent text-xs font-mono text-zinc-200 p-4 leading-relaxed outline-none border-none resize-none overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words scrollbar-thin scrollbar-thumb-emerald-600/50 scrollbar-track-white/5 block box-border"
                      style={{ height: '240px', maxHeight: '240px', resize: 'none' }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-zinc-500 px-1">
                    <span>O motor RAG utilizará este texto para grounded responses sem alucinação.</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer — Fixed */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 shrink-0 bg-[#0d0c17]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsKnowledgeModalOpen(false)}
                  className="text-xs border-white/10 text-zinc-400 hover:text-white rounded-xl cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl px-6 cursor-pointer shadow-lg shadow-emerald-950/50"
                >
                  Salvar Documento
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
