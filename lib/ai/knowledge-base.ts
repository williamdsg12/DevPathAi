/**
 * Knowledge Base & RAG Retrieval Engine — DevPath AI
 *
 * Provides indexed technical documentation, platform guidelines,
 * and semantic relevance matching to ground the AI responses.
 */

import type { AIKnowledgeItem } from '@/lib/types'

export const INITIAL_AI_KNOWLEDGE: AIKnowledgeItem[] = [
  {
    id: 'kb-curriculum-matrix',
    title: 'Matriz Curricular & Pré-Requisitos do DevPath AI',
    category: 'Plataforma',
    tags: ['trilha', 'cursos', 'modulos', 'progressao', 'pre-requisitos'],
    content: `A formação do DevPath AI segue a ordem pedagógica estrita:
1. Lógica de Programação e Pensamento Computacional (Variáveis, Condicionais, Loops, Funções, Vetores).
2. HTML5 Semântico e CSS3 Moderno (Flexbox, Grid, Responsividade).
3. JavaScript Moderno ES6+ (DOM, Eventos, Arrays funcionais, Async/Await).
4. Front-end com React & Next.js (Componentes, Hooks, Server Components).
5. Back-end com Node.js & Bancos de Dados (REST APIs, PostgreSQL/Supabase, Autenticação JWT).
Regra: O aluno deve obter nota mínima de 70% na avaliação de cada módulo para liberar o próximo.`,
    sourceUrl: 'https://devpath.ai/trilha',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kb-javascript-standards',
    title: 'JavaScript Moderno ES6+ & Boas Práticas',
    category: 'Programação',
    tags: ['javascript', 'es6', 'const', 'let', 'arrow-functions', 'clean-code'],
    content: `Diretrizes oficiais de JavaScript no DevPath:
- Nunca utilizar 'var'. Usar 'const' por padrão e 'let' apenas quando houver reatribuição de valor.
- Preferir funções puras e métodos imutáveis de array (.map, .filter, .reduce, .find).
- Utilizar template literals (\`\${variavel}\`) em vez de concatenação com '+'.
- Em código assíncrono, priorizar 'async/await' com bloco 'try/catch' em vez de encadeamento excessivo de '.then()'.
- Sempre validar tipos ou utilizar TypeScript para tipagem estrita.`,
    sourceUrl: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kb-functions-and-scope',
    title: 'Funções, Retornos e Escopo em JavaScript',
    category: 'Programação',
    tags: ['funcoes', 'return', 'escopo', 'parametros', 'closures'],
    content: `Conceitos essenciais de Funções:
- Uma função sem instrução 'return' explícita retorna 'undefined' por padrão.
- Parâmetros são variáveis locais criadas na chamada da função.
- Escopo léxico: variáveis declaradas dentro de uma função com const/let não são acessíveis fora dela (escopo de bloco).
- Erro comum em iniciantes: esquecer de colocar 'return' ou colocar código após a linha do 'return' (código inalcançável).`,
    sourceUrl: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Functions',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kb-loops-and-iteration',
    title: 'Estruturas de Repetição (Loops) & Prevenção de Loops Infinitos',
    category: 'Lógica',
    tags: ['loops', 'for', 'while', 'iteracao', 'loop-infinito'],
    content: `Diretrizes para Laços de Repetição:
- 'for (inicializacao; condicao; incremento)': Utilizado quando o número de iterações é previamente conhecido.
- 'while (condicao)': Utilizado quando o loop depende de uma condição dinâmica que muda dentro do bloco.
- Prevenção de Loop Infinito: A variável de controle da condição DEVE ser modificada dentro do corpo do laço (ex: i++).
- Para percorrer arrays modernos, prefira 'for...of' ou métodos funcionais (.forEach, .map).`,
    sourceUrl: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Loops_and_iteration',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kb-pedagogical-hints',
    title: 'Diretrizes de Resolução de Exercícios & Níveis de Dica (1 a 5)',
    category: 'Pedagogia',
    tags: ['dicas', 'exercicios', 'socratico', 'metodologia', 'ajuda'],
    content: `Escalada de Dicas Pedagógicas do DevPath AI:
- Nível 1 (Orientação): Não fornecer código. Fazer uma pergunta reflexiva sobre o objetivo do exercício.
- Nível 2 (Conceito): Explicar a teoria ou fazer uma analogia do mundo real (ex: caixa para variável, lista de compras para array).
- Nível 3 (Estratégia): Listar os 3 ou 4 passos lógicos em português do algoritmo necessário.
- Nível 4 (Pseudocódigo): Enviar a estrutura de código com lacunas (TODO) para o aluno preencher.
- Nível 5 (Solução Completa): Somente após múltiplas tentativas ou solicitação explícita de revisão autorizada.`,
    sourceUrl: 'https://devpath.ai/metodologia',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

/**
 * Searches the knowledge base using keyword, tag, and category matching.
 */
export function retrieveRelevantKnowledge(
  query: string,
  knowledgeList: AIKnowledgeItem[] = INITIAL_AI_KNOWLEDGE,
  maxItems = 3
): { items: AIKnowledgeItem[]; titles: string[]; citations: Array<{ title: string; url: string }> } {
  const safeList = Array.isArray(knowledgeList) && knowledgeList.length > 0 ? knowledgeList : INITIAL_AI_KNOWLEDGE
  if (!query || safeList.length === 0) {
    return { items: [], titles: [], citations: [] }
  }

  const queryTerms = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/\W+/)
    .filter((term) => term.length > 2)

  const scored = safeList
    .filter((k) => k.active)
    .map((item) => {
      let score = 0
      const titleLower = item.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
      const contentLower = item.content
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
      const categoryLower = item.category.toLowerCase()

      queryTerms.forEach((term) => {
        // Tag match (highest weight)
        if (item.tags.some((t) => t.toLowerCase().includes(term))) score += 8
        // Title match
        if (titleLower.includes(term)) score += 5
        // Category match
        if (categoryLower.includes(term)) score += 3
        // Content match
        if (contentLower.includes(term)) score += 1
      })

      return { item, score }
    })

  const topItems = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxItems)
    .map((s) => s.item)

  const citations = topItems
    .filter((item) => Boolean(item.sourceUrl))
    .map((item) => ({ title: item.title, url: item.sourceUrl || '' }))

  return {
    items: topItems,
    titles: topItems.map((i) => i.title),
    citations,
  }
}
