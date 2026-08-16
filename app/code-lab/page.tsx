'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Bot,
  CheckCircle2,
  Code2,
  Download,
  Eye,
  FileCode,
  Layout,
  Play,
  RotateCcw,
  Save,
  Sparkles,
  Terminal,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { aiService } from '@/lib/ai/provider'

const initialTemplates = {
  counter: {
    html: `<div class="container">\n  <h1>Contador Interativo</h1>\n  <p id="count">0</p>\n  <div class="buttons">\n    <button id="dec">-1</button>\n    <button id="reset">Zerar</button>\n    <button id="inc">+1</button>\n  </div>\n</div>`,
    css: `body {\n  font-family: system-ui, sans-serif;\n  background: #0f172a;\n  color: #f8fafc;\n  display: grid;\n  place-items: center;\n  min-height: 100vh;\n  margin: 0;\n}\n.container {\n  text-align: center;\n  background: #1e293b;\n  padding: 2rem;\n  border-radius: 1rem;\n  box-shadow: 0 10px 25px rgba(0,0,0,0.3);\n}\n#count {\n  font-size: 3.5rem;\n  font-weight: 800;\n  color: #38bdf8;\n  margin: 1rem 0;\n}\n.buttons button {\n  background: #38bdf8;\n  color: #0f172a;\n  border: none;\n  padding: 0.6rem 1.2rem;\n  font-weight: bold;\n  border-radius: 0.5rem;\n  cursor: pointer;\n  margin: 0 0.3rem;\n  transition: 0.2s;\n}\n.buttons button:hover {\n  opacity: 0.9;\n  transform: translateY(-2px);\n}`,
    js: `let count = 0;\nconst display = document.getElementById('count');\n\ndocument.getElementById('inc').addEventListener('click', () => {\n  count++;\n  display.textContent = count;\n  console.log('Valor incrementado:', count);\n});\n\ndocument.getElementById('dec').addEventListener('click', () => {\n  count--;\n  display.textContent = count;\n  console.log('Valor decrementado:', count);\n});\n\ndocument.getElementById('reset').addEventListener('click', () => {\n  count = 0;\n  display.textContent = count;\n  console.log('Contador resetado');\n});`,
  },
}

export default function CodeLabPage() {
  const { xp } = useAppStore()
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html')
  const [htmlCode, setHtmlCode] = useState(initialTemplates.counter.html)
  const [cssCode, setCssCode] = useState(initialTemplates.counter.css)
  const [jsCode, setJsCode] = useState(initialTemplates.counter.js)

  const [consoleLogs, setConsoleLogs] = useState<string[]>([])
  const [previewSrc, setPreviewSrc] = useState<string>('')
  const [aiReview, setAiReview] = useState<{
    score: number
    strengths: string[]
    issues: string[]
    suggestions: string[]
  } | null>(null)
  const [isReviewing, setIsReviewing] = useState(false)

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
            // Intercept console.log for sandbox display
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
    toast.success('Código executado no Sandbox!')
  }

  // Listen to sandbox messages
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
      toast.success('Análise de código concluída!')
    } catch (err) {
      toast.error('Erro ao analisar código.')
    } finally {
      setIsReviewing(false)
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

  return (
    <AppShell
      title="Code Lab — Laboratório de Programação"
      subtitle="Editor de código seguro no navegador com visualização em tempo real e análise por IA"
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <Button onClick={runCode} className="gap-2 font-bold shadow-md shadow-primary/25">
              <Play className="size-4 fill-current" /> Executar (Run)
            </Button>
            <Button
              variant="outline"
              onClick={handleAIReview}
              disabled={isReviewing}
              className="gap-2 text-xs font-bold"
            >
              <Sparkles className="size-4 text-primary" />
              {isReviewing ? 'Analisando...' : 'Revisão com IA'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs text-muted-foreground gap-1.5">
              <RotateCcw className="size-3.5" /> Limpar
            </Button>
          </div>
        </div>

        {/* Editor & Preview Split Workspace */}
        <div className="grid gap-6 lg:grid-cols-2 items-stretch">
          {/* Left Column: Code Editor Tabs */}
          <div className="space-y-4 flex flex-col">
            <Card className="flex-1 border-border/80 shadow-lg flex flex-col overflow-hidden">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-1">
                  <TabsList className="bg-transparent gap-1">
                    <TabsTrigger value="html" className="text-xs gap-1.5 font-bold data-[state=active]:bg-card">
                      <span className="size-2 rounded-full bg-orange-500" /> HTML
                    </TabsTrigger>
                    <TabsTrigger value="css" className="text-xs gap-1.5 font-bold data-[state=active]:bg-card">
                      <span className="size-2 rounded-full bg-blue-500" /> CSS
                    </TabsTrigger>
                    <TabsTrigger value="js" className="text-xs gap-1.5 font-bold data-[state=active]:bg-card">
                      <span className="size-2 rounded-full bg-yellow-500" /> JavaScript
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 min-h-[360px] p-0">
                  <TabsContent value="html" className="m-0 h-full">
                    <textarea
                      value={htmlCode}
                      onChange={(e) => setHtmlCode(e.target.value)}
                      placeholder="<!-- Insira seu código HTML aqui -->"
                      className="size-full resize-none border-0 bg-background/50 p-4 font-mono text-xs leading-relaxed text-foreground focus:outline-none focus:ring-0 min-h-[360px]"
                      spellCheck={false}
                    />
                  </TabsContent>

                  <TabsContent value="css" className="m-0 h-full">
                    <textarea
                      value={cssCode}
                      onChange={(e) => setCssCode(e.target.value)}
                      placeholder="/* Insira seu CSS aqui */"
                      className="size-full resize-none border-0 bg-background/50 p-4 font-mono text-xs leading-relaxed text-foreground focus:outline-none focus:ring-0 min-h-[360px]"
                      spellCheck={false}
                    />
                  </TabsContent>

                  <TabsContent value="js" className="m-0 h-full">
                    <textarea
                      value={jsCode}
                      onChange={(e) => setJsCode(e.target.value)}
                      placeholder="// Insira seu JavaScript aqui"
                      className="size-full resize-none border-0 bg-background/50 p-4 font-mono text-xs leading-relaxed text-foreground focus:outline-none focus:ring-0 min-h-[360px]"
                      spellCheck={false}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </Card>

            {/* Console Output Card */}
            <Card className="border-border/80 bg-black/80 text-green-400 font-mono text-xs shadow-md">
              <CardHeader className="py-2.5 px-4 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
                <span className="flex items-center gap-2 font-bold text-xs text-muted-foreground">
                  <Terminal className="size-3.5 text-primary" /> Console de Execução
                </span>
                <button
                  type="button"
                  onClick={() => setConsoleLogs([])}
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Limpar
                </button>
              </CardHeader>
              <CardContent className="p-3 max-h-36 overflow-y-auto space-y-1 scrollbar-thin">
                {consoleLogs.length === 0 ? (
                  <span className="text-muted-foreground/60 italic text-[11px]">&gt; Console pronto. Execute o código para ver saídas.</span>
                ) : (
                  consoleLogs.map((log, i) => <div key={i} className="leading-snug">{log}</div>)
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Iframe Preview & AI Review */}
          <div className="space-y-4 flex flex-col">
            <Card className="flex-1 border-border/80 shadow-lg flex flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2">
                <span className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Eye className="size-3.5 text-primary" /> Prévia Visual em Sandbox
                </span>
                <Badge variant="outline" className="text-[10px]">Isolamento Ativo</Badge>
              </div>

              <div className="flex-1 bg-white min-h-[360px]">
                <iframe
                  srcDoc={previewSrc}
                  title="Code Sandbox Preview"
                  sandbox="allow-scripts allow-modals"
                  className="size-full border-0 min-h-[360px]"
                />
              </div>
            </Card>

            {/* AI Review Result Drawer */}
            {aiReview ? (
              <Card className="border-primary/30 bg-primary/[0.04] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="size-5 text-primary" />
                    <h4 className="text-sm font-bold">Relatório de Qualidade do Código (IA)</h4>
                  </div>
                  <Badge className="bg-primary text-primary-foreground font-bold">
                    Nota: {aiReview.score}/100
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-success flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> Pontos Positivos:
                    </span>
                    <ul className="list-disc pl-4 text-muted-foreground space-y-0.5 mt-1">
                      {aiReview.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  {aiReview.issues.length > 0 && (
                    <div>
                      <span className="font-bold text-warning flex items-center gap-1">
                        ⚠️ Recomendações de Melhoria:
                      </span>
                      <ul className="list-disc pl-4 text-muted-foreground space-y-0.5 mt-1">
                        {aiReview.issues.map((iss, i) => <li key={i}>{iss}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
