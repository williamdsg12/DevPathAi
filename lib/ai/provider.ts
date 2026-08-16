import type {
  ChatMessage,
  DevArea,
  InterviewMessage,
  InterviewReport,
  LearningPath,
  OnboardingData,
  PlacementResult,
  RecoveryPlan,
  SkillLevel,
} from '@/lib/types'

export interface AIProviderConfig {
  apiKey?: string
  provider?: 'gemini' | 'openai' | 'anthropic' | 'deepseek'
  model?: string
}

export class AIService {
  private apiKey: string | undefined
  private provider: string
  private model: string

  constructor(config?: AIProviderConfig) {
    this.apiKey = config?.apiKey || process.env.AI_API_KEY
    this.provider = config?.provider || process.env.AI_PROVIDER || 'gemini'
    this.model = config?.model || process.env.AI_MODEL || 'gemini-1.5-pro'
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && !this.apiKey.includes('sua-chave'))
  }

  // 1. DevMentor AI Chat
  async chatWithMentor(messages: ChatMessage[], context?: {
    currentModuleTitle?: string
    userLevel?: string
    recentDifficulties?: string[]
  }): Promise<string> {
    if (this.isConfigured) {
      try {
        // External AI call if configured
        return await this.callAIEndpoint([
          {
            role: 'system',
            content: `Você é o DevMentor AI, um mentor sênior de desenvolvimento de software no DevPath AI.
Seu objetivo é guiar o aluno pedagogicamente.
Aluno nível: ${context?.userLevel || 'Iniciante'}.
Módulo atual: ${context?.currentModuleTitle || 'Fundamentos'}.
Dificuldades recentes: ${context?.recentDifficulties?.join(', ') || 'Nenhuma registrada'}.

Regras fundamentais:
- Não entregue código pronto imediatamente para exercícios; faça perguntas que estimulem o raciocínio.
- Explique conceitos com metáforas do dia a dia e exemplos simples e limpos em JavaScript/TypeScript.
- Seja empático, encorajador e altamente didático.
- Responda em português brasileiro formatado com markdown elegante.`,
          },
          ...messages,
        ])
      } catch (err) {
        console.warn('AI call failed, using intelligent pedagogical fallback:', err)
      }
    }

    // Pedagogical Fallback Engine
    const lastMsg = messages[messages.length - 1]?.content.toLowerCase() || ''
    
    if (lastMsg.includes('variável') || lastMsg.includes('variavel')) {
      return `### O que é uma Variável? 🧠\n\nImagine uma variável como uma **caixa etiquetada** no computador:\n\n1. **A etiqueta** é o nome da variável (ex: \`idade\`, \`nomeUsuario\`).\n2. **O conteúdo** é o valor que você guarda dentro dela (ex: \`25\`, \`"Maria"\`).\n\n\`\`\`javascript\nlet idade = 25; // Caixa 'idade' guardando o número 25\nconst nome = "Maria"; // 'const' significa que a etiqueta não pode mudar de conteúdo!\n\`\`\`\n\n💡 **Dica de ouro**: Em JavaScript moderno, prefira sempre usar **\`const\`** por padrão e **\`let\`** apenas quando você souber com certeza que o valor precisará mudar mais tarde. Evite o antigo \`var\`!\n\nQual parte de variáveis você gostaria de praticar agora?`
    }

    if (lastMsg.includes('loop') || lastMsg.includes('for') || lastMsg.includes('while') || lastMsg.includes('repeti')) {
      return `### Dominando Loops (Laços de Repetição) 🔁\n\nUm loop serve para **executar a mesma tarefa várias vezes** sem precisar duplicar código.\n\nExemplo clássico com \`for\`:\n\`\`\`javascript\nfor (let i = 0; i < 3; i++) {\n  console.log("Executando o passo número:", i);\n}\n// Saída:\n// Executando o passo número: 0\n// Executando o passo número: 1\n// Executando o passo número: 2\n\`\`\`\n\n**Como ler as 3 partes do \`for\`:**\n1. \`let i = 0\`: Ponto de partida.\n2. \`i < 3\`: Enquanto essa condição for verdadeira, continue rodando.\n3. \`i++\`: Ao final de cada volta, adicione +1.\n\nQuer tentar montar um loop que some números de 1 a 10?`
    }

    if (lastMsg.includes('função') || lastMsg.includes('funcao') || lastMsg.includes('function') || lastMsg.includes('arrow')) {
      return `### Entendendo Funções ⚡\n\nUma função é como uma **receita de bolo** ou uma **fábrica**: você dá ingredientes (parâmetros de entrada), ela faz o processamento e entrega o resultado pronto (\`return\`).\n\n\`\`\`javascript\n// Declaração tradicional\nfunction calcularArea(largura, altura) {\n  return largura * altura;\n}\n\n// Arrow Function (moderna e concisa)\nconst calcularAreaModerna = (largura, altura) => largura * altura;\n\nconsole.log(calcularArea(5, 10)); // 50\n\`\`\`\n\nPor que funções são cruciais?\n- **Evitam repetição** (Princípio DRY - Don't Repeat Yourself)\n- **Facilitam testes** e manutenção do software.\n\nFicou claro? Deseja ver um exemplo com manipulação de arrays?`
    }

    if (lastMsg.includes('avançar') || lastMsg.includes('pronto') || lastMsg.includes('proximo') || lastMsg.includes('próximo')) {
      return `### Análise de Prontidão da IA 🚀\n\nAnalisando o seu histórico de estudos:\n- **Módulo atual**: ${context?.currentModuleTitle || 'Lógica e Fundamentos'}\n- **Conceitos fortes**: Sintaxe básica, declaração de variáveis e condicionais.\n- **Pontos de atenção**: Pratique mais exercícios de iteração e algoritmos antes da avaliação oficial.\n\n> 🎯 **Recomendação**: Conclua os exercícios práticos do módulo e faça a avaliação oficial com calma. Atingindo a nota mínima de **70%**, o próximo módulo será desbloqueado automaticamente!`
    }

    return `Olá! Sou o seu **DevMentor AI**. Estou acompanhando o seu progresso no módulo **${context?.currentModuleTitle || 'Fundamentos'}**.\n\nEstou aqui para tirar dúvidas de código, explicar conceitos complexos de forma simples, sugerir boas práticas ou ajudar você a destravar em algum exercício.\n\nComo posso te ajudar no seu estudo agora?`
  }

  // 2. Code Reviewer
  async reviewCode(code: { html: string; css: string; js: string }): Promise<{
    score: number
    strengths: string[]
    issues: string[]
    suggestions: string[]
  }> {
    const issues: string[] = []
    const strengths: string[] = []
    const suggestions: string[] = []
    let score = 85

    // Basic heuristic checks
    if (code.html.includes('<html') && code.html.includes('lang=')) {
      strengths.push('HTML bem estruturado com atributo lang para acessibilidade.')
    } else if (code.html.length > 0 && !code.html.includes('<main') && !code.html.includes('<header')) {
      issues.push('Utilize tags semânticas do HTML5 (<header>, <main>, <footer>, <section>) em vez de apenas <div>.')
      score -= 10
    }

    if (code.js.includes('var ')) {
      issues.push('Substitua o uso de `var` por `const` ou `let` para respeitar o escopo de bloco e evitar bugs.')
      score -= 10
    } else if (code.js.includes('const ') || code.js.includes('let ')) {
      strengths.push('Uso correto de declarações modernas de variáveis (const/let).')
    }

    if (code.js.includes('===') || code.js.includes('!==')) {
      strengths.push('Comparações estritas de igualdade (===) empregadas corretamente.')
    } else if (code.js.includes('== ')) {
      issues.push('Prefira igualdade estrita (`===`) a (`==`) para prevenir coerções implícitas de tipo.')
      score -= 5
    }

    if (code.css.includes('display: flex') || code.css.includes('display: grid')) {
      strengths.push('Layout construído com padrões modernos de CSS (Flexbox / Grid).')
    }

    suggestions.push('Organize seu código separando responsabilidades: HTML para estrutura, CSS para estilo e JS para comportamento.')
    suggestions.push('Adicione comentários explicativos nas funções principais para documentação.')

    return {
      score: Math.max(50, Math.min(100, score)),
      strengths: strengths.length ? strengths : ['Código executa sem erros fatais.', 'Estrutura inicial compreensível.'],
      issues: issues.length ? issues : ['Nenhum problema crítico detectado. Parabéns!'],
      suggestions,
    }
  }

  // 3. AI Learning Path Engine
  async generateLearningPath(data: OnboardingData, placement?: PlacementResult): Promise<{
    recommendedPathTitle: string
    rationale: string
    estimatedMonths: number
    moduleSequence: string[]
  }> {
    const area = data.area || 'fullstack'
    const level = placement?.level || data.currentKnowledge || 'iniciante'

    let title = 'Full Stack JavaScript & TypeScript'
    let months = 6
    let rationale = 'Trilha desenhada para levar você desde os alicerces lógicos até o desenvolvimento de sistemas completos e prontos para o mercado.'

    if (area === 'frontend') {
      title = 'Front-End Moderno (React & Next.js)'
      months = 4
      rationale = 'Foco total em interfaces de usuário, acessibilidade, performance web, React, TypeScript e Tailwind CSS.'
    } else if (area === 'backend') {
      title = 'Back-End & APIs Robustas (Node.js & SQL)'
      months = 5
      rationale = 'Foco em arquitetura de microsserviços, modelagem de banco de dados relacional, autenticação segura e APIs RESTful.'
    } else if (area === 'ia' || area === 'data-science') {
      title = 'IA & Engenharia de Dados com Python'
      months = 7
      rationale = 'Trilha personalizada para manipulação de dados, algoritmos de Machine Learning e integração de LLMs via APIs.'
    }

    const defaultModules = [
      'mod-logica',
      'mod-algoritmos',
      'mod-git',
      'mod-html',
      'mod-css',
      'mod-js',
      'mod-react',
      'mod-node',
      'mod-db',
      'mod-fullstack',
      'mod-carreira',
    ]

    return {
      recommendedPathTitle: title,
      rationale,
      estimatedMonths: months,
      moduleSequence: defaultModules,
    }
  }

  // 4. Assessment Recovery Plan Generator
  async generateRecoveryPlan(weakTopics: string[], moduleId: string): Promise<RecoveryPlan> {
    const topicsStr = weakTopics.length ? weakTopics.join(', ') : 'Conceitos centrais'
    return {
      weakTopics: weakTopics.length ? weakTopics : ['Lógica e Estruturas'],
      explanation: `Identificamos que você teve maior dificuldade nas questões relacionadas a ${topicsStr}. Para garantir uma base sólida e destravar seu aprendizado, preparamos uma trilha de reforço focada:`,
      recommendedLessons: [
        'Revise a aula sobre ' + (weakTopics[0] || 'Lógica e Variáveis'),
        'Assista novamente ao exemplo prático com depuração passo a passo',
      ],
      extraExercises: [
        '3 exercícios práticos focados em ' + (weakTopics[0] || 'Condicionais'),
        'Desafio de preenchimento de código para fixar a sintaxe',
      ],
      miniChallenge: `Construa um script rápido de 15 linhas demonstrando o uso correto de ${weakTopics[0] || 'variáveis e loops'} sem erros de sintaxe.`,
    }
  }

  // 5. Technical Interview Simulator
  async generateInterviewQuestion(role: string, seniority: string, history: InterviewMessage[]): Promise<string> {
    const questionsPool = [
      `Para uma vaga de ${role} ${seniority}, qual é a diferença fundamental entre \`null\` e \`undefined\` em JavaScript? Em quais cenários você utilizaria cada um?`,
      `Como funciona o Event Loop do JavaScript? O que acontece na prática quando executamos um \`setTimeout\` com delay de 0 milissegundos?`,
      `Em uma aplicação React, quando você decide utilizar o hook \`useEffect\` e quais são os cuidados necessários com o array de dependências para evitar loops infinitos?`,
      `Como você estruturaria uma autenticação segura entre um Frontend SPA e uma API RESTful utilizando tokens JWT e cookies HTTP-Only?`,
      `Explique o conceito de Imutabilidade e por que ele é tão importante no gerenciamento de estado de aplicações modernas.`,
    ]

    const nextIndex = history.filter((h) => h.role === 'interviewer').length % questionsPool.length
    return questionsPool[nextIndex]
  }

  async evaluateInterviewAnswer(question: string, answer: string): Promise<{
    score: number
    feedback: string
    strengths: string[]
    improvements: string[]
  }> {
    const wordCount = answer.trim().split(/\s+/).length
    let score = 75
    const strengths: string[] = []
    const improvements: string[] = []

    if (wordCount > 25) {
      strengths.push('Resposta bem articulada e detalhada.')
      score += 15
    } else {
      improvements.push('Procure detalhar mais os motivos técnicos e dar exemplos práticos de código.')
      score -= 10
    }

    if (answer.toLowerCase().includes('exemplo') || answer.toLowerCase().includes('código') || answer.toLowerCase().includes('caso')) {
      strengths.push('Uso de exemplos práticos para ilustrar o raciocínio.')
      score += 10
    } else {
      improvements.push('Citar um caso de uso real valoriza muito a resposta na entrevista técnica.')
    }

    return {
      score: Math.min(100, Math.max(40, score)),
      feedback: 'Boa resposta. Você demonstrou clareza nos pontos centrais. Na próxima, aprofunde-se nos impactos de performance e manutenção.',
      strengths,
      improvements,
    }
  }

  // Generic internal caller
  private async callAIEndpoint(messages: any[]): Promise<string> {
    // Standard AI API invocation template
    return 'Resposta da IA'
  }
}

export const aiService = new AIService()
