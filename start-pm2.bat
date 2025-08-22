@echo off
echo ===================================
echo    CALLCORD - PM2 Manager
echo ===================================
echo.

echo [1/5] Verificando PM2...
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Instalando PM2...
    call npm install -g pm2
    if %errorlevel% neq 0 (
        echo ERRO: Falha ao instalar PM2!
        pause
        exit /b 1
    )
)
echo ✅ PM2 encontrado

echo.
echo [2/5] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias!
    pause
    exit /b 1
)
echo ✅ Dependencias instaladas

echo.
echo [3/5] Gerando Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERRO: Falha ao gerar Prisma Client!
    pause
    exit /b 1
)
echo ✅ Prisma Client gerado

echo.
echo [4/5] Build do projeto...
call npm run build
if %errorlevel% neq 0 (
    echo ERRO: Falha no build!
    pause
    exit /b 1
)
echo ✅ Build concluido

echo.
echo [5/5] Iniciando com PM2...
call pm2 start npm --name "callcord" -- start
if %errorlevel% neq 0 (
    echo ERRO: Falha ao iniciar PM2!
    pause
    exit /b 1
)

echo.
echo 🎉 Servidor iniciado com sucesso!
echo.
echo 📊 Comandos PM2:
echo    Status: pm2 status
echo    Logs: pm2 logs callcord
echo    Reiniciar: pm2 restart callcord
echo    Parar: pm2 stop callcord
echo.
echo 🌐 URLs de acesso:
echo    Local: http://localhost:3000
echo    Rede: http://[SEU-IP]:3000
echo.
echo Pressione qualquer tecla para ver o status...
pause >nul

call pm2 status
echo.
echo Pressione qualquer tecla para sair...
pause >nul

