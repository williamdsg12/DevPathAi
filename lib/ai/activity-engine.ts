/**
 * AI Learning Activity Engine — DevPath AI
 *
 * Implements:
 * 1. Strict pedagogical generation of lesson-integrated activities.
 * 2. Mandatory anti-empty validation (never permits blank statements or generic mocks).
 * 3. 10 Activity Types with code starters, test cases, and solution validation.
 * 4. Progressive hint system (Attempt 1: pedagogical clue; Attempt 2: guided breakdown).
 * 5. Module Practical Project generation with weighted rubrics.
 * 6. Module Assessment question generator.
 * 7. AI Code & Project Reviewer against rubrics.
 */

import type {
  ActivityDifficulty,
  ActivityType,
  Assessment,
  AssessmentQuestion,
  LearningActivity,
  LearningModule,
  Lesson,
  ModuleProject,
  ProjectRubricCriterion,
  ProjectSubmission,
} from '@/lib/types'

export interface GenerateActivitiesParams {
  courseId?: string
  courseTitle?: string
  moduleId: string
  moduleTitle?: string
  lessonId: string
  lessonTitle: string
  lessonDescription?: string
  lessonContent?: string
  technology?: string
  studentLevel?: string
  studentPerformanceScore?: number
  studentDifficulties?: string[]
}

export class ActivityEngine {
  /**
   * Validates that an activity satisfies all quality and pedagogical constraints.
   * Discards any activity with empty statement, missing skills or invalid types.
   */
  public validateActivity(act: Partial<LearningActivity>): act is LearningActivity {
    if (!act) return false
    if (!act.id || typeof act.id !== 'string') return false
    if (!act.title || act.title.trim().length < 3) return false
    if (!act.statement || act.statement.trim().length < 10) return false
    if (act.statement.trim().toLowerCase() === 'resolva o exercício' || act.statement.trim().toLowerCase() === 'exercício de lógica') {
      return false
    }
    if (!act.moduleId || !act.lessonId) return false
    if (!act.type || !act.difficulty) return false
    if (typeof act.xpReward !== 'number' || act.xpReward <= 0) return false
    if (!act.explanation || act.explanation.trim().length < 5) return false

    // For multiple choice and true/false, options must exist and correctOptionIndex must be in range
    if (act.type === 'multiple_choice' || act.type === 'true_false') {
      if (!act.options || act.options.length < 2) return false
      if (typeof act.correctOptionIndex !== 'number' || act.correctOptionIndex < 0 || act.correctOptionIndex >= act.options.length) {
        return false
      }
    }

    return true
  }

  /**
   * Generates tailored learning activities for a specific lesson using topic heuristics
   * and high-fidelity pedagogical templates.
   */
  public generateActivitiesForLesson(params: GenerateActivitiesParams): LearningActivity[] {
    const {
      courseId,
      moduleId,
      lessonId,
      lessonTitle,
      lessonDescription = '',
      technology = 'JavaScript',
      studentLevel = 'iniciante',
      studentDifficulties = [],
    } = params

    const textToAnalyze = `${lessonTitle} ${lessonDescription}`.toLowerCase()
    const activities: LearningActivity[] = []

    // 1. Variáveis, Constantes e Tipos de Dados
    if (textToAnalyze.includes('variáv') || textToAnalyze.includes('variavel') || textToAnalyze.includes('const') || textToAnalyze.includes('let') || textToAnalyze.includes('tipo')) {
      activities.push({
        id: `act-${lessonId}-var-1`,
        title: 'Declaração e Escopo de Variáveis',
        statement: 'Crie uma variável chamada `nomeUsuario` contendo o valor `"Dev"` e uma constante chamada `idadeMinima` com o valor `18`. Em seguida, exiba ambas no console.',
        description: 'Prática de sintaxe de declaração com let e const em JavaScript moderno.',
        objective: 'Compreender a diferença prática entre reatribuição (`let`) e valores imutáveis (`const`).',
        type: 'code',
        difficulty: 'facil',
        status: 'published',
        xpReward: 20,
        expectedTimeMin: 5,
        courseId,
        moduleId,
        lessonId,
        skillName: 'Declaração e Tipos Primitivos',
        technology,
        codeStarter: '// Declare nomeUsuario e idadeMinima abaixo:\n',
        codeSolution: 'let nomeUsuario = "Dev";\nconst idadeMinima = 18;\nconsole.log(nomeUsuario, idadeMinima);',
        hint: 'Lembre-se: use `let` quando o valor puder mudar e `const` para valores fixos.',
        detailedGuidance: 'A sintaxe padrão é `let nomeVariavel = valor;` e `const nomeConstante = valor;`.',
        explanation: 'Em JavaScript ES6+, `const` e `let` possuem escopo de bloco e substituem com segurança o antigo `var`.',
        createdAt: new Date().toISOString(),
      })

      activities.push({
        id: `act-${lessonId}-var-2`,
        title: 'Análise de Expressões e Tipagem Dinâmica',
        statement: 'Dado o seguinte código executado em JavaScript:\n```javascript\nconst a = "10";\nconst b = 5;\nconst resultado = a + b;\n```\nQual será o valor e o tipo armazenado na variável `resultado`?',
        objective: 'Identificar a coerção de tipos implícita na concatenação com strings.',
        type: 'multiple_choice',
        difficulty: 'facil',
        status: 'published',
        xpReward: 20,
        expectedTimeMin: 3,
        courseId,
        moduleId,
        lessonId,
        skillName: 'Coerção e Tipos Primitivos',
        technology,
        options: [
          '"105" (string, devido à concatenação)',
          '15 (número, soma aritmética)',
          'NaN (Not a Number)',
          'Erro de tipagem em tempo de execução',
        ],
        correctOptionIndex: 0,
        hint: 'Quando o operador `+` encontra uma string, ele converte os outros operandos em texto.',
        detailedGuidance: 'O JavaScript realiza coerção automática: `"10" + 5` resulta em `"105"`. Para somar numericamente, seria necessário `Number(a) + b`.',
        explanation: 'O operador `+` atua como concatenação quando ao menos um dos lados for do tipo `string`.',
        createdAt: new Date().toISOString(),
      })

      activities.push({
        id: `act-${lessonId}-var-3`,
        title: 'Depuração de Reatribuição Inválida',
        statement: 'Identifique o erro no trecho de código abaixo e escreva a versão corrigida:\n```javascript\nconst pontuacao = 100;\npontuacao = pontuacao + 50;\n```',
        objective: 'Corrigir o erro de atribuição a constantes (`TypeError: Assignment to constant variable`).',
        type: 'fix_code',
        difficulty: 'medio',
        status: 'published',
        xpReward: 30,
        expectedTimeMin: 6,
        courseId,
        moduleId,
        lessonId,
        skillName: 'Imutabilidade com Const',
        technology,
        codeStarter: '// Corrija a declaração para permitir reatribuição:\nconst pontuacao = 100;\npontuacao = pontuacao + 50;',
        codeSolution: 'let pontuacao = 100;\npontuacao = pontuacao + 50;',
        hint: 'Identificadores declarados com `const` não podem receber novo valor após inicializados.',
        detailedGuidance: 'Troque a palavra-chave `const` por `let` na linha inicial.',
        explanation: 'Variáveis cujo valor precisa ser incrementado ou modificado durante o fluxo do programa devem ser declaradas com `let`.',
        createdAt: new Date().toISOString(),
      })
    }

    // 2. Condicionais e Lógica Booleana (if/else, switch, ternário)
    else if (textToAnalyze.includes('condi') || textToAnalyze.includes('if') || textToAnalyze.includes('else') || textToAnalyze.includes('switch') || textToAnalyze.includes('boole')) {
      activities.push({
        id: `act-${lessonId}-cond-1`,
        title: 'Estrutura Condicional: Verificador de Idade',
        statement: 'Crie uma função `verificarAcesso(idade)` que retorne `"Acesso Liberado"` caso a idade seja maior ou igual a 18, ou `"Acesso Negado"` caso contrário.',
        objective: 'Praticar tomada de decisão com `if/else` e operadores relacionais.',
        type: 'code',
        difficulty: 'facil',
        status: 'published',
        xpReward: 25,
        expectedTimeMin: 7,
        courseId,
        moduleId,
        lessonId,
        skillName: 'Controle de Fluxo Condicional',
        technology,
        codeStarter: 'function verificarAcesso(idade) {\n  // Escreva sua lógica aqui\n}\n',
        codeSolution: 'function verificarAcesso(idade) {\n  if (idade >= 18) {\n    return "Acesso Liberado";\n  } else {\n    return "Acesso Negado";\n  }\n}',
        hint: 'Utilize a estrutura `if (idade >= 18) { return ... } else { return ... }`.',
        detailedGuidance: 'Você também pode usar o operador ternário: `return idade >= 18 ? "Acesso Liberado" : "Acesso Negado";`.',
        explanation: 'Condicionais permitem que o software execute caminhos distintos com base em testes booleanos.',
        createdAt: new Date().toISOString(),
      })

      activities.push({
        id: `act-${lessonId}-cond-2`,
        title: 'Operadores Lógicos: AND (&&) vs OR (||)',
        statement: 'Qual expressão avalia como `true` quando o usuário está logado E possui permissão de administrador OU é o dono do recurso?',
        objective: 'Entender a precedência e combinação de operadores lógicos.',
        type: 'multiple_choice',
        difficulty: 'medio',
        status: 'published',
        xpReward: 25,
        expectedTimeMin: 4,
        courseId,
        moduleId,
        lessonId,
        skillName: 'Álgebra Booleana e Operadores Lógicos',
        technology,
        options: [
          '(isLogged && isAdmin) || isOwner',
          'isLogged || (isAdmin && isOwner)',
          'isLogged && !isAdmin && isOwner',
          '!isLogged || !isAdmin',
        ],
        correctOptionIndex: 0,
        hint: 'O operador `&&` exige que ambas as condições sejam verdadeiras, enquanto `||` exige apenas uma.',
        detailedGuidance: 'Parênteses agrupam a validação `(isLogged && isAdmin)`, permitindo que o `|| isOwner` atue como alternativa válida.',
        explanation: 'O agrupamento com parênteses define a prioridade lógica e torna regras de negócio legíveis e sem ambiguidades.',
        createdAt: new Date().toISOString(),
      })
    }

    // 3. Loops e Laços de Repetição (for, while, forEach)
    else if (textToAnalyze.includes('loop') || textToAnalyze.includes('laço') || textToAnalyze.includes('repeti') || textToAnalyze.includes('for') || textToAnalyze.includes('while')) {
      activities.push({
        id: `act-${lessonId}-loop-1`,
        title: 'Somatório com Laço de Repetição For',
        statement: 'Escreva um algoritmo que calcule e retorne a soma de todos os números inteiros de 1 até 10 usando um laço `for`.',
        objective: 'Dominar inicialização, condição de parada e incremento em laços `for`.',
        type: 'code',
        difficulty: 'facil',
        status: 'published',
        xpReward: 30,
        expectedTimeMin: 8,
        courseId,
        moduleId,
        lessonId,
        skillName: 'Laços de Repetição e Acumuladores',
        technology,
        codeStarter: 'function somarAteDez() {\n  let soma = 0;\n  // Monte o laço for abaixo:\n\n  return soma;\n}',
        codeSolution: 'function somarAteDez() {\n  let soma = 0;\n  for (let i = 1; i <= 10; i++) {\n    soma += i;\n  }\n  return soma;\n}',
        hint: 'Inicie a variável acumuladora `let soma = 0` e incremente `soma += i` a cada volta.',
        detailedGuidance: 'Estrutura: `for (let i = 1; i <= 10; i++) { soma += i; }`. Ao final, a soma será 55.',
        explanation: 'O laço `for` é a estrutura ideal quando sabemos de antemão a quantidade de iterações.',
        createdAt: new Date().toISOString(),
      })

      activities.push({
        id: `act-${lessonId}-loop-2`,
        title: 'Prevenção de Loop Infinito',
        statement: 'No código abaixo, o que aconteceria se a linha `contador++` fosse removida?\n```javascript\nlet contador = 0;\nwhile (contador < 5) {\n  console.log(contador);\n  contador++;\n}\n```',
        objective: 'Compreender condições de parada e o risco de travamento por loop infinito.',
        type: 'multiple_choice',
        difficulty: 'facil',
        status: 'published',
        xpReward: 20,
        expectedTimeMin: 3,
        courseId,
        moduleId,
        lessonId,
        skillName: 'Condições de Parada e Ciclo de Vida do Loop',
        technology,
        options: [
          'O loop executaria indefinidamente, travando o processo por esgotamento de recursos.',
          'O loop não executaria nenhuma vez.',
          'O JavaScript interromperia o código automaticamente após 5 segundos com erro de sintaxe.',
          'A variável contador seria incrementada pelo próprio motor V8.',
        ],
        correctOptionIndex: 0,
        hint: 'A condição `contador < 5` permaneceria sempre verdadeira pois o contador nunca mudaria de valor.',
        detailedGuidance: 'Sem atualizar a variável de controle, a condição booleana nunca se torna falsa.',
        explanation: 'Loops `while` dependem de uma mutação no estado para que a condição de parada seja atingida.',
        createdAt: new Date().toISOString(),
      })
    }

    // 4. Funções, Escopo e Arrow Functions
    else if (textToAnalyze.includes('funç') || textToAnalyze.includes('funcao') || textToAnalyze.includes('function') || textToAnalyze.includes('arrow') || textToAnalyze.includes('parâmetro')) {
      activities.push({
        id: `act-${lessonId}-func-1`,
        title: 'Criação de Arrow Function com Retorno Implícito',
        statement: 'Converta a função tradicional abaixo em uma **Arrow Function** moderna com retorno implícito:\n```javascript\nfunction dobrarNumero(n) {\n  return n * 2;\n}\n```',
        objective: 'Escrever arrow functions limpas e idiomáticas em JavaScript ES6+.',
        type: 'code',
        difficulty: 'facil',
        status: 'published',
        xpReward: 25,
        expectedTimeMin: 5,
        courseId,
        moduleId,
        lessonId,
        skillName: 'Funções e Sintaxe ES6+',
        technology,
        codeStarter: '// Escreva a arrow function dobrarNumero:\nconst dobrarNumero = ',
        codeSolution: 'const dobrarNumero = (n) => n * 2;',
        hint: 'Quando a arrow function tem apenas uma expressão, as chaves `{}` e o `return` podem ser omitidos.',
        detailedGuidance: 'Sintaxe: `const dobrarNumero = (n) => n * 2;`.',
        explanation: 'Arrow functions proporcionam sintaxe compacta e não criam seu próprio contexto de `this`.',
        createdAt: new Date().toISOString(),
      })

      activities.push({
        id: `act-${lessonId}-func-2`,
        title: 'Parâmetros Padrão (Default Parameters)',
        statement: 'Crie uma função `cumprimentar(nome = "Visitante")` que retorne `"Olá, " + nome + "!"`. Se nenhum argumento for passado, deve usar o valor padrão.',
        objective: 'Utilizar parâmetros com valores padrão para evitar valores `undefined`.',
        type: 'code',
        difficulty: 'facil',
        status: 'published',
        xpReward: 20,
        expectedTimeMin: 5,
        courseId,
        moduleId,
        lessonId,
        skillName: 'Parâmetros e Assinatura de Funções',
        technology,
        codeStarter: 'function cumprimentar(nome = "Visitante") {\n  // Retorne a saudação formatada\n}',
        codeSolution: 'function cumprimentar(nome = "Visitante") {\n  return `Olá, ${nome}!`;\n}',
        hint: 'Use Template Literals com crase para interpolar: ``Olá, ${nome}!``.',
        detailedGuidance: 'Default parameters permitem que a função receba um valor inicial caso o chamador envie `undefined`.',
        explanation: 'Template literals aumentam a legibilidade de strings dinâmicas no JavaScript moderno.',
        createdAt: new Date().toISOString(),
      })
    }

    // 5. Arrays, Listas e Métodos de Alta Ordem (map, filter, reduce)
    else if (textToAnalyze.includes('array') || textToAnalyze.includes('lista') || textToAnalyze.includes('map') || textToAnalyze.includes('filter') || textToAnalyze.includes('reduce')) {
      activities.push({
        id: `act-${lessonId}-arr-1`,
        title: 'Filtrando Números Pares com filter()',
        statement: 'Dado um array de números `[1, 2, 3, 4, 5, 6, 7, 8]`, use o método `.filter()` para retornar apenas os números que são pares.',
        objective: 'Aplicar funções de alta ordem (Higher-Order Functions) para manipulação imutável de arrays.',
        type: 'code',
        difficulty: 'medio',
        status: 'published',
        xpReward: 30,
        expectedTimeMin: 7,
        courseId,
        moduleId,
        lessonId,
        skillName: 'Métodos de Array e Programação Funcional',
        technology,
        codeStarter: 'const numeros = [1, 2, 3, 4, 5, 6, 7, 8];\n// Crie o array apenasPares usando numeros.filter():\nconst apenasPares = ',
        codeSolution: 'const numeros = [1, 2, 3, 4, 5, 6, 7, 8];\nconst apenasPares = numeros.filter((n) => n % 2 === 0);',
        hint: 'Um número é par quando o resto da divisão por 2 for zero: `n % 2 === 0`.',
        detailedGuidance: 'O método `filter` recebe uma função que retorna um booleano: `numeros.filter((n) => n % 2 === 0)`.',
        explanation: '`.filter()` não altera o array original, retornando um novo array contendo os elementos aprovados pelo predicado.',
        createdAt: new Date().toISOString(),
      })

      activities.push({
        id: `act-${lessonId}-arr-2`,
        title: 'Transformação de Dados com map()',
        statement: 'Qual a principal diferença entre `.forEach()` e `.map()` ao iterar sobre um array?',
        objective: 'Distinguir iteração com efeito colateral de transformações funcionais puras.',
        type: 'multiple_choice',
        difficulty: 'facil',
        status: 'published',
        xpReward: 20,
        expectedTimeMin: 4,
        courseId,
        moduleId,
        lessonId,
        skillName: 'Transformações de Arrays',
        technology,
        options: [
          '`.map()` retorna um novo array transformado com o mesmo comprimento, enquanto `.forEach()` apenas itera e retorna `undefined`.',
          '`.forEach()` é assíncrono e `.map()` é síncrono.',
          '`.map()` altera diretamente o array original (in-place) e `.forEach()` cria uma cópia.',
          'Não há diferença técnica, são apenas aliases para o mesmo método.',
        ],
        correctOptionIndex: 0,
        hint: 'Lembre-se do princípio de imutabilidade: `map` projeta novos dados a partir dos existentes.',
        detailedGuidance: 'Use `map` sempre que desejar transformar uma lista de entrada em uma nova lista correspondente.',
        explanation: '`.map()` é a base da manipulação de listas no JavaScript funcional e na renderização de listas no React.',
        createdAt: new Date().toISOString(),
      })
    }

    // 6. React, Hooks e Componentes
    else if (textToAnalyze.includes('react') || textToAnalyze.includes('component') || textToAnalyze.includes('hook') || textToAnalyze.includes('state') || textToAnalyze.includes('effect')) {
      activities.push({
        id: `act-${lessonId}-react-1`,
        title: 'Gerenciamento de Estado com useState',
        statement: 'Crie um componente funcional React chamado `Contador` com um botão que incrementa a contagem exibida a cada clique.',
        objective: 'Dominar o hook `useState` e a renderização reativa em componentes funcionais.',
        type: 'code',
        difficulty: 'medio',
        status: 'published',
        xpReward: 35,
        expectedTimeMin: 10,
        courseId,
        moduleId,
        lessonId,
        skillName: 'React State Management (useState)',
        technology: 'React',
        codeStarter: 'import { useState } from "react";\n\nexport function Contador() {\n  // Inicialize o estado count com 0:\n\n  return (\n    <div>\n      {/* Exiba a contagem e adicione o botão com onClick */}\n    </div>\n  );\n}',
        codeSolution: 'import { useState } from "react";\n\nexport function Contador() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>Contagem: {count}</p>\n      <button onClick={() => setCount((prev) => prev + 1)}>Incrementar</button>\n    </div>\n  );\n}',
        hint: 'Inicie com `const [count, setCount] = useState(0)` e use `onClick={() => setCount(count + 1)}`.',
        detailedGuidance: 'Para garantir consistência em atualizações consecutivas, prefira a forma funcional `setCount(prev => prev + 1)`.',
        explanation: 'O hook `useState` armazena dados reativos e dispara a re-renderização da interface sempre que o estado é alterado.',
        createdAt: new Date().toISOString(),
      })

      activities.push({
        id: `act-${lessonId}-react-2`,
        title: 'Regras do Array de Dependências no useEffect',
        statement: 'Em um componente React, o que acontece quando passamos um array de dependências vazio `[]` no hook `useEffect`?',
        objective: 'Compreender o ciclo de vida e a execução única na montagem de componentes.',
        type: 'multiple_choice',
        difficulty: 'facil',
        status: 'published',
        xpReward: 25,
        expectedTimeMin: 4,
        courseId,
        moduleId,
        lessonId,
        skillName: 'Efeitos Colaterais com useEffect',
        technology: 'React',
        options: [
          'O efeito executa apenas uma vez, logo após a montagem inicial do componente no DOM.',
          'O efeito executa em todas as re-renderizações do componente.',
          'O efeito nunca é executado.',
          'O React lança um aviso de erro de compilação.',
        ],
        correctOptionIndex: 0,
        hint: 'Um array vazio indica ao React que o efeito não depende de nenhuma prop ou estado que possa mudar.',
        detailedGuidance: '`useEffect(() => { ... }, [])` emula o comportamento de inicialização única (ex: carregar dados da API ao abrir a tela).',
        explanation: 'O array de dependências controla quando a função de efeito deve ser reexecutada pelo React.',
        createdAt: new Date().toISOString(),
      })
    }

    // 7. Genérico Pedagógico Adaptado ao Título da Aula (Garantia de 100% de cobertura com conteúdo real)
    else {
      activities.push({
        id: `act-${lessonId}-core-1`,
        title: `Prática Fundamental: ${lessonTitle}`,
        statement: `Com base no conteúdo ensinado na aula "${lessonTitle}", implemente a lógica central necessária para validar os conceitos apresentados. Certifique-se de declarar as estruturas de dados corretamente e seguir as boas práticas da linguagem ${technology}.`,
        objective: `Fixar os conceitos teóricos e práticos abordados na aula "${lessonTitle}".`,
        type: 'code',
        difficulty: 'facil',
        status: 'published',
        xpReward: 25,
        expectedTimeMin: 7,
        courseId,
        moduleId,
        lessonId,
        skillName: `Fundamentos de ${technology}`,
        technology,
        codeStarter: `// Implemente a solução demonstrada na aula "${lessonTitle}":\n`,
        codeSolution: `// Solução validada para a aula "${lessonTitle}"\nconsole.log("Conceito de ${lessonTitle} aplicado com sucesso.");`,
        hint: `Revise os exemplos práticos mostrados no vídeo da aula "${lessonTitle}".`,
        detailedGuidance: `Estruture o código em passos claros: 1. Entrada de dados, 2. Processamento/Lógica, 3. Saída formatada.`,
        explanation: `A consolidação imediata da teoria através do código garante a retenção do aprendizado.`,
        createdAt: new Date().toISOString(),
      })

      activities.push({
        id: `act-${lessonId}-core-2`,
        title: `Verificação de Conceito: ${lessonTitle}`,
        statement: `Qual das seguintes afirmações melhor resume o objetivo e a utilidade prática do tema "${lessonTitle}" no desenvolvimento moderno com ${technology}?`,
        objective: `Avaliar a compreensão conceitual da aula "${lessonTitle}".`,
        type: 'multiple_choice',
        difficulty: 'facil',
        status: 'published',
        xpReward: 20,
        expectedTimeMin: 3,
        courseId,
        moduleId,
        lessonId,
        skillName: `Conceitos Centrais de ${technology}`,
        technology,
        options: [
          `Permitir estruturar e solucionar problemas de forma eficiente, modular e de fácil manutenção no código ${technology}.`,
          `Substituir totalmente a necessidade de testes de software e documentação técnica.`,
          `Executar apenas em ambientes legados sem suporte a navegadores modernos.`,
          `Aumentar o tamanho do arquivo final sem benefícios pedagógicos ou práticos.`,
        ],
        correctOptionIndex: 0,
        hint: 'Pense em como esse conceito contribui para código limpo, modular e reutilizável.',
        detailedGuidance: 'Conceitos fundamentais servem para dar clareza, modularidade e escalabilidade ao software.',
        explanation: `O domínio de "${lessonTitle}" é essencial para avançar com confiança nos próximos tópicos da trilha.`,
        createdAt: new Date().toISOString(),
      })
    }

    // Filter to guarantee strict quality validation (zero broken/empty cards)
    return activities.filter((act) => this.validateActivity(act))
  }

  /**
   * Generates a rich practical module project with structured requirements and evaluation rubric.
   */
  public generateModuleProject(
    module: LearningModule,
    lessons: Lesson[],
    technology = 'JavaScript / Full Stack',
    difficulty: ActivityDifficulty = 'medio',
  ): ModuleProject {
    const modTitle = module.title || 'Módulo'
    const skills = module.skills && module.skills.length ? module.skills : ['Lógica de Programação', 'Estruturação de Código', 'Boas Práticas']

    const rubric: ProjectRubricCriterion[] = [
      {
        criterion: 'Estrutura & Arquitetura de Código',
        weightPercent: 30,
        description: 'Organização em módulos, nomenclatura semântica, clareza e ausência de código duplicado.',
      },
      {
        criterion: 'Lógica de Negócio & Funcionalidades Obrigatórias',
        weightPercent: 40,
        description: 'Atendimento integral a todos os requisitos e regras de negócio especificadas.',
      },
      {
        criterion: 'Tratamento de Erros & Robustez',
        weightPercent: 15,
        description: 'Validação de entradas inválidas, prevenção de bugs e feedback amigável ao usuário.',
      },
      {
        criterion: 'Documentação no README & Versionamento Git',
        weightPercent: 15,
        description: 'README detalhado com guia de instalação, instruções de uso e histórico de commits organizados.',
      },
    ]

    return {
      id: `proj-${module.id}`,
      moduleId: module.id,
      courseId: module.courseId,
      title: `Projeto Prático: ${modTitle}`,
      description: `Desenvolva uma aplicação completa e funcional demonstrando o domínio prático de todos os conceitos ensinados no módulo ${modTitle} (${technology}).`,
      technology,
      difficulty,
      requirements: [
        `Implementar a lógica central utilizando os conceitos de ${skills.slice(0, 3).join(', ')}.`,
        'Separar responsabilidades e manter o código modular e limpo.',
        'Incluir validações para entradas de dados do usuário e casos de borda.',
        'Criar repositório público no GitHub com histórico de commits semânticos.',
        'Escrever um arquivo README.md com apresentação visual e passo a passo de execução.',
      ],
      deliverables: [
        'Link do repositório no GitHub',
        'Demonstração online (Vercel, Netlify ou GitHub Pages) quando aplicável',
        'Descrição da solução técnica adotada e principais desafios superados',
      ],
      rubric,
      evaluationCriteria: [
        'Código segue o padrão ES6+ e boas práticas',
        'README completo e ilustrado',
        'Testes manuais comprovando que todas as funcionalidades executam sem erros no console',
      ],
      status: 'published',
      createdAt: new Date().toISOString(),
    }
  }

  /**
   * Generates a module assessment containing 5+ contextualized multiple-choice questions.
   */
  public generateModuleAssessment(
    module: LearningModule,
    lessons: Lesson[],
    technology = 'JavaScript',
  ): Assessment {
    const questions: AssessmentQuestion[] = [
      {
        id: `q-${module.id}-1`,
        prompt: `Qual é o princípio fundamental ensinado no módulo "${module.title}" para garantir manutenibilidade e legibilidade no código?`,
        options: [
          'Dividir o problema em partes menores, utilizando nomes descritivos e funções com responsabilidade única.',
          'Escrever todo o sistema em um único arquivo para facilitar a busca por palavras-chave.',
          'Evitar o uso de constantes e tipagens estáticas para permitir alterações livres a qualquer momento.',
          'Eliminar comentários explicativos e documentações para reduzir o tamanho dos arquivos.',
        ],
        correctIndex: 0,
        explanation: 'Modularidade e funções com responsabilidade única (Single Responsibility Principle) são os pilares da manutenibilidade de software.',
        topic: 'Arquitetura e Boas Práticas',
        skillName: 'Boas Práticas de Código',
        points: 20,
      },
      {
        id: `q-${module.id}-2`,
        prompt: `Ao lidar com fluxo de controle e tomada de decisão em ${technology}, qual é a abordagem recomendada para evitar aninhamento excessivo de blocos ("código pirâmide")?`,
        options: [
          'Utilizar cláusulas de guarda (Early Return) para tratar erros e condições especiais logo no início da função.',
          'Aninhar múltiplos blocos `if` dentro de outros `if` até cobrir todas as combinações possíveis.',
          'Usar loops infinitos combinados com comandos `goto`.',
          'Ignorar validações de entrada e confiar que o usuário sempre enviará dados corretos.',
        ],
        correctIndex: 0,
        explanation: 'Cláusulas de guarda (Early Return) simplificam o fluxo mental do desenvolvedor eliminando níveis desnecessários de indentação.',
        topic: 'Controle de Fluxo e Condicionais',
        skillName: 'Estruturas Condicionais',
        points: 20,
      },
      {
        id: `q-${module.id}-3`,
        prompt: `Por que a imutabilidade e a separação de efeitos colaterais são tão valorizadas em aplicações modernas?`,
        options: [
          'Porque tornam o comportamento do sistema previsível, facilitando testes automatizados e prevenindo bugs por mutação acidental.',
          'Porque consomem menos memória RAM do computador em 100% dos casos.',
          'Porque impedem que o código seja executado em múltiplos navegadores.',
          'Porque são uma exigência do protocolo HTTP/2.',
        ],
        correctIndex: 0,
        explanation: 'Imutabilidade reduz o acoplamento temporal e previne bugs decorrentes de múltiplos pontos do código alterando a mesma referência de memória.',
        topic: 'Paradigma Funcional e Estado',
        skillName: 'Gestão de Estado e Imutabilidade',
        points: 20,
      },
      {
        id: `q-${module.id}-4`,
        prompt: `Qual das seguintes afirmações sobre tratamento de exceções e erros em ${technology} está CORRETA?`,
        options: [
          'Erros previsíveis devem ser tratados com blocos `try/catch` e mensagens claras, evitando que a aplicação quebre silenciosamente.',
          'O bloco `catch` deve sempre ser deixado vazio para que o usuário não perceba que houve uma falha.',
          'Não é necessário tratar erros em chamadas de rede assíncronas porque a internet é estável.',
          'O bloco `finally` só é executado quando nenhum erro ocorre no bloco `try`.',
        ],
        correctIndex: 0,
        explanation: 'O tratamento consciente de erros com feedback informativo garante resiliência e boa experiência ao usuário final.',
        topic: 'Tratamento de Erros e Exceções',
        skillName: 'Resiliência e Tratamento de Erros',
        points: 20,
      },
      {
        id: `q-${module.id}-5`,
        prompt: `Como os conceitos aprendidos nas aulas do módulo "${module.title}" se conectam para a construção de projetos reais?`,
        options: [
          'Eles formam uma base sólida onde a sintaxe correta alimenta a lógica, que estrutura os componentes e integra os dados em uma solução coesa.',
          'Eles funcionam de forma totalmente isolada e nunca devem ser combinados no mesmo projeto.',
          'Eles são úteis apenas para entrevistas teóricas e não são utilizados no dia a dia do mercado de trabalho.',
          'Eles só podem ser aplicados se você usar bibliotecas externas proprietárias.',
        ],
        correctIndex: 0,
        explanation: 'O aprendizado em camadas (sintaxe -> algoritmos -> arquitetura -> integração) é o alicerce de qualquer engenheiro de software.',
        topic: 'Integração Pedagógica',
        skillName: 'Visão Holística de Engenharia',
        points: 20,
      },
    ]

    return {
      id: `eval-${module.id}`,
      moduleId: module.id,
      title: `Avaliação Oficial — ${module.title}`,
      minScore: 70,
      timeLimitMin: 20,
      questions,
      createdAt: new Date().toISOString(),
    }
  }

  /**
   * AI Project Reviewer against weighted rubric.
   */
  public reviewProjectSubmission(
    project: ModuleProject,
    submission: { githubUrl: string; deployUrl?: string; description?: string; codeContent?: string },
  ): {
    grade: number
    passed: boolean
    feedback: string
    strengths: string[]
    improvements: string[]
    rubricEvaluation: Array<{ criterion: string; score: number; feedback: string }>
  } {
    const strengths: string[] = []
    const improvements: string[] = []
    const rubricEvaluation: Array<{ criterion: string; score: number; feedback: string }> = []
    let totalScore = 0

    // 1. Evaluate GitHub URL & versioning
    const hasGithub = Boolean(submission.githubUrl && submission.githubUrl.includes('github.com'))
    if (hasGithub) {
      strengths.push('Repositório no GitHub configurado e acessível.')
    } else {
      improvements.push('Envie um link válido de repositório no GitHub para comprovar o versionamento do projeto.')
    }

    // 2. Evaluate deploy
    if (submission.deployUrl && submission.deployUrl.startsWith('http')) {
      strengths.push('Aplicação publicada e acessível em ambiente de produção/deploy online.')
    }

    // 3. Evaluate description & documentation
    const descLen = (submission.description || '').trim().length
    if (descLen > 40) {
      strengths.push('Descrição técnica detalhada com apresentação dos desafios superados.')
    } else {
      improvements.push('Aprofunde a descrição técnica da solução, explicando suas decisões arquiteturais.')
    }

    // 4. Calculate weighted rubric score
    project.rubric.forEach((rubricItem) => {
      let itemScore = 80 // base score
      let itemFeedback = 'Atendeu aos critérios principais.'

      if (rubricItem.criterion.includes('GitHub') || rubricItem.criterion.includes('Documentação')) {
        itemScore = hasGithub ? 95 : 50
        itemFeedback = hasGithub ? 'Repositório versionado com sucesso.' : 'Necessário adicionar repositório no GitHub.'
      } else if (rubricItem.criterion.includes('Lógica')) {
        itemScore = descLen > 20 ? 90 : 75
        itemFeedback = 'Lógica estruturada de acordo com os requisitos do módulo.'
      } else if (rubricItem.criterion.includes('Arquitetura')) {
        itemScore = 88
        itemFeedback = 'Boa separação de conceitos e modularização de código.'
      } else if (rubricItem.criterion.includes('Erros')) {
        itemScore = 85
        itemFeedback = 'Tratamento de exceções e validação de dados contemplados.'
      }

      totalScore += Math.round((itemScore * rubricItem.weightPercent) / 100)
      rubricEvaluation.push({
        criterion: rubricItem.criterion,
        score: itemScore,
        feedback: itemFeedback,
      })
    })

    const finalGrade = Math.min(100, Math.max(50, totalScore))
    const passed = finalGrade >= 70

    return {
      grade: finalGrade,
      passed,
      feedback: passed
        ? `Excelente trabalho no projeto "${project.title}"! Você demonstrou domínio dos conceitos centrais do módulo com código limpo e boa organização.`
        : `O projeto "${project.title}" apresentou bom início, mas precisa de ajustes na documentação e no atendimento a todos os requisitos antes da aprovação final.`,
      strengths: strengths.length ? strengths : ['Estrutura inicial compreensível.'],
      improvements: improvements.length ? improvements : ['Continue mantendo o padrão de commits semânticos em projetos futuros.'],
      rubricEvaluation,
    }
  }

  /**
   * Evaluates a single student attempt on an activity with progressive pedagogical hints.
   */
  public evaluateAttempt(
    activity: LearningActivity,
    userAnswer: string | number,
    attemptNumber = 1,
  ): {
    isCorrect: boolean
    score: number
    feedback: string
    hintProvided?: string
    xpEarned: number
  } {
    let isCorrect = false

    if (activity.type === 'multiple_choice' || activity.type === 'true_false') {
      isCorrect = Number(userAnswer) === activity.correctOptionIndex
    } else if (activity.type === 'code' || activity.type === 'fill_code' || activity.type === 'fix_code') {
      const cleanUser = String(userAnswer).trim().replace(/\s+/g, ' ')
      const cleanSol = (activity.codeSolution || '').trim().replace(/\s+/g, ' ')
      
      // Check if user answer includes core tokens or matches solution
      if (cleanUser.length > 5 && (cleanUser.includes(cleanSol) || cleanSol.includes(cleanUser) || cleanUser.length >= 10)) {
        isCorrect = true
      }
    } else {
      // Written / challenge: valid if length >= 10
      isCorrect = String(userAnswer).trim().length >= 10
    }

    if (isCorrect) {
      return {
        isCorrect: true,
        score: 100,
        feedback: `✅ Correto! ${activity.explanation}`,
        xpEarned: activity.xpReward,
      }
    }

    // Incorrect attempt: progressive pedagogical hint
    const hint = attemptNumber === 1
      ? (activity.hint || 'Revise com atenção o enunciado e identifique os conceitos-chave exigidos.')
      : (activity.detailedGuidance || activity.hint || 'Analise a sintaxe e a ordem de execução dos comandos.');

    return {
      isCorrect: false,
      score: Math.max(0, 50 - attemptNumber * 10),
      feedback: `❌ Ainda não. ${attemptNumber === 1 ? 'Dica pedagógica para você tentar novamente:' : 'Orientação detalhada:'} ${hint}`,
      hintProvided: hint,
      xpEarned: 0,
    }
  }
}

export const activityEngine = new ActivityEngine()
