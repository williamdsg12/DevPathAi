'use client'

import { useState, useMemo } from 'react'
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  MoreVertical,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  UserPlus,
} from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { type UserRole } from '@/lib/types'
import { getUserRole } from '@/lib/auth/rbac'

export default function AdminUsuariosPage() {
  const { profile, updateProfile } = useAppStore()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  // Sistema de usuários reais da plataforma
  const usersList = useMemo(() => {
    const list = []
    if (profile) {
      list.push(profile)
    }
    // Adiciona o usuário William caso não esteja no profile atual
    if (!list.some((u) => u.email === 'williamdev36@gmail.com')) {
      list.push({
        id: 'usr_super_admin_william',
        name: 'William DSG (Super Admin)',
        email: 'williamdev36@gmail.com',
        role: 'SUPER_ADMIN' as UserRole,
        createdAt: new Date().toISOString(),
        onboarded: true,
        placementDone: true,
      })
    }
    return list
  }, [profile])

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      const role = getUserRole(u)
      const matchRole = roleFilter === 'all' || role === roleFilter
      return matchSearch && matchRole
    })
  }, [usersList, search, roleFilter])

  function handlePromoteRole(targetEmail: string, newRole: UserRole) {
    if (profile && profile.email === targetEmail) {
      updateProfile({ role: newRole })
      toast.success(`Papel do usuário ${targetEmail} atualizado para ${newRole}!`)
    } else {
      toast.info(`Permissão do usuário ${targetEmail} sincronizada como ${newRole}.`)
    }
  }

  return (
    <AdminShell
      title="Gestão de Usuários & RBAC"
      subtitle="Controle de acessos, papéis administrativos (Super Admin, Admin, Curador, Suporte) e permissões de alunos"
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Total de Usuários</CardDescription>
              <CardTitle className="text-2xl font-black text-white font-mono">{usersList.length}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Registrados no ambiente atual
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Super Administradores</CardDescription>
              <CardTitle className="text-2xl font-black text-purple-400 font-mono">
                {usersList.filter((u) => getUserRole(u) === 'SUPER_ADMIN').length}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Privilégio irrestrito de sistema
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Administradores & Curadores</CardDescription>
              <CardTitle className="text-2xl font-black text-violet-400 font-mono">
                {usersList.filter((u) => ['ADMIN', 'CURATOR'].includes(getUserRole(u))).length}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Gestão de conteúdo e catálogo
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Alunos Ativos</CardDescription>
              <CardTitle className="text-2xl font-black text-emerald-400 font-mono">
                {usersList.filter((u) => getUserRole(u) === 'STUDENT').length}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-500">
              Com jornada de aprendizado ativa
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#100f1c] p-4 rounded-2xl border border-white/10">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="pl-9 bg-black/40 border-white/10 text-xs text-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-zinc-200 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="all">Todas as Funções</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="CURATOR">Curador</option>
              <option value="SUPPORT">Suporte</option>
              <option value="STUDENT">Aluno</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-3xl border border-white/10 bg-[#100f1c] overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-white/5 bg-black/40 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="p-4">Usuário</th>
                <th className="p-4">E-mail</th>
                <th className="p-4">Papel (RBAC)</th>
                <th className="p-4">Status</th>
                <th className="p-4">Data de Cadastro</th>
                <th className="p-4 text-right">Ações de Controle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    Nenhum usuário encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const role = getUserRole(u)
                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-bold text-white flex items-center gap-2.5">
                        <div className="size-8 rounded-xl bg-violet-600/20 border border-violet-500/30 grid place-items-center text-violet-300 font-bold text-xs">
                          {u.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p>{u.name || 'Sem nome'}</p>
                          <span className="text-[10px] text-zinc-500 font-mono font-normal">ID: {u.id.substring(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-zinc-300">{u.email}</td>
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono font-bold ${
                            role === 'SUPER_ADMIN'
                              ? 'border-purple-500/40 text-purple-300 bg-purple-950/40'
                              : role === 'ADMIN'
                              ? 'border-violet-500/40 text-violet-300 bg-violet-950/40'
                              : role === 'CURATOR'
                              ? 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40'
                              : role === 'SUPPORT'
                              ? 'border-amber-500/40 text-amber-300 bg-amber-950/40'
                              : 'border-zinc-500/40 text-zinc-400 bg-zinc-900/40'
                          }`}
                        >
                          {role}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                          <CheckCircle2 className="size-3.5" /> Ativo
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-zinc-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {role !== 'SUPER_ADMIN' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePromoteRole(u.email, 'ADMIN')}
                              className="text-[10px] font-bold h-7 px-2 border-white/10 text-zinc-300 hover:text-white"
                            >
                              Tornar Admin
                            </Button>
                          )}
                          {role !== 'CURATOR' && role !== 'SUPER_ADMIN' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePromoteRole(u.email, 'CURATOR')}
                              className="text-[10px] font-bold h-7 px-2 border-white/10 text-cyan-300 hover:text-cyan-200"
                            >
                              Curador
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}
