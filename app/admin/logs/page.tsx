'use client'

import { useState, useMemo } from 'react'
import {
  History,
  Search,
  Filter,
  Shield,
  Clock,
  Terminal,
  Activity,
} from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'

export default function AdminLogsPage() {
  const { aiLogs, aiOperationLogs } = useAppStore()
  const [search, setSearch] = useState('')

  const combinedLogs = useMemo(() => {
    const list = [...(aiLogs || [])]
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [aiLogs])

  const filteredLogs = useMemo(() => {
    return combinedLogs.filter((log) =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.adminUser.toLowerCase().includes(search.toLowerCase())
    )
  }, [combinedLogs, search])

  return (
    <AdminShell
      title="Logs & Auditoria Administrativa"
      subtitle="Registro cronológico imutável de todas as modificações, treinamentos de IA e publicações de conteúdo"
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Total de Eventos Auditados</CardDescription>
              <CardTitle className="text-2xl font-black text-white font-mono">{combinedLogs.length}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Registrados no log de auditoria
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Auditoria de IA & RAG</CardDescription>
              <CardTitle className="text-2xl font-black text-violet-400 font-mono">
                {aiOperationLogs?.length || 0} execuções
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Rastreamento de tokens e latência
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Status da Trilha de Auditoria</CardDescription>
              <CardTitle className="text-2xl font-black text-emerald-400 font-mono">IMUTÁVEL</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Proteção contra adulteração
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-3 bg-[#100f1c] p-4 rounded-2xl border border-white/10">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por ação, admin ou detalhe..."
              className="pl-9 bg-black/40 border-white/10 text-xs text-white"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="rounded-3xl border border-white/10 bg-[#100f1c] overflow-hidden shadow-xl">
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
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    Nenhum log de auditoria encontrado.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-4 font-bold text-white">{log.adminUser}</td>
                    <td className="p-4 font-semibold text-violet-300">{log.action}</td>
                    <td className="p-4 text-zinc-300">{log.details}</td>
                    <td className="p-4 font-mono text-[11px] text-zinc-400">{log.version || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}
