-- ============================================================
-- DEVPATH AI — Database Seed Data
-- ============================================================

-- 1. Insert Initial Learning Path
insert into public.learning_paths (id, title, slug, goal, area, description) values
('path-fsjs', 'Full Stack JavaScript', 'full-stack-javascript', 'Tornar-se desenvolvedor Full Stack', 'fullstack', 'Trilha completa que leva do zero absoluto até a construção e deploy de aplicações completas com JavaScript, React, Node.js e banco de dados.')
on conflict (id) do nothing;

-- 2. Insert Modules
insert into public.modules (id, order_index, phase, phase_order, title, slug, description, objective, icon, has_project, has_assessment, estimated_hours, skills) values
('mod-logica', 1, 'Fundamentos da Programação', 1, 'Lógica de Programação', 'logica-de-programacao', 'Os alicerces do raciocínio computacional.', 'Aprender os fundamentos necessários para começar a programar.', 'brain', true, true, 6, array['Lógica', 'Algoritmos', 'Variáveis', 'Condições', 'Loops']),
('mod-algoritmos', 2, 'Fundamentos da Programação', 1, 'Algoritmos e Estruturas', 'algoritmos-e-estruturas', 'Pensar em passos e resolver problemas.', 'Estruturar soluções em algoritmos claros e eficientes.', 'workflow', true, true, 8, array['Algoritmos', 'Complexidade', 'Estruturas de dados']),
('mod-git', 3, 'Fundamentos da Programação', 1, 'Git & GitHub', 'git-e-github', 'Versionamento de código profissional.', 'Controlar versões e colaborar com outros desenvolvedores.', 'git-branch', false, true, 4, array['Git', 'GitHub', 'Commits', 'Branches']),
('mod-html', 4, 'Web', 2, 'HTML', 'html-semantico', 'A estrutura de toda página web.', 'Construir páginas semânticas e acessíveis.', 'code', true, true, 5, array['HTML', 'Semântica', 'Acessibilidade']),
('mod-css', 5, 'Web', 2, 'CSS', 'css-layouts', 'Estilização e layouts responsivos.', 'Estilizar interfaces modernas e responsivas.', 'palette', true, true, 8, array['CSS', 'Flexbox', 'Grid', 'Responsividade']),
('mod-js', 6, 'Web', 2, 'JavaScript — Fundamentos', 'javascript-fundamentos', 'A linguagem que dá vida à web.', 'Dominar a sintaxe e os conceitos centrais de JavaScript.', 'braces', true, true, 12, array['JavaScript', 'DOM', 'Funções', 'Arrays', 'Objetos']),
('mod-react', 7, 'Front-end', 3, 'React & TypeScript', 'react-e-typescript', 'Interfaces modernas com componentes.', 'Construir SPAs componentizadas e tipadas.', 'atom', true, true, 16, array['React', 'TypeScript', 'Hooks', 'Componentes']),
('mod-node', 8, 'Back-end', 4, 'Node.js & APIs', 'node-e-apis', 'JavaScript no servidor.', 'Criar APIs REST robustas com Node.js.', 'server', true, true, 14, array['Node.js', 'Express', 'REST', 'Autenticação']),
('mod-db', 9, 'Back-end', 4, 'Banco de Dados', 'banco-de-dados-sql', 'Modelagem e persistência de dados.', 'Modelar e consultar bancos relacionais.', 'database', true, true, 10, array['SQL', 'PostgreSQL', 'Modelagem', 'CRUD']),
('mod-fullstack', 10, 'Full Stack', 5, 'Projeto Full Stack & Deploy', 'full-stack-deploy', 'Juntando tudo em um produto real.', 'Construir e publicar uma aplicação completa.', 'layers', true, true, 20, array['Full Stack', 'Deploy', 'CI/CD', 'Cloud']),
('mod-carreira', 11, 'Carreira', 6, 'Preparação Profissional', 'preparacao-profissional', 'Do portfólio à entrevista técnica.', 'Estar pronto para o mercado de trabalho.', 'briefcase', false, true, 8, array['Portfólio', 'Currículo', 'LinkedIn', 'Entrevistas'])
on conflict (id) do nothing;

-- 3. Path Modules linking
insert into public.learning_path_modules (path_id, module_id, order_index) values
('path-fsjs', 'mod-logica', 1),
('path-fsjs', 'mod-algoritmos', 2),
('path-fsjs', 'mod-git', 3),
('path-fsjs', 'mod-html', 4),
('path-fsjs', 'mod-css', 5),
('path-fsjs', 'mod-js', 6),
('path-fsjs', 'mod-react', 7),
('path-fsjs', 'mod-node', 8),
('path-fsjs', 'mod-db', 9),
('path-fsjs', 'mod-fullstack', 10),
('path-fsjs', 'mod-carreira', 11)
on conflict do nothing;

-- 4. Prerequisites
insert into public.module_prerequisites (module_id, prerequisite_module_id) values
('mod-algoritmos', 'mod-logica'),
('mod-git', 'mod-algoritmos'),
('mod-html', 'mod-git'),
('mod-css', 'mod-html'),
('mod-js', 'mod-css'),
('mod-react', 'mod-js'),
('mod-node', 'mod-react'),
('mod-db', 'mod-node'),
('mod-fullstack', 'mod-db'),
('mod-carreira', 'mod-fullstack')
on conflict do nothing;

-- 5. Insert Lessons
insert into public.lessons (id, module_id, order_index, title, slug, type, duration_min, description, video_id, content_markdown) values
('l-logica-1', 'mod-logica', 1, 'O que é programação e raciocínio lógico', 'o-que-e-programacao', 'video', 12, 'Entenda o que significa programar e como o computador executa instruções passo a passo.', 'S9uPNppGsGo', '# O que é programação\n\nProgramação é o ato de dar instruções claras e precisas a um computador para resolver problemas reais.'),
('l-logica-2', 'mod-logica', 2, 'Algoritmos e variáveis na prática', 'algoritmos-e-variaveis', 'video', 18, 'Como armazenar e manipular informações usando variáveis e tipos fundamentais.', 'S9uPNppGsGo', '# Variáveis\n\nUma variável é um espaço alocado na memória para guardar dados temporários durante a execução do programa.'),
('l-logica-3', 'mod-logica', 3, 'Tipos de dados e operadores lógicos', 'tipos-de-dados-e-operadores', 'reading', 10, 'Números, textos, booleanos e como combiná-los com operadores relacionais e lógicos.', null, '# Tipos de Dados\n\n- **String**: textos entre aspas\n- **Number**: números inteiros e decimais\n- **Boolean**: verdadeiro (`true`) ou falso (`false`)'),
('l-logica-4', 'mod-logica', 4, 'Condições e tomada de decisão (if / else)', 'condicoes-if-else', 'video', 15, 'Tomando decisões no código através de estruturas condicionais.', 'S9uPNppGsGo', '# Estruturas Condicionais\n\nCom `if`, `else if` e `else`, seu código pode seguir caminhos diferentes de acordo com condições lógicas.'),
('l-logica-5', 'mod-logica', 5, 'Loops e funções reutilizáveis', 'loops-e-funcoes', 'video', 22, 'Repetindo tarefas sem duplicar código e organizando a lógica em blocos reutilizáveis.', 'S9uPNppGsGo', '# Loops e Funções\n\nLoops (`for`, `while`) repetem execuções; funções isolam e reutilizam blocos de código com entradas e saídas.'),
('l-algo-1', 'mod-algoritmos', 1, 'Pensamento algorítmico e decomposição', 'pensamento-algoritmico', 'video', 20, 'Como quebrar problemas complexos em etapas resolvíveis.', 'S9uPNppGsGo', '# Pensamento Algorítmico\n\nAprenda a decompor grandes desafios em passos simples.'),
('l-algo-2', 'mod-algoritmos', 2, 'Estruturas de dados fundamentais', 'estruturas-de-dados', 'reading', 15, 'Arrays, listas, pilhas e filas no dia a dia do desenvolvimento.', null, '# Estruturas de Dados\n\nOrganize coleções de informações de maneira rápida e eficiente.'),
('l-algo-3', 'mod-algoritmos', 3, 'Complexidade e eficiência (Big-O)', 'complexidade-big-o', 'video', 18, 'Medindo a performance e escalabilidade de algoritmos.', 'S9uPNppGsGo', '# Big-O\n\nEntenda o custo de tempo e espaço das operações.'),
('l-git-1', 'mod-git', 1, 'Introdução ao Git e versionamento', 'introducao-git', 'video', 14, 'Controle de histórico e comandos essenciais.', 'S9uPNppGsGo', '# Git Essencial\n\n`git init`, `git add`, `git commit` e `git status`.'),
('l-git-2', 'mod-git', 2, 'GitHub e trabalho em equipe', 'github-e-colaboracao', 'video', 16, 'Branches, pull requests e colaboração remota.', 'S9uPNppGsGo', '# GitHub\n\nComo hospedar repositórios remotos e abrir pull requests profissionais.'),
('l-html-1', 'mod-html', 1, 'Estrutura HTML e Semântica', 'estrutura-html', 'video', 20, 'Tags semânticas para acessibilidade e SEO.', 'S9uPNppGsGo', '# HTML5 Semântico\n\nUse `<header>`, `<nav>`, `<main>`, `<article>` e `<footer>`.'),
('l-html-2', 'mod-html', 2, 'Formulários modernos e validações', 'formularios-acessibilidade', 'reading', 12, 'Inputs acessíveis e experiência do usuário.', null, '# Formulários\n\nCrie formulários fáceis de preencher e acessíveis para leitores de tela.'),
('l-css-1', 'mod-css', 1, 'Seletores, Cascata e Box Model', 'seletores-box-model', 'video', 22, 'Fundamentos de estilização visual.', 'S9uPNppGsGo', '# Box Model\n\nCompreenda `content`, `padding`, `border` e `margin`.'),
('l-css-2', 'mod-css', 2, 'Flexbox e CSS Grid modernos', 'flexbox-grid', 'video', 25, 'Construindo layouts responsivos com facilidade.', 'S9uPNppGsGo', '# Flexbox & Grid\n\nOs dois pilares do layout web contemporâneo.'),
('l-css-3', 'mod-css', 3, 'Media Queries e Mobile-First', 'responsividade-mobile-first', 'reading', 14, 'Adaptando layouts para todos os tamanhos de tela.', null, '# Mobile First\n\nDesenvolva pensando no celular antes do desktop.'),
('l-js-1', 'mod-js', 1, 'Sintaxe moderna, let/const e tipos', 'sintaxe-e-variaveis', 'video', 24, 'A evolução do JavaScript e declaração de dados.', 'S9uPNppGsGo', '# JavaScript Moderno\n\nEscopo de bloco com `let` e `const`.'),
('l-js-2', 'mod-js', 2, 'Funções, Arrow Functions e Callbacks', 'funcoes-callbacks', 'video', 26, 'Funções como valores de primeira classe.', 'S9uPNppGsGo', '# Funções em JS\n\nArrow functions, parâmetros padrão e retorno.'),
('l-js-3', 'mod-js', 3, 'Arrays, Objetos e Métodos de iteração', 'arrays-e-objetos', 'video', 28, '`map`, `filter`, `reduce` e desestruturação.', 'S9uPNppGsGo', '# Métodos de Array\n\nManipulando listas funcionais com métodos nativos.'),
('l-js-4', 'mod-js', 4, 'Manipulação da DOM e Eventos', 'dom-e-eventos', 'video', 30, 'Adicionando interatividade às páginas.', 'S9uPNppGsGo', '# DOM API\n\nSelecionando elementos e escutando eventos de clique, teclado e formulário.'),
('l-react-1', 'mod-react', 1, 'Componentes, JSX e Props com TypeScript', 'componentes-jsx', 'video', 30, 'A arquitetura base de interfaces React.', 'S9uPNppGsGo', '# React Components\n\nComponentes funcionais com tipagem rigorosa.'),
('l-react-2', 'mod-react', 2, 'Hooks essenciais: useState e useEffect', 'hooks-estado-efeitos', 'video', 32, 'Gerenciamento de estado e ciclo de vida.', 'S9uPNppGsGo', '# React Hooks\n\nComo manter e reagir a mudanças de dados no cliente.'),
('l-node-1', 'mod-node', 1, 'Node.js, NPM e Módulos', 'node-e-npm', 'video', 24, 'Executando JavaScript no backend.', 'S9uPNppGsGo', '# Node.js Engine\n\nEvent Loop, require/import e gerenciamento de dependências.'),
('l-node-2', 'mod-node', 2, 'APIs REST com Express e Middlewares', 'apis-rest-express', 'video', 34, 'Construção de rotas, validações e tratamento de erros.', 'S9uPNppGsGo', '# Express Framework\n\nCriando endpoints HTTP com JSON.'),
('l-db-1', 'mod-db', 1, 'SQL essencial e Modelagem Relacional', 'sql-essencial', 'video', 28, 'Consultas, junções e integridade de dados no PostgreSQL.', 'S9uPNppGsGo', '# PostgreSQL & SQL\n\nCriando tabelas e executando queries performáticas.'),
('l-fs-1', 'mod-fullstack', 1, 'Arquitetura Full Stack e Deploy na Nuvem', 'arquitetura-full-stack', 'video', 36, 'Integrando front, back e banco em produção.', 'S9uPNppGsGo', '# Full Stack App\n\nDeploy, variáveis de ambiente e segurança em produção.'),
('l-carreira-1', 'mod-carreira', 1, 'Montando um portfólio irresistível', 'montando-portfolio', 'reading', 20, 'Destaque-se em processos seletivos e entrevistas técnicas.', null, '# Carreira Dev\n\nEstratégias para conseguir seu primeiro emprego na área.')
on conflict (id) do nothing;

-- 6. Insert Exercises
insert into public.exercises (id, module_id, type, prompt, options, correct_index, explanation, difficulty, points) values
('ex-1', 'mod-logica', 'multiple-choice', 'O que é uma variável em programação?', '["Um espaço nomeado na memória para armazenar um valor", "Um tipo de laço de repetição", "Uma função que sempre retorna verdadeiro", "Um erro de sintaxe"]'::jsonb, 0, 'Uma variável é um espaço nomeado na memória usado para guardar valores que podem mudar durante a execução do programa.', 'facil', 20),
('ex-2', 'mod-logica', 'true-false', 'Um loop "while" executa seu bloco enquanto a condição for verdadeira.', '["Verdadeiro", "Falso"]'::jsonb, 0, 'Exato. O while repete o bloco de código enquanto a condição avaliada continuar verdadeira.', 'facil', 20),
('ex-3', 'mod-logica', 'multiple-choice', 'Qual operador é usado para comparar igualdade estrita (valor E tipo) em JavaScript?', '["==", "===", "=", "!="]'::jsonb, 1, 'O operador === compara valor e tipo, sendo a comparação estrita recomendada para evitar coerções implícitas.', 'medio', 20),
('ex-4', 'mod-logica', 'code', 'Escreva uma função que receba dois números e retorne a soma deles.', '[]'::jsonb, null, 'Uma solução recomendada: function soma(a, b) { return a + b }', 'medio', 30),
('ex-5', 'mod-logica', 'multiple-choice', 'Quantas vezes o loop "for (let i = 0; i < 3; i++)" executa?', '["2 vezes", "3 vezes", "4 vezes", "Infinitas vezes"]'::jsonb, 1, 'i vai de 0 a 2 (0, 1, 2), executando exatamente 3 vezes.', 'facil', 20)
on conflict (id) do nothing;

-- 7. Insert Assessments
insert into public.assessments (id, module_id, title, description, min_score, time_limit_min) values
('assess-logica', 'mod-logica', 'Avaliação Oficial — Lógica de Programação', 'Teste seus conhecimentos essenciais para desbloquear o próximo módulo.', 70, 15),
('assess-algoritmos', 'mod-algoritmos', 'Avaliação Oficial — Algoritmos e Estruturas', 'Teste seu raciocínio em estruturas de dados e Big-O.', 70, 20),
('assess-git', 'mod-git', 'Avaliação Oficial — Git & GitHub', 'Valide seu domínio de branches, commits e colaboração.', 70, 15),
('assess-html', 'mod-html', 'Avaliação Oficial — HTML5', 'Teste seus conhecimentos em semântica e formulários.', 70, 15),
('assess-css', 'mod-css', 'Avaliação Oficial — CSS & Layouts', 'Avalie sua capacidade de estruturar Flexbox e Grid.', 70, 20),
('assess-js', 'mod-js', 'Avaliação Oficial — JavaScript', 'Avaliação detalhada dos fundamentos de JS moderno.', 70, 25)
on conflict (id) do nothing;

-- 8. Assessment Questions
insert into public.assessment_questions (id, assessment_id, prompt, options, correct_index, explanation, topic, points) values
('q1', 'assess-logica', 'Qual estrutura usamos para tomar decisões no código?', '["Loop", "Condicional (if/else)", "Variável", "Comentário"]'::jsonb, 1, 'Condicionais como if/else avaliam expressões booleanas e direcionam o fluxo de execução.', 'Condicionais', 20),
('q2', 'assess-logica', 'Qual dessas é uma boa prática ao nomear variáveis?', '["Usar nomes descritivos e em camelCase", "Usar apenas letras aleatórias", "Sempre nomear com uma letra", "Usar espaços no nome"]'::jsonb, 0, 'Nomes descritivos facilitam a leitura e manutenção do código por você e sua equipe.', 'Variáveis', 20),
('q3', 'assess-logica', 'O que um loop faz?', '["Repete um bloco de código", "Encerra o programa", "Declara uma constante", "Cria um comentário"]'::jsonb, 0, 'Estruturas de repetição executam instruções múltiplas vezes conforme uma condição.', 'Loops', 20),
('q4', 'assess-logica', 'Qual o resultado de "10 % 3"?', '["1", "3", "0", "3.33"]'::jsonb, 0, 'O operador % calcula o resto da divisão inteira: 10 dividido por 3 dá 3 com resto 1.', 'Operadores', 20),
('q5', 'assess-logica', 'Funções servem para:', '["Organizar e reutilizar blocos de código", "Apenas exibir mensagens", "Substituir o banco de dados", "Deixar o código mais lento"]'::jsonb, 0, 'Funções encapsulam lógicas específicas que podem ser reutilizadas e testadas independentemente.', 'Funções', 20)
on conflict (id) do nothing;

-- 9. Module Projects
insert into public.module_projects (id, module_id, title, description, requirements, deliverables, evaluation_criteria) values
('mp-logica', 'mod-logica', 'Calculadora de Console & Lógica', 'Construa uma calculadora modular que recebe números e operadores e trata erros.', array['Receber dois números válidos', 'Suportar +, -, * e /', 'Tratar divisão por zero com mensagem amigável', 'Código modular com funções reutilizáveis'], array['Repositório no GitHub', 'README explicando a solução'], array['Corretude dos cálculos', 'Tratamento de exceções', 'Organização e clareza do código']),
('mp-html', 'mod-html', 'Página Institucional Semântica', 'Crie a estrutura completa de uma página institucional acessível.', array['Uso correto de tags semânticas', 'Formulário de contato acessível', 'Hierarquia clara de cabeçalhos (h1-h6)'], array['Código HTML validado', 'Deploy no Vercel/GitHub Pages'], array['Semântica HTML5', 'Acessibilidade']),
('mp-css', 'mod-css', 'Landing Page Responsiva Cafeteria', 'Estilize uma interface moderna utilizando Flexbox, Grid e Media Queries.', array['Layout totalmente responsivo', 'Seções de Hero, Cardápio e Contato', 'Efeitos de hover e transições suaves'], array['Deploy online', 'Repositório GitHub'], array['Fidelidade visual', 'Adaptação mobile']),
('mp-js', 'mod-js', 'Task Manager Interativo', 'Aplicativo de tarefas com persistência em localStorage e filtros.', array['Adicionar, editar e remover tarefas', 'Filtro por status (todas, ativas, concluídas)', 'Persistência no navegador'], array['Deploy e repositório'], array['Manipulação de DOM', 'Persistência']),
('mp-react', 'mod-react', 'Painel Dashboard com React & TS', 'Construa um dashboard componentizado consumindo dados.', array['Componentes tipados com TypeScript', 'Gerenciamento de estado com Hooks', 'Interface com modo escuro'], array['Deploy na Vercel', 'Código no GitHub'], array['Tipagem TypeScript', 'Componentização']),
('mp-fullstack', 'mod-fullstack', 'DevPath AI Showcase App', 'Aplicação Full Stack completa com frontend, backend e autenticação.', array['Autenticação de usuários', 'Operações CRUD completas', 'Integração de banco de dados e deploy'], array['URL pública da aplicação', 'Repositório público'], array['Arquitetura', 'Segurança', 'Usabilidade'])
on conflict (id) do nothing;

-- 10. Achievements
insert into public.achievements (id, code, title, description, icon, xp_reward, category) values
('a1', 'first_lesson', 'Primeiros passos', 'Concluiu a primeira aula na plataforma', 'footprints', 50, 'progresso'),
('a2', 'first_code', 'Código na veia', 'Executou o primeiro código no Code Lab', 'terminal', 50, 'pratica'),
('a3', 'streak_7', 'Constância de Ferro', 'Estudou 7 dias seguidos sem falhar', 'flame', 200, 'habito'),
('a4', 'first_project', 'Mão na Massa', 'Concluiu e submeteu seu primeiro projeto', 'rocket', 150, 'projetos'),
('a5', 'first_module', 'Módulo Dominado', 'Concluiu seu primeiro módulo com aprovação', 'trophy', 500, 'progresso'),
('a6', 'marathon_100', 'Maratonista do Código', 'Resolveu 100 exercícios práticos', 'medal', 300, 'exercicios'),
('a7', 'fullstack_grad', 'Desenvolvedor Full Stack', 'Concluiu a trilha completa e foi aprovado', 'crown', 1000, 'carreira'),
('a8', 'career_ready', 'Pronto para o Mercado', 'Finalizou o módulo de carreira e simulou entrevista', 'briefcase', 400, 'carreira')
on conflict (id) do nothing;
