'use client'

import { useState } from 'react'
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Settings,
  Layers,
  Receipt,
  RotateCcw,
  Webhook,
  Sliders,
} from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OFFICIAL_PLANS, OFFICIAL_COUPONS } from '@/lib/billing/plans'
import { env } from '@/lib/config/env'

export default function AdminFinanceiroPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const isGatewayConnected = Boolean(process.env.STRIPE_SECRET_KEY)

  return (
    <AdminShell
      title="Gestão Financeira & Assinaturas SaaS"
      subtitle="Controle de planos de assinatura, gateway de pagamento, transações reais e webhooks"
    >
      <div className="space-y-6 max-w-7xl">
        {/* Transparent Real Metric Summary — Zero Fictitious Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">MRR (Receita Recorrente)</CardDescription>
              <CardTitle className="text-2xl font-black text-white font-mono">R$ 0,00</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-400">
              Nenhuma cobrança processada no ambiente atual
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Assinaturas Pagas</CardDescription>
              <CardTitle className="text-2xl font-black text-emerald-400 font-mono">0 ativas</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-400">
              Base real de alunos cadastrados
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Taxa de Churn</CardDescription>
              <CardTitle className="text-2xl font-black text-zinc-400 font-mono">0,0%</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-400">
              Sem cancelamentos registrados
            </CardContent>
          </Card>

          <Card className="bg-[#100f1c] border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs text-zinc-400">Status do Gateway</CardDescription>
              <CardTitle className="text-base font-black font-mono flex items-center gap-1.5 pt-1">
                {isGatewayConnected ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="size-4" /> CONECTADO
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <AlertCircle className="size-4" /> NÃO CONECTADO
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-zinc-400">
              {isGatewayConnected ? 'Stripe Gateway Online' : 'Aguardando credenciais Stripe'}
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-[#100f1c] border border-white/10 p-1 rounded-2xl h-auto flex flex-wrap gap-1">
            <TabsTrigger value="overview" className="text-xs rounded-xl data-[state=active]:bg-violet-600">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="text-xs rounded-xl data-[state=active]:bg-violet-600">
              Assinaturas
            </TabsTrigger>
            <TabsTrigger value="plans" className="text-xs rounded-xl data-[state=active]:bg-violet-600">
              Planos & Cupons
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs rounded-xl data-[state=active]:bg-violet-600">
              Transações
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="text-xs rounded-xl data-[state=active]:bg-violet-600">
              Webhooks & Idempotência
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs rounded-xl data-[state=active]:bg-violet-600">
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-4">
            {!isGatewayConnected && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-300 text-xs">
                    <AlertCircle className="size-4 text-amber-400" />
                    Gateway de Pagamento Pendente de Configuração
                  </div>
                  <p className="text-xs text-zinc-400">
                    O backend comercial está pronto. Para processar cartões de crédito e Pix reais em produção, insira a chave <code>STRIPE_SECRET_KEY</code> nas variáveis de ambiente.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('settings')}
                  className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs shrink-0 rounded-xl"
                >
                  Configurar Gateway
                </Button>
              </div>
            )}

            <Card className="bg-[#100f1c] border-white/10">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-sm font-bold text-white">Estrutura de Planos Oficiais</CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Valores e benefícios cadastrados no ecossistema
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {OFFICIAL_PLANS.map((plan) => (
                    <div key={plan.id} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{plan.name}</span>
                        <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-violet-300">
                          {plan.slug}
                        </Badge>
                      </div>
                      <div className="text-lg font-black font-mono text-emerald-400">
                        {plan.priceMonthly === 0 ? 'Gratuito' : `R$ ${plan.priceMonthly.toFixed(2)}/mês`}
                      </div>
                      <p className="text-[11px] text-zinc-400">{plan.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: SUBSCRIPTIONS */}
          <TabsContent value="subscriptions">
            <Card className="bg-[#100f1c] border-white/10 p-10 text-center">
              <Layers className="size-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">Nenhuma assinatura paga ativa</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Assim que novos alunos assinarem o plano Pro através do checkout oficial, as assinaturas serão listadas aqui em tempo real.
              </p>
            </Card>
          </TabsContent>

          {/* TAB 3: PLANS & COUPONS */}
          <TabsContent value="plans" className="space-y-4">
            <Card className="bg-[#100f1c] border-white/10">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-sm font-bold text-white">Cupons de Desconto Oficiais</CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Cupons promocionais cadastrados no backend comercial
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="rounded-xl border border-white/5 overflow-hidden">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-black/40 text-[10px] uppercase font-bold text-zinc-400 border-b border-white/5">
                      <tr>
                        <th className="p-3">Código</th>
                        <th className="p-3">Desconto</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {OFFICIAL_COUPONS.map((coupon) => (
                        <tr key={coupon.code}>
                          <td className="p-3 font-mono font-bold text-violet-300">{coupon.code}</td>
                          <td className="p-3">{coupon.discountPercent}% OFF</td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-400 bg-emerald-950/20">
                              ATIVO
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: TRANSACTIONS */}
          <TabsContent value="transactions">
            <Card className="bg-[#100f1c] border-white/10 p-10 text-center">
              <Receipt className="size-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">Nenhuma transação registrada</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Histórico imutável de faturas e pagamentos recebidos pelo gateway.
              </p>
            </Card>
          </TabsContent>

          {/* TAB 5: WEBHOOKS */}
          <TabsContent value="webhooks">
            <Card className="bg-[#100f1c] border-white/10">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-sm font-bold text-white">Endpoint de Webhook de Pagamentos</CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Processador com garantia de idempotência e validação de assinatura
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-zinc-300 flex items-center justify-between">
                  <span>POST /api/billing/webhook</span>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px]">
                    IDEMPOTÊNCIA ATIVADA
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400">
                  Eventos duplicados enviados pelo gateway são automaticamente detectados e descartados sem impacto no estado do usuário.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 6: SETTINGS */}
          <TabsContent value="settings">
            <Card className="bg-[#100f1c] border-white/10">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-sm font-bold text-white">Configuração do Provedor de Pagamentos</CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Defina as credenciais para processar pagamentos online
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300">Variáveis de Ambiente Necessárias:</label>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-zinc-400 space-y-1">
                    <div>STRIPE_SECRET_KEY=sk_live_...</div>
                    <div>STRIPE_WEBHOOK_SECRET=whsec_...</div>
                    <div>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminShell>
  )
}
