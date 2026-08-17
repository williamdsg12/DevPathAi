#!/usr/bin/env bash
set -u

echo ""
echo "=============================================="
echo "   DEVPATH AI - DEPLOY AUTOMATICO"
echo "=============================================="
echo ""

if ! command -v git >/dev/null 2>&1; then
  echo "ERRO: Git nao foi encontrado no PATH."
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERRO: esta pasta nao e um repositorio Git."
  echo "Entre na pasta do projeto e execute novamente."
  exit 1
fi

BRANCH="$(git branch --show-current)"

if [ -z "$BRANCH" ]; then
  echo "ERRO: nao foi possivel identificar a branch atual."
  exit 1
fi

echo "Branch atual: $BRANCH"
echo ""

echo "[1/5] Verificando alteracoes..."
git status --short
echo ""

echo "[2/5] Adicionando arquivos..."
git add -A

if git diff --cached --quiet; then
  echo "Nenhuma alteracao nova para commit."
else
  TIMESTAMP="$(date '+%Y-%m-%d %H:%M:%S')"
  COMMIT_MSG="deploy: atualizacao automatica $TIMESTAMP"

  echo "[3/5] Criando commit..."
  git commit -m "$COMMIT_MSG" || {
    echo "ERRO: falha ao criar o commit."
    exit 1
  }
fi

echo "[4/5] Sincronizando com o GitHub..."
git pull --rebase origin "$BRANCH" || {
  echo ""
  echo "ERRO: nao foi possivel fazer pull --rebase."
  echo "Pode existir conflito de merge."
  echo "Resolva o conflito e execute ./deploy.sh novamente."
  exit 1
}

echo "[5/5] Enviando para o GitHub..."
git push origin "$BRANCH" || {
  echo ""
  echo "ERRO: falha no push."
  echo "Verifique autenticacao, internet e configuracao do remote."
  exit 1
}

echo ""
echo "=============================================="
echo "       DEPLOY CONCLUIDO COM SUCESSO!"
echo "=============================================="
echo ""
echo "Repositorio: $(git remote get-url origin 2>/dev/null || echo 'origin nao configurado')"
echo "Branch:      $BRANCH"
echo "Commit:      $(git rev-parse --short HEAD)"
echo ""
