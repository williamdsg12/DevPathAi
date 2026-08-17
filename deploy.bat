@echo off
title DEVPATH AI - DEPLOY

echo.
echo ==========================================
echo        DEVPATH AI - DEPLOY GITHUB
echo ==========================================
echo.

echo [1/5] Verificando status...
git status

echo.
echo [2/5] Adicionando arquivos...
git add .

echo.
echo [3/5] Criando commit...

git diff --cached --quiet

if %errorlevel%==0 (
    echo Nenhuma alteracao nova encontrada.
) else (
    git commit -m "update: DevPath AI"
)

echo.
echo [4/5] Enviando para GitHub...

git push origin main

if %errorlevel% neq 0 (
    echo.
    echo ==========================================
    echo          ERRO NO DEPLOY
    echo ==========================================
    echo.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo       DEPLOY CONCLUIDO COM SUCESSO!
echo ==========================================
echo.
echo GitHub atualizado:
echo https://github.com/williamdsg12/DevPathAi
echo.

pause