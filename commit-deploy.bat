@echo off
chcp 65001 >nul
echo.
echo ========================================
echo       CALLCORD - COMMIT E DEPLOY
echo ========================================
echo.

REM Verificar se estamos no diretório correto
if not exist "package.json" (
    echo ❌ ERRO: Não encontrei package.json
    echo    Certifique-se de estar na pasta do projeto Callcord
    echo.
    pause
    exit /b 1
)

echo [1/6] Verificando status do Git...
git status --porcelain
if %errorlevel% neq 0 (
    echo ❌ ERRO: Git não está configurado corretamente
    pause
    exit /b 1
)

echo.
echo [2/6] Testando build local...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERRO: Build falhou! Corrija os erros antes de continuar.
    echo.
    pause
    exit /b 1
)

echo.
echo [3/6] Build OK! Adicionando arquivos...
git add .

REM Verificar se há mudanças
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo.
    echo ⚠️  Nenhuma mudança detectada para commit!
    echo.
    pause
    exit /b 0
)

echo.
echo [4/6] Fazendo commit...
git commit -m "🚀 Deploy Callcord - Build OK - Socket.io funcionando"

echo.
echo [5/6] Enviando para GitHub...
git push

if %errorlevel% neq 0 (
    echo.
    echo ❌ ERRO no push! Tentando pull primeiro...
    git pull --rebase
    git push
    if %errorlevel% neq 0 (
        echo.
        echo ❌ ERRO: Falha no push. Verifique a conexão.
        pause
        exit /b 1
    )
)

echo.
echo [6/6] Deploy iniciado! Verificando status...
echo.
echo ✅ SUCESSO! Commit realizado e enviado para:
echo    📦 Repositório: https://github.com/SaimonDevStore/callcord
echo    🔗 Site: https://callcord.vercel.app
echo    📨 Convite: https://callcord.vercel.app/invite/callcord-oficial
echo.
echo 🌐 Deploy automático iniciado no Vercel...
echo    ⏱️  Aguarde 2-3 minutos para o deploy completar
echo.
echo 📊 Para verificar o status do deploy:
echo    https://vercel.com/dashboard
echo.

REM Abrir o site após alguns segundos
echo 🚀 Abrindo o site em 5 segundos...
timeout /t 5 /nobreak >nul
start https://callcord.vercel.app

echo.
echo ========================================
echo           DEPLOY FINALIZADO
echo ========================================
echo.
pause
