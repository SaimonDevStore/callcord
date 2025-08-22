@echo off
echo ===================================
echo    CALLCORD - Servidor Local
echo ===================================
echo.

echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Instale o Node.js 18+ em: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js encontrado

echo.
echo [2/4] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias!
    pause
    exit /b 1
)
echo ✅ Dependencias instaladas

echo.
echo [3/4] Gerando Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERRO: Falha ao gerar Prisma Client!
    pause
    exit /b 1
)
echo ✅ Prisma Client gerado

echo.
echo [4/4] Iniciando servidor...
echo.
echo 🌐 URLs de acesso:
echo    Local: http://localhost:3000
echo    Rede: http://[SEU-IP]:3000
echo.
echo Pressione Ctrl+C para parar o servidor
echo.
call npm run dev

