'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Briefcase,
  CheckCircle2,
  Clock,
  Code2,
  Compass,
  Laptop,
  Layers,
  Lightbulb,
  MapPin,
  Sparkles,
  Target,
  Wrench,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Logo } from '@/components/logo'
import { OptionCard } from '@/components/onboarding/option-card'
import { useAppStore } from '@/lib/store'
import type { CareerGoal, DevArea, LearningStyle, OnboardingData, SkillLevel } from '@/lib/types'

export default function OnboardingPage() {
  const router = useRouter()
  const { completeOnboarding, profile } = useAppStore()
  const [step, setStep] = useState(1)
  const totalSteps = 11

  const [formData, setFormData] = useState<OnboardingData>({
    currentKnowledge: 'iniciante',
    goal: 'primeiro-emprego',
    area: 'fullstack',
    technologies: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
    hoursPerDay: '2 horas/dia',
    daysPerWeek: 5,
    hasComputer: true,
    knownTopics: ['Lógica básica'],
    biggestGoal: 'Conseguir meu primeiro emprego como desenvolvedor de software.',
    biggestDifficulty: 'Saber a ordem certa de estudos e manter a consistência diária.',
    learningStyle: 'misto',
  })

  function toggleTechnology(tech: string) {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.includes(tech)
        ? prev.technologies.filter((t) => t !== tech)
        : [...prev.technologies, tech],
    }))
  }

  function toggleTopic(topic: string) {
    setFormData((prev) => ({
      ...prev,
      knownTopics: prev.knownTopics.includes(topic)
        ? prev.knownTopics.filter((t) => t !== topic)
        : [...prev.knownTopics, topic],
    }))
  }

  function handleNext() {
    if (step < totalSteps) {
      setStep((s) => s + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      completeOnboarding(formData)
      toast.success('Perfil configurado! Vamos ao teste rápido de nivelamento.')
      router.push('/nivelamento')
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep((s) => s - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const progressPercent = Math.round((step / totalSteps) * 100)

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between pb-6">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground">
            Pergunta {step} de {totalSteps}
          </span>
          <div className="w-28 sm:w-36">
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="mx-auto w-full max-w-3xl flex-1 flex flex-col justify-center">
        <Card className="border-border/80 shadow-2xl shadow-primary/5">
          <CardHeader className="space-y-1 sm:space-y-2">
            {step === 1 && (
              <>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Brain className="size-6 text-primary" /> 1. Qual é o seu nível atual em programação?
                </CardTitle>
                <CardDescription>
                  Seja sincero — a IA adaptará o ponto de partida ideal para você.
                </CardDescription>
              </>
            )}

            {step === 2 && (
              <>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Target className="size-6 text-primary" /> 2. Qual é o seu objetivo principal?
                </CardTitle>
                <CardDescription>O que você quer conquistar com a programação?</CardDescription>
              </>
            )}

            {step === 3 && (
              <>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Compass className="size-6 text-primary" /> 3. Em qual área você deseja focar?
                </CardTitle>
                <CardDescription>Escolha a área que mais combina com seus interesses.</CardDescription>
              </>
            )}

            {step === 4 && (
              <>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Code2 className="size-6 text-primary" /> 4. Quais tecnologias você quer aprender?
                </CardTitle>
                <CardDescription>Você pode selecionar mais de uma tecnologia.</CardDescription>
              </>
            )}

            {step === 5 && (
              <>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Clock className="size-6 text-primary" /> 5. Quanto tempo você pode dedicar por dia?
                </CardTitle>
                <CardDescription>Constância é mais importante do que estudar 10h em um único dia.</CardDescription>
              </>
            )}

            {step === 6 && (
              <>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Briefcase className="size-6 text-primary" /> 6. Quantos dias por semana pretende estudar?
                </CardTitle>
                <CardDescription>Defina sua frequência para montarmos seu cronograma inteligente.</CardDescription>
              </>
            )}

            {step === 7 && (
              <>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Laptop className="size-6 text-primary" /> 7. Você possui um computador para praticar?
                </CardTitle>
                <CardDescription>Nosso Code Lab roda direto no navegador, mas praticar no PC acelera seu ritmo.</CardDescription>
              </>
            )}

            {step === 8 && (
              <>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Wrench className="size-6 text-primary" /> 8. O que você já conhece ou teve contato?
                </CardTitle>
                <CardDescription>Marque tudo o que você já viu, mesmo que superficialmente.</CardDescription>
              </>
            )}

            {step === 9 && (
              <>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="size-6 text-primary" /> 9. Qual o seu maior sonho profissional?
                </CardTitle>
                <CardDescription>Descreva em poucas palavras sua visão para os próximos 12 meses.</CardDescription>
              </>
            )}

            {step === 10 && (
              <>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Lightbulb className="size-6 text-primary" /> 10. Qual a sua maior dificuldade ao estudar?
                </CardTitle>
                <CardDescription>O DevMentor AI usará isso para ajudar você a não desistir.</CardDescription>
              </>
            )}

            {step === 11 && (
              <>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Layers className="size-6 text-primary" /> 11. Qual o seu estilo de aprendizagem preferido?
                </CardTitle>
                <CardDescription>Como você assimila melhor conteúdos complexos?</CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="pt-4">
            {/* Step 1: Nível */}
            {step === 1 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { key: 'iniciante-absoluto', label: 'Iniciante Absoluto', desc: 'Nunca escrevi uma linha de código na vida.' },
                  { key: 'iniciante', label: 'Iniciante', desc: 'Já vi vídeos ou fiz tutoriais, mas ainda me sinto perdido.' },
                  { key: 'basico', label: 'Básico', desc: 'Conheço variáveis, if/else, loops e sintaxe básica.' },
                  { key: 'intermediario', label: 'Intermediário', desc: 'Já crio pequenos projetos e conheço frameworks.' },
                  { key: 'avancado', label: 'Avançado', desc: 'Tenho boa experiência e quero me especializar.' },
                ].map((item) => (
                  <OptionCard
                    key={item.key}
                    label={item.label}
                    description={item.desc}
                    selected={formData.currentKnowledge === item.key}
                    onClick={() => setFormData({ ...formData, currentKnowledge: item.key as SkillLevel })}
                  />
                ))}
              </div>
            )}

            {/* Step 2: Objetivo */}
            {step === 2 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { key: 'primeiro-emprego', label: 'Conseguir 1º Emprego', desc: 'Quero entrar no mercado como desenvolvedor Júnior.' },
                  { key: 'transicao', label: 'Transição de Carreira', desc: 'Quero mudar de área e trabalhar com tecnologia.' },
                  { key: 'remoto', label: 'Trabalho Remoto / Gringa', desc: 'Quero trabalhar de casa ou para empresas do exterior.' },
                  { key: 'freelancer', label: 'Freelancer', desc: 'Quero prestar serviços e criar projetos sob demanda.' },
                  { key: 'proprios-sistemas', label: 'Criar Meus Próprios Projetos', desc: 'Quero tirar ideias do papel e lançar SaaS.' },
                  { key: 'evoluir', label: 'Evoluir na Carreira', desc: 'Já atuo na área e quero acelerar minhas promoções.' },
                ].map((item) => (
                  <OptionCard
                    key={item.key}
                    label={item.label}
                    description={item.desc}
                    selected={formData.goal === item.key}
                    onClick={() => setFormData({ ...formData, goal: item.key as CareerGoal })}
                  />
                ))}
              </div>
            )}

            {/* Step 3: Área */}
            {step === 3 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { key: 'fullstack', label: 'Full Stack', desc: 'Frontend + Backend + Banco de Dados (Mais recomendado)' },
                  { key: 'frontend', label: 'Front-end', desc: 'Interfaces visuais, React, Next.js e experiência do usuário.' },
                  { key: 'backend', label: 'Back-end & APIs', desc: 'Servidores, regras de negócio, microsserviços e SQL.' },
                  { key: 'mobile', label: 'Mobile (React Native / Flutter)', desc: 'Aplicativos para Android e iOS.' },
                  { key: 'ia', label: 'Inteligência Artificial & Dados', desc: 'Python, Machine Learning e integração de LLMs.' },
                  { key: 'devops', label: 'DevOps & Cloud', desc: 'CI/CD, Docker, Kubernetes e infraestrutura na nuvem.' },
                ].map((item) => (
                  <OptionCard
                    key={item.key}
                    label={item.label}
                    description={item.desc}
                    selected={formData.area === item.key}
                    onClick={() => setFormData({ ...formData, area: item.key as DevArea })}
                  />
                ))}
              </div>
            )}

            {/* Step 4: Tecnologias */}
            {step === 4 && (
              <div className="grid gap-2.5 sm:grid-cols-3">
                {[
                  'JavaScript',
                  'TypeScript',
                  'React',
                  'Next.js',
                  'Node.js',
                  'Tailwind CSS',
                  'PostgreSQL / SQL',
                  'Python',
                  'Git & GitHub',
                  'Docker',
                  'Java',
                  'C# / .NET',
                ].map((tech) => {
                  const isSelected = formData.technologies.includes(tech)
                  return (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleTechnology(tech)}
                      className={`flex items-center justify-between rounded-xl border p-3.5 text-left text-sm font-semibold transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary'
                          : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      <span>{tech}</span>
                      {isSelected ? <CheckCircle2 className="size-4 text-primary" /> : null}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Step 5: Tempo por dia */}
            {step === 5 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { val: '30 minutos/dia', desc: 'Ritmo leve e consistente para dias corridos.' },
                  { val: '1 hora/dia', desc: 'Equilíbrio excelente entre rotina e evolução.' },
                  { val: '2 horas/dia', desc: 'Ritmo acelerado para transição rápida.' },
                  { val: '4+ horas/dia', desc: 'Imersão total e dedicação exclusiva.' },
                ].map((item) => (
                  <OptionCard
                    key={item.val}
                    label={item.val}
                    description={item.desc}
                    selected={formData.hoursPerDay === item.val}
                    onClick={() => setFormData({ ...formData, hoursPerDay: item.val })}
                  />
                ))}
              </div>
            )}

            {/* Step 6: Dias por semana */}
            {step === 6 && (
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { days: 3, label: '3 dias / semana', desc: 'Seg, Qua, Sex' },
                  { days: 5, label: '5 dias / semana', desc: 'Segunda a Sexta' },
                  { days: 6, label: '6 dias / semana', desc: 'Segunda a Sábado' },
                  { days: 7, label: 'Todos os dias', desc: 'Consistência diária' },
                ].map((item) => (
                  <OptionCard
                    key={item.days}
                    label={item.label}
                    description={item.desc}
                    selected={formData.daysPerWeek === item.days}
                    onClick={() => setFormData({ ...formData, daysPerWeek: item.days })}
                  />
                ))}
              </div>
            )}

            {/* Step 7: Possui Computador */}
            {step === 7 && (
              <div className="grid gap-3 sm:grid-cols-2">
                <OptionCard
                  label="Sim, possuo computador / notebook"
                  description="Perfeito. Você poderá usar o Code Lab e instalar as ferramentas profissionais."
                  selected={formData.hasComputer === true}
                  onClick={() => setFormData({ ...formData, hasComputer: true })}
                />
                <OptionCard
                  label="Ainda não (estudo pelo celular / tablet)"
                  description="Sem problemas! Nosso Code Lab integrado funciona 100% no navegador mobile."
                  selected={formData.hasComputer === false}
                  onClick={() => setFormData({ ...formData, hasComputer: false })}
                />
              </div>
            )}

            {/* Step 8: Conhecimentos Anteriores */}
            {step === 8 && (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {[
                  'Lógica de programação',
                  'HTML & Semântica',
                  'CSS & Flexbox/Grid',
                  'JavaScript básico',
                  'Git e GitHub',
                  'Banco de dados / SQL',
                  'Consumo de APIs REST',
                  'Nenhum conhecimento prévio (Começar do zero)',
                ].map((topic) => {
                  const isSelected = formData.knownTopics.includes(topic)
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`flex items-center justify-between rounded-xl border p-3.5 text-left text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary'
                          : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      <span>{topic}</span>
                      {isSelected ? <CheckCircle2 className="size-4 text-primary" /> : null}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Step 9: Maior Objetivo */}
            {step === 9 && (
              <div className="space-y-4">
                <Textarea
                  rows={4}
                  placeholder="Ex: Quero conseguir minha primeira vaga júnior até o final deste ano e construir aplicações completas..."
                  value={formData.biggestGoal}
                  onChange={(e) => setFormData({ ...formData, biggestGoal: e.target.value })}
                  className="text-sm leading-relaxed"
                />
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground self-center">Sugestões:</span>
                  {[
                    'Conseguir 1º emprego como Desenvolvedor Full Stack Júnior',
                    'Trabalhar remotamente e ganhar em dólar/euro',
                    'Construir e monetizar meu próprio SaaS',
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setFormData({ ...formData, biggestGoal: sug })}
                      className="rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 10: Maior Dificuldade */}
            {step === 10 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: 'Não saber o que estudar a seguir', desc: 'Sensação de estar pulando de tutorial em tutorial sem rumo.' },
                  { label: 'Entender a lógica e resolver problemas', desc: 'Dificuldade em transformar o raciocínio em código funcional.' },
                  { label: 'Manter a consistência e disciplina', desc: 'Começar com empolgação mas parar após algumas semanas.' },
                  { label: 'Falta de tempo na rotina diária', desc: 'Conciliar trabalho, família e estudos de programação.' },
                ].map((item) => (
                  <OptionCard
                    key={item.label}
                    label={item.label}
                    description={item.desc}
                    selected={formData.biggestDifficulty === item.label}
                    onClick={() => setFormData({ ...formData, biggestDifficulty: item.label })}
                  />
                ))}
              </div>
            )}

            {/* Step 11: Estilo de Aprendizagem */}
            {step === 11 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { key: 'misto', label: 'Estilo Misto (Recomendado)', desc: 'Vídeos curtos, resumos teóricos e muitos exercícios práticos.' },
                  { key: 'projetos', label: 'Aprender Construindo Projetos', desc: 'Mão na massa imediata desenvolvendo aplicações reais.' },
                  { key: 'exercicios', label: 'Foco em Desafios e Exercícios', desc: 'Fixação por repetição, resolução de problemas e testes.' },
                  { key: 'videos', label: 'Aulas em Vídeo', desc: 'Acompanhar o professor programando passo a passo.' },
                  { key: 'leitura', label: 'Artigos e Documentação', desc: 'Leitura técnica aprofundada com snippets de código.' },
                ].map((item) => (
                  <OptionCard
                    key={item.key}
                    label={item.label}
                    description={item.desc}
                    selected={formData.learningStyle === item.key}
                    onClick={() => setFormData({ ...formData, learningStyle: item.key as LearningStyle })}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Controls */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="gap-2"
          >
            <ArrowLeft className="size-4" /> Voltar
          </Button>

          <Button onClick={handleNext} className="gap-2 shadow-lg shadow-primary/20">
            {step === totalSteps ? 'Concluir e Fazer Nivelamento' : 'Avançar'}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-3xl pt-6 text-center text-xs text-muted-foreground">
        DevPath AI — Personalização inteligente de trilha de aprendizagem.
      </footer>
    </div>
  )
}
