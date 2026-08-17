#!/bin/bash

echo ""
echo "=========================================="
echo "       DEVPATH AI - DEPLOY GITHUB"
echo "=========================================="
echo ""

echo "[1/6] Verificando Git..."
git --version

echo ""
echo "[2/6] Verificando alterações..."
git status

echo ""
echo "[3/6] Adicionando todos os arquivos..."
git add .

echo ""
echo "[4/6] Criando commit..."

DATA=$(date "+%d/%m/%Y %H:%M")

git commit -m "update: DevPath AI - $DATA"

if [ $? -ne 0 ]; then
    echo ""
    echo "Nenhuma alteração nova para commit."
else
    echo ""
    echo "Commit criado com sucesso!"
fi

echo ""
echo "[5/6] Enviando para GitHub..."

git push origin main

if [ $? -ne 0 ]; then
    echo ""
    echo "ERRO AO ENVIAR PARA O GITHUB."
    echo ""
    echo "Verifique:"
    echo "- conexão com a internet"
    echo "- login/autenticação do GitHub"
    echo "- branch principal"
    echo "- remote origin"
    exit 1
fi

echo ""
echo "[6/6] DEPLOY CONCLUIDO!"
echo ""
echo "=========================================="
echo "      PROJETO ATUALIZADO NO GITHUB"
echo "=========================================="
echo ""