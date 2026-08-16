# DevPath AI — Plataforma Inteligente de Aprendizagem Adaptativa para Desenvolvedores

Plataforma completa de aprendizagem de programação e formação de desenvolvedores, orientada por inteligência artificial, nivelamento diagnóstico e sincronização dinâmica com cursos e playlists reais do YouTube.

---

## 🚀 Tecnologias e Arquitetura

* **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19, Server & Client Components)
* **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
* **Estilização & UI**: [Tailwind CSS](https://tailwindcss.com/), Radix UI Primitives, Lucide Icons, Glassmorphism
* **Backend & Banco de Dados**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Auth, RPC Functions)
* **Inteligência Artificial**: DevMentor AI Engine (Google Gemini / OpenAI / Anthropic / DeepSeek)
* **Mídias & Catálogo**: YouTube Data API v3 & Ingestão com Fallback Resiliente

---

## ✨ Funcionalidades Principais

1. **Nivelamento Diagnóstico & Trilha Adaptativa**:
   * Avaliação de habilidades iniciais com cálculo de pontuação, pontos fortes e lacunas.
   * Geração automatizada de árvore pedagógica individualizada (Lógica de Programação $\rightarrow$ Git $\rightarrow$ Web $\rightarrow$ JavaScript $\rightarrow$ Frameworks $\rightarrow$ Backend $\rightarrow$ Banco de Dados $\rightarrow$ Projetos $\rightarrow$ Carreira).
   * Bloqueio sequencial estrito com liberação progressiva por aproveitamento ($\ge 50\%$).

2. **Player de Vídeo Resiliente com YouTube**:
   * Carregamento de embeds via API IFrame com fallbacks inteligentes em caso de restrições de reprodução.
   * Rastreamento de progresso por aula, anotações de estudo e marcação de conclusão com ganho de XP.

3. **Code Lab & Exercícios Práticos**:
   * Ambiente interativo de codificação no navegador com editor e console de execução.
   * Avaliação de código com feedback assistido por IA.

4. **Simulador de Entrevistas Técnicas**:
   * Chat interativo com o Mentor IA simulando processos seletivos reais com relatório de desempenho e recomendações.

5. **Painel Administrativo (CMS Educacional)**:
   * Ingestão de canais e playlists do YouTube com descoberta automática de módulos e aulas.
   * Validação de links, sincronização e gestão completa do catálogo.

---

## 🛠️ Como Executar o Projeto

### 1. Pré-requisitos
* Node.js 18+ instalado
* Gerenciador de pacotes (`npm`, `pnpm` ou `yarn`)

### 2. Instalação das Dependências
```bash
npm install
```

### 3. Configuração de Variáveis de Ambiente
Copie o arquivo de exemplo e configure suas credenciais:
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui

AI_PROVIDER=gemini
AI_API_KEY=sua_chave_api_gemini
AI_MODEL=gemini-1.5-pro

YOUTUBE_API_KEY=sua_chave_youtube_aqui (opcional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Executar em Desenvolvimento
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

### 5. Build de Produção
```bash
npm run build
npm run start
```

---

## 📁 Estrutura do Projeto

```
├── app/                  # Rotas e páginas do Next.js App Router
│   ├── admin/            # Painel administrativo e sincronização YouTube
│   ├── api/              # Endpoints de API (IA, YouTube, Nivelamento)
│   ├── aulas/            # Player de aulas e reprodutor de vídeo
│   ├── avaliacoes/       # Avaliações de módulo e cálculo de Mastery
│   ├── carreira/         # Simulador de entrevistas técnicas
│   ├── code-lab/         # Ambiente interativo de código
│   ├── cursos/           # Catálogo de cursos
│   ├── dashboard/        # Dashboard principal do aluno
│   ├── nivelamento/      # Teste diagnóstico inicial
│   └── trilha/           # Árvore sequencial da trilha adaptativa
├── components/           # Componentes visuais reutilizáveis e layout
├── lib/                  # Camada de regras de negócio, IA e Store
│   ├── ai/               # Motor de síntese de trilha e provedores
│   ├── store.tsx         # Estado global reativo e sincronização Supabase
│   └── youtube/          # Serviço de ingestão e parsing de metadados
└── supabase/             # Schemas SQL, migrações e triggers do PostgreSQL
```

---

## 📄 Licença

Este projeto é desenvolvido para fins educacionais e profissionais. Todos os direitos reservados.
