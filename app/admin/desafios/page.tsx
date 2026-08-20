'use client'

import { useState, useMemo } from 'react'
import {
  Code2,
  Search,
  CheckCircle2,
  ExternalLink,
  Layers,
  FolderGit2,
  Sparkles,
  Plus,
  Filter,
} from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { mockProjects } from '@/lib/mock-data'

export default function AdminDesafiosPage() {
  const [search, setSearch] = useState('')
  const [techFilter, setTechFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')

  const filteredProjects = useMemo(() => {
    return (mockProjects || []).filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.tech.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      const matchTech = techFilter === 'all' || p.tech.includes(techFilter)
      const matchLevel = levelFilter === 'all' || (p as any).level === levelFilter
      return matchSearch && matchTech && matchLevel
    })
  }, [search, techFilter, levelFilter])

  return (
    <AdminShell
      title="Desafios & Projetos Práticos de Portfólio"
      subtitle="Supervisão de critérios de avaliação de código, rubricas pedagógicas e validação de repositórios"
    >
      <div className="space-y-6 max-w-7xl">
        {/* Metric Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Total de Desafios & Projetos</CardDescription>
              <CardTitle className="text-2xl font-black text-white font-mono">{mockProjects.length}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Projetos de fixação real
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Tecnologias Cobertas</CardDescription>
              <CardTitle className="text-2xl font-black text-violet-400 font-mono">React, Node, SQL</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Stack moderna de mercado
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Avaliação Automatizada</CardDescription>
              <CardTitle className="text-2xl font-black text-emerald-400 font-mono">ATIVADA</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Rubricas ponderadas e GitHub
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Sandbox Code Lab</CardDescription>
              <CardTitle className="text-2xl font-black text-purple-400 font-mono">INTEGRADO</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Execução in-browser segura
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#100f1c] p-4 rounded-2xl border border-white/10">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título ou tecnologia..."
                className="pl-9 bg-black/40 border-white/10 text-xs text-white h-9 rounded-xl"
              />
            </div>

            <select
              value={techFilter}
              onChange={(e) => setTechFilter(e.target.value)}
              className="h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="all">Todas as Tecnologias</option>
              <option value="React">React</option>
              <option value="Node.js">Node.js</option>
              <option value="JavaScript">JavaScript</option>
              <option value="TypeScript">TypeScript</option>
              <option value="SQL">SQL</option>
            </select>
          </div>

          <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white text-xs rounded-xl gap-1.5 h-9 shrink-0">
            <Plus className="size-3.5" /> Criar Desafio
          </Button>
        </div>

        {/* Projects List or Professional Empty State */}
        {filteredProjects.length === 0 ? (
          <Card className="bg-[#100f1c] border-white/10 p-12 text-center">
            <Code2 className="size-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">Nenhum desafio encontrado</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
              Não encontramos projetos para os filtros selecionados.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('')
                setTechFilter('all')
                setLevelFilter('all')
              }}
              className="text-xs border-white/10 text-zinc-300"
            >
              Limpar Filtros
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="bg-[#100f1c] border-white/10 flex flex-col justify-between">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-violet-300">
                      {project.status || 'Publicado'}
                    </Badge>
                    <span className="text-[10px] text-zinc-500 font-mono">Portfólio Oficial</span>
                  </div>
                  <CardTitle className="text-base font-bold text-white pt-1">{project.title}</CardTitle>
                  <CardDescription className="text-xs text-zinc-400 line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-3">
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                    {project.tech.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-zinc-300">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-400">
                    <span>Requisitos: 3 critérios</span>
                    <span className="text-emerald-400 font-mono font-bold">+100 XP</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  )
}
