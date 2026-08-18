'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import type { UserTechnologyRecord } from '@/lib/types'
import { Code2, Plus, X, Search, Sparkles, Check, Layers } from 'lucide-react'
import { toast } from 'sonner'

const POPULAR_TECHNOLOGIES = [
  { name: 'JavaScript (ES6+)', category: 'Linguagens' },
  { name: 'TypeScript', category: 'Linguagens' },
  { name: 'React 19', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Frontend' },
  { name: 'HTML5 & CSS3', category: 'Frontend' },
  { name: 'Vue.js', category: 'Frontend' },
  { name: 'Angular', category: 'Frontend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Express.js', category: 'Backend' },
  { name: 'NestJS', category: 'Backend' },
  { name: 'Python', category: 'Linguagens' },
  { name: 'Django / FastAPI', category: 'Backend' },
  { name: 'Java / Spring Boot', category: 'Backend' },
  { name: 'C# / .NET', category: 'Backend' },
  { name: 'PostgreSQL', category: 'Banco de Dados' },
  { name: 'MySQL', category: 'Banco de Dados' },
  { name: 'MongoDB', category: 'Banco de Dados' },
  { name: 'Redis', category: 'Banco de Dados' },
  { name: 'Prisma ORM', category: 'Backend' },
  { name: 'Git & GitHub', category: 'Ferramentas' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'Kubernetes', category: 'DevOps' },
  { name: 'AWS Cloud', category: 'DevOps' },
  { name: 'GraphQL', category: 'Backend' },
  { name: 'Jest / Vitest', category: 'Testes' },
  { name: 'Cypress / Playwright', category: 'Testes' },
]

export function TechnologiesTab() {
  const { userTechnologies, addUserTechnology, removeUserTechnology } = useAppStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProficiency, setSelectedProficiency] = useState<UserTechnologyRecord['proficiencyLevel']>('Intermediário')
  const [customTechName, setCustomTechName] = useState('')

  const activeTechNames = useMemo(
    () => new Set(userTechnologies.map((t) => t.name.toLowerCase())),
    [userTechnologies]
  )

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return []
    return POPULAR_TECHNOLOGIES.filter(
      (tech) =>
        tech.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !activeTechNames.has(tech.name.toLowerCase())
    )
  }, [searchQuery, activeTechNames])

  function handleAddPredefined(tech: { name: string; category: string }) {
    addUserTechnology({
      name: tech.name,
      category: tech.category,
      proficiencyLevel: selectedProficiency,
    })
    setSearchQuery('')
    toast.success(`Tecnologia ${tech.name} adicionada com nível ${selectedProficiency}!`)
  }

  function handleAddCustom(e: React.FormEvent) {
    e.preventDefault()
    const nameToAdd = customTechName.trim() || searchQuery.trim()
    if (!nameToAdd) return

    if (activeTechNames.has(nameToAdd.toLowerCase())) {
      toast.error('Esta tecnologia já foi adicionada ao seu perfil.')
      return
    }

    addUserTechnology({
      name: nameToAdd,
      category: 'Geral',
      proficiencyLevel: selectedProficiency,
    })

    setCustomTechName('')
    setSearchQuery('')
    toast.success(`Tecnologia ${nameToAdd} adicionada!`)
  }

  function handleRemove(id: string, name: string) {
    removeUserTechnology(id)
    toast.success(`${name} removida.`)
  }

  // Group user techs by category
  const categorized = useMemo(() => {
    const map: Record<string, UserTechnologyRecord[]> = {}
    for (const tech of userTechnologies) {
      const cat = tech.category || 'Outras'
      if (!map[cat]) map[cat] = []
      map[cat].push(tech)
    }
    return map
  }, [userTechnologies])

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-[#0e0d16] text-white rounded-3xl shadow-xl">
        <CardHeader className="border-b border-white/5 pb-6">
          <CardTitle className="text-xl font-black text-white flex items-center gap-2">
            <Code2 className="size-5 text-cyan-400" /> Matriz de Tecnologias & Stacks
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Adicione as linguagens, frameworks, bancos de dados e ferramentas que compõem sua stack técnica.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Add Technology Form & Search Bar */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <Label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Search className="size-4 text-cyan-400" /> Buscar ou Adicionar Nova Tecnologia
              </Label>

              {/* Proficiency selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-400 font-medium">Nível:</span>
                <select
                  value={selectedProficiency}
                  onChange={(e) => setSelectedProficiency(e.target.value as any)}
                  className="h-8 px-2.5 rounded-lg bg-[#141320] border border-white/10 text-cyan-300 text-xs font-bold focus:outline-none focus:border-cyan-500"
                >
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                  <option value="Especialista">Especialista</option>
                </select>
              </div>
            </div>

            <form onSubmit={handleAddCustom} className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Digite para buscar: React, Python, PostgreSQL, Docker..."
                  className="bg-black/50 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={!searchQuery.trim()}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs px-4 rounded-xl gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="size-4" /> Adicionar
              </Button>
            </form>

            {/* Autocomplete Suggestions Box */}
            {filteredSuggestions.length > 0 && (
              <div className="rounded-xl border border-cyan-500/30 bg-[#12111d] p-3 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                  <Sparkles className="size-3" /> Sugestões encontradas
                </span>
                <div className="flex flex-wrap gap-2">
                  {filteredSuggestions.map((tech, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddPredefined(tech)}
                      className="group flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-zinc-300 hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-white transition-all cursor-pointer"
                    >
                      <Plus className="size-3 text-cyan-400 group-hover:rotate-90 transition-transform" />
                      <span>{tech.name}</span>
                      <span className="text-[10px] text-zinc-500">({tech.category})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Popular Add Tags */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-zinc-400">Populares para adicionar rapidamente:</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TECHNOLOGIES.filter((t) => !activeTechNames.has(t.name.toLowerCase()))
                  .slice(0, 10)
                  .map((tech, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddPredefined(tech)}
                      className="rounded-lg border border-white/5 bg-white/[0.02] px-2 py-1 text-[11px] font-mono text-zinc-400 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      + {tech.name}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* User's Active Technologies List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Layers className="size-4 text-cyan-400" /> Minhas Tecnologias Cadastradas ({userTechnologies.length})
              </h3>
            </div>

            {userTechnologies.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center space-y-2">
                <Code2 className="size-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">
                  Nenhuma tecnologia adicionada. Use a barra de busca acima para incluir suas stacks.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {Object.entries(categorized).map(([category, list]) => (
                  <div key={category} className="space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400">
                      {category}
                    </span>

                    <div className="flex flex-wrap gap-2.5">
                      {list.map((tech) => (
                        <div
                          key={tech.id}
                          className="group flex items-center gap-2 rounded-xl border border-white/10 bg-[#12111d] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:border-cyan-500/40 hover:bg-[#161426]"
                        >
                          <span className="font-semibold">{tech.name}</span>

                          {tech.proficiencyLevel && (
                            <Badge
                              variant="outline"
                              className={`text-[9px] font-bold px-1.5 py-0 ${
                                tech.proficiencyLevel === 'Avançado' || tech.proficiencyLevel === 'Especialista'
                                  ? 'text-cyan-300 border-cyan-500/40 bg-cyan-950/40'
                                  : tech.proficiencyLevel === 'Intermediário'
                                  ? 'text-amber-300 border-amber-500/40 bg-amber-950/40'
                                  : 'text-zinc-400 border-white/10'
                              }`}
                            >
                              {tech.proficiencyLevel}
                            </Badge>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemove(tech.id, tech.name)}
                            className="rounded-full p-0.5 text-zinc-500 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                            title="Remover tecnologia"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
