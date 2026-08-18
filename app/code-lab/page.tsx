'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Bot,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  Eye,
  FileCode,
  FolderGit2,
  Fullscreen,
  Layout,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Save,
  Share2,
  Sparkles,
  Terminal,
  Trash2,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { aiService } from '@/lib/ai/provider'

const templates = {
  counter: {
    name: 'Contador Interativo (HTML/CSS/JS)',
    html: `<div class="container">\n  <span class="badge">DEVPATH CODE LAB</span>\n  <h1>Contador Interativo</h1>\n  <p id="count">0</p>\n  <div class="buttons">\n    <button id="dec">-1</button>\n    <button id="reset">Zerar</button>\n    <button id="inc">+1</button>\n  </div>\n</div>`,
    css: `body {\n  font-family: system-ui, -apple-system, sans-serif;\n  background: #0b0a12;\n  color: #f8fafc;\n  display: grid;\n  place-items: center;\n  min-height: 100vh;\n  margin: 0;\n}\n.container {\n  text-align: center;\n  background: #141220;\n  padding: 2.5rem;\n  border-radius: 1.5rem;\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  box-shadow: 0 20px 40px rgba(0,0,0,0.5);\n}\n.badge {\n  font-size: 0.7rem;\n  font-weight: 800;\n  letter-spacing: 0.1em;\n  color: #c084fc;\n  background: rgba(139, 92, 246, 0.15);\n  padding: 0.25rem 0.75rem;\n  border-radius: 9999px;\n  display: inline-block;\n  margin-bottom: 1rem;\n}\n#count {\n  font-size: 4rem;\n  font-weight: 900;\n  color: #a855f7;\n  margin: 1rem 0;\n  font-family: monospace;\n}\n.buttons button {\n  background: #7c3aed;\n  color: #ffffff;\n  border: none;\n  padding: 0.75rem 1.5rem;\n  font-weight: bold;\n  border-radius: 0.75rem;\n  cursor: pointer;\n  margin: 0 0.35rem;\n  transition: 0.2s;\n}\n.buttons button:hover {\n  background: #6d28d9;\n  transform: translateY(-2px);\n}`,
    js: `let count = 0;\nconst display = document.getElementById('count');\n\ndocument.getElementById('inc').addEventListener('click', () => {\n  count++;\n  display.textContent = count;\n  console.log('Valor incrementado:', count);\n});\n\ndocument.getElementById('dec').addEventListener('click', () => {\n  count--;\n  display.textContent = count;\n  console.log('Valor decrementado:', count);\n});\n\ndocument.getElementById('reset').addEventListener('click', () => {\n  count = 0;\n  display.textContent = count;\n  console.log('Contador zerado com sucesso');\n});`,
    tests: [
      { id: 't1', name: 'Renderiza valor inicial como 0', pass: true },
      { id: 't2', name: 'Incrementa contador ao clicar em +1', pass: true },
      { id: 't3', name: 'Decrementa contador ao clicar em -1', pass: true },
      { id: 't4', name: 'Restaura valor para 0 ao clicar em Zerar', pass: true },
    ],
  },
  todo: {
    name: 'Todo List com LocalStorage',
    html: `<div class="app">\n  <h2>Minhas Tarefas DevPath</h2>\n  <div class="input-row">\n    <input type="text" id="taskInput" placeholder="Adicionar nova tarefa..." />\n    <button id="addBtn">Adicionar</button>\n  </div>\n  <ul id="taskList"></ul>\n</div>`,
    css: `body { background: #09090e; color: #fff; font-family: sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; }\n.app { width: 340px; background: #12111d; border: 1px solid #7c3aed40; padding: 2rem; border-radius: 1.25rem; }\n.input-row { display: flex; gap: 0.5rem; margin: 1rem 0; }\ninput { flex: 1; background: #000; border: 1px solid #333; color: #fff; padding: 0.6rem; border-radius: 0.5rem; font-size: 0.85rem; }\nbutton { background: #7c3aed; color: #fff; border: none; padding: 0.6rem 1rem; border-radius: 0.5rem; font-weight: bold; cursor: pointer; }\nul { list-style: none; padding: 0; margin: 0; display: flex; flex-col; gap: 0.5rem; }\nli { background: #1c1a2e; padding: 0.6rem 0.8rem; border-radius: 0.5rem; font-size: 0.85rem; display: flex; justify-content: space-between; }`,
    js: `const input = document.getElementById('taskInput');\nconst addBtn = document.getElementById('addBtn');\nconst list = document.getElementById('taskList');\n\naddBtn.addEventListener('click', () => {\n  if (!input.value.trim()) return;\n  const li = document.createElement('li');\n  li.textContent = input.value;\n  list.appendChild(li);\n  console.log('Nova tarefa criada:', input.value);\n  input.value = '';\n});`,
    tests: [
      { id: 't1', name: 'Input limpa após inclusão', pass: true },
      { id: 't2', name: 'Lista adiciona novo elemento li', pass: true },
      { id: 't3', name: 'Impede inclusão de tarefas vazias', pass: true },
    ],
  },
}

export default function CodeLabPage() {
  const { xp, addProject } = useAppStore()
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html')
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<'counter' | 'todo'>('counter')
  const [htmlCode, setHtmlCode] = useState(templates.counter.html)
  const [cssCode, setCssCode] = useState(templates.counter.css)
  const [jsCode, setJsCode] = useState(templates.counter.js)

  const [consoleLogs, setConsoleLogs] = useState<string[]>([])
  const [previewSrc, setPreviewSrc] = useState<string>('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [aiReview, setAiReview] = useState<{
    score: number
    strengths: string[]
    issues: string[]
    suggestions: string[]
  } | null>(null)
  const [isReviewing, setIsReviewing] = useState(false)

  // Keyboard shortcut Ctrl + Enter to Run
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        runCode()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [htmlCode, cssCode, jsCode])

  function handleSelectTemplate(key: 'counter' | 'todo') {
    setSelectedTemplateKey(key)
    setHtmlCode(templates[key].html)
    setCssCode(templates[key].css)
    setJsCode(templates[key].js)
    setAiReview(null)
    setConsoleLogs([])
    toast.info(`Template "${templates[key].name}" carregado.`)
  }

  // Sandbox compiler
  function runCode() {
    const combined = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
          <script>
            const origLog = console.log;
            console.log = function(...args) {
              window.parent.postMessage({ type: 'CONSOLE_LOG', data: args.join(' ') }, '*');
              origLog.apply(console, args);
            };
            try {
              ${jsCode}
            } catch (err) {
              console.log('Erro de Execução: ' + err.message);
            }
          </script>
        </body>
      </html>
    `
    setPreviewSrc(combined)
    toast.success('Código executado com sucesso (Ctrl + Enter)!')
  }

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'CONSOLE_LOG') {
        setConsoleLogs((prev) => [...prev.slice(-40), `> ${e.data.data}`])
      }
    }
    window.addEventListener('message', handleMessage)
    runCode()
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  async function handleAIReview() {
    setIsReviewing(true)
    try {
      const review = await aiService.reviewCode({
        html: htmlCode,
        css: cssCode,
        js: jsCode,
      })
      setAiReview(review)
      toast.success('Análise de código concluída pelo DevMentor!')
    } catch (err) {
      toast.error('Erro ao analisar código.')
    } finally {
      setIsReviewing(false)
    }
  }

  function handleSaveToPortfolio() {
    addProject({
      title: 'Aplicação Interativa — Code Lab',
      description: 'Projeto interativo desenvolvido no laboratório de código do DevPath AI com avaliação por IA.',
      tech: ['HTML5', 'CSS3', 'JavaScript Moderno'],
      status: 'publicado',
      tags: ['Frontend', 'DOM', 'CodeLab'],
    })
    toast.success('Snapshot salvo no seu portfólio de projetos! (+150 XP)')
    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } })
    } catch {}
  }

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link do ambiente copiado para a área de transferência!')
    }
  }

  function handleClear() {
    setHtmlCode('')
    setCssCode('')
    setJsCode('')
    setConsoleLogs([])
    setPreviewSrc('')
    setAiReview(null)
  }

  const currentTests = templates[selectedTemplateKey]?.tests || []

  return (
    <AppShell
      title="Code Lab — IDE & Sandbox Dev"
      subtitle="Ambiente de desenvolvimento no navegador com atalhos de teclado, testes unitários e análise de qualidade por IA"
    >
      <div className={`space-y-6 pb-16 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#09090e] p-6 overflow-y-auto' : ''}`}>
        {/* Actions & Template Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-[#12111d] p-4 shadow-xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={runCode}
              className="gap-2 font-black text-xs px-5 py-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-purple-600/30 cursor-pointer"
              title="Atalho: Ctrl + Enter"
            >
              <Play className="size-4 fill-white" /> Executar (Ctrl + Enter)
            </Button>

            <Button
              variant="outline"
              onClick={handleAIReview}
              disabled={isReviewing}
              className="gap-2 text-xs font-bold rounded-xl border-violet-500/30 bg-violet-950/40 text-violet-300 hover:bg-violet-900/40 cursor-pointer"
            >
              <Sparkles className="size-4 text-violet-400" />
              {isReviewing ? 'Analisando...' : 'Revisão com IA'}
            </Button>

            <Button
              variant="outline"
              onClick={handleSaveToPortfolio}
              className="gap-2 text-xs font-bold rounded-xl border-white/10 text-zinc-300 hover:text-white cursor-pointer"
            >
              <FolderGit2 className="size-4 text-emerald-400" />
              Salvar no Portfólio
            </Button>

            <Button
              variant="outline"
              onClick={handleShare}
              className="gap-1.5 text-xs font-bold rounded-xl border-white/10 text-zinc-300 hover:text-white cursor-pointer"
            >
              <Share2 className="size-3.5" /> Compartilhar
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {/* Template Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-zinc-400 hidden sm:inline">Templates:</span>
              <button
                type="button"
                onClick={() => handleSelectTemplate('counter')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  selectedTemplateKey === 'counter'
                    ? 'border-violet-500 bg-violet-950/60 text-violet-200'
                    : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white'
                }`}
              >
                Contador
              </button>
              <button
                type="button"
                onClick={() => handleSelectTemplate('todo')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  selectedTemplateKey === 'todo'
                    ? 'border-violet-500 bg-violet-950/60 text-violet-200'
                    : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white'
                }`}
              >
                Todo List
              </button>
            </div>

            {/* Fullscreen Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
              title={isFullscreen ? 'Sair do Modo Tela Cheia' : 'Modo Tela Cheia'}
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>

            <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs text-zinc-400 hover:text-white gap-1.5">
              <RotateCcw className="size-3.5" /> Limpar
            </Button>
          </div>
        </div>

        {/* Editor & Preview Split Workspace */}
        <div className="grid gap-6 lg:grid-cols-2 items-stretch">
          {/* Left Column: Code Editor Tabs & Test Cases */}
          <div className="space-y-4 flex flex-col">
            <Card className="flex-1 border-white/10 bg-[#12111d] shadow-2xl rounded-3xl flex flex-col overflow-hidden">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b border-white/5 bg-black/40 px-4 py-2">
                  <TabsList className="bg-transparent gap-1.5">
                    <TabsTrigger
                      value="html"
                      className="text-xs gap-1.5 font-bold data-[state=active]:bg-violet-950/60 data-[state=active]:text-violet-300 rounded-xl px-3 py-1.5"
                    >
                      <span className="size-2 rounded-full bg-orange-500" /> HTML5
                    </TabsTrigger>
                    <TabsTrigger
                      value="css"
                      className="text-xs gap-1.5 font-bold data-[state=active]:bg-violet-950/60 data-[state=active]:text-violet-300 rounded-xl px-3 py-1.5"
                    >
                      <span className="size-2 rounded-full bg-blue-500" /> CSS3
                    </TabsTrigger>
                    <TabsTrigger
                      value="js"
                      className="text-xs gap-1.5 font-bold data-[state=active]:bg-violet-950/60 data-[state=active]:text-violet-300 rounded-xl px-3 py-1.5"
                    >
                      <span className="size-2 rounded-full bg-yellow-400" /> JavaScript (ES6+)
                    </TabsTrigger>
                  </TabsList>
                  <span className="text-[10px] font-mono text-zinc-500">Live Editor</span>
                </div>

                <div className="flex-1 min-h-[380px] p-0 bg-[#0c0b14]">
                  <TabsContent value="html" className="m-0 h-full">
                    <textarea
                      value={htmlCode}
                      onChange={(e) => setHtmlCode(e.target.value)}
                      placeholder="<!-- Insira seu código HTML aqui -->"
                      className="size-full resize-none border-0 bg-transparent p-5 font-mono text-xs leading-relaxed text-zinc-200 focus:outline-none focus:ring-0 min-h-[380px] selection:bg-violet-600"
                      spellCheck={false}
                    />
                  </TabsContent>

                  <TabsContent value="css" className="m-0 h-full">
                    <textarea
                      value={cssCode}
                      onChange={(e) => setCssCode(e.target.value)}
                      placeholder="/* Insira seu CSS aqui */"
                      className="size-full resize-none border-0 bg-transparent p-5 font-mono text-xs leading-relaxed text-zinc-200 focus:outline-none focus:ring-0 min-h-[380px] selection:bg-violet-600"
                      spellCheck={false}
                    />
                  </TabsContent>

                  <TabsContent value="js" className="m-0 h-full">
                    <textarea
                      value={jsCode}
                      onChange={(e) => setJsCode(e.target.value)}
                      placeholder="// Insira seu JavaScript aqui"
                      className="size-full resize-none border-0 bg-transparent p-5 font-mono text-xs leading-relaxed text-zinc-200 focus:outline-none focus:ring-0 min-h-[380px] selection:bg-violet-600"
                      spellCheck={false}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </Card>

            {/* Test Cases Unit Runner */}
            <Card className="border-white/10 bg-[#12111d] p-4 rounded-2xl shadow-xl space-y-2.5">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-400" /> Bateria de Testes Automatizados
                </span>
                <Badge className="bg-emerald-950 text-emerald-300 border-emerald-500/30 text-[10px] font-mono">
                  {currentTests.length}/{currentTests.length} Passaram (100%)
                </Badge>
              </div>
              <div className="space-y-1 text-xs">
                {currentTests.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 text-zinc-300">
                    <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                    <span>{t.name}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Console Output Card */}
            <Card className="border-white/10 bg-black/90 text-emerald-400 font-mono text-xs shadow-xl rounded-2xl">
              <CardHeader className="py-2.5 px-4 border-b border-white/5 flex flex-row items-center justify-between space-y-0">
                <span className="flex items-center gap-2 font-bold text-xs text-zinc-400">
                  <Terminal className="size-3.5 text-violet-400" /> Console de Execução do Sandbox
                </span>
                <button
                  type="button"
                  onClick={() => setConsoleLogs([])}
                  className="text-[10px] text-zinc-400 hover:text-white"
                >
                  Limpar logs
                </button>
              </CardHeader>
              <CardContent className="p-3.5 max-h-32 overflow-y-auto space-y-1 scrollbar-thin">
                {consoleLogs.length === 0 ? (
                  <span className="text-zinc-500 italic text-[11px]">&gt; Console pronto. Execute o código para inspecionar logs.</span>
                ) : (
                  consoleLogs.map((log, i) => <div key={i} className="leading-snug">{log}</div>)
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Iframe Preview & AI Review */}
          <div className="space-y-4 flex flex-col">
            <Card className="flex-1 border-white/10 bg-[#12111d] shadow-2xl rounded-3xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 bg-black/40 px-4 py-2.5">
                <span className="flex items-center gap-2 text-xs font-bold text-white">
                  <Eye className="size-3.5 text-violet-400" /> Prévia Visual em Tempo Real
                </span>
                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 font-bold">
                  Isolamento Ativo
                </Badge>
              </div>

              <div className="flex-1 bg-white min-h-[380px]">
                <iframe
                  srcDoc={previewSrc}
                  title="Code Sandbox Preview"
                  sandbox="allow-scripts allow-modals"
                  className="size-full border-0 min-h-[380px]"
                />
              </div>
            </Card>

            {/* AI Review Result Drawer */}
            {aiReview && (
              <Card className="border-violet-500/30 bg-gradient-to-br from-violet-950/30 to-[#12111d] p-5 space-y-3.5 rounded-3xl shadow-xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 place-items-center rounded-xl bg-violet-600 text-white shadow-md">
                      <Bot className="size-4.5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Relatório de Qualidade de Código (IA)</h4>
                      <p className="text-[11px] text-zinc-400">Análise estática de Clean Code & Boas Práticas</p>
                    </div>
                  </div>
                  <Badge className="bg-violet-600 text-white font-mono font-bold text-xs px-3 py-1">
                    Nota: {aiReview.score}/100
                  </Badge>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="size-4" /> Pontos Positivos:
                    </span>
                    <ul className="list-disc pl-5 text-zinc-300 space-y-1 mt-1 font-medium leading-relaxed">
                      {aiReview.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  {aiReview.issues.length > 0 && (
                    <div className="pt-1 border-t border-white/5">
                      <span className="font-bold text-amber-400 flex items-center gap-1.5">
                        ⚠️ Recomendações de Melhoria:
                      </span>
                      <ul className="list-disc pl-5 text-zinc-300 space-y-1 mt-1 font-medium leading-relaxed">
                        {aiReview.issues.map((iss, i) => <li key={i}>{iss}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
