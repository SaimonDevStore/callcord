@echo off
chcp 65001 >nul
echo.
echo ========================================
echo       VERIFICAR STATUS DO DEPLOY
echo ========================================
echo.

echo 🔍 Verificando status do deploy...
echo.

echo 📊 Links importantes:
echo    🌐 Site: https://callcord.vercel.app
echo    📦 Repositório: https://github.com/SaimonDevStore/callcord
echo    📨 Convite: https://callcord.vercel.app/invite/callcord-oficial
echo    📋 Vercel Dashboard: https://vercel.com/dashboard
echo.

echo ⏱️  Aguarde enquanto verifico o status...
timeout /t 3 /nobreak >nul

echo.
echo 🚀 Abrindo o site para teste...
start https://callcord.vercel.app

echo.
echo 📋 Abrindo dashboard do Vercel...
start https://vercel.com/dashboard

echo.
echo ========================================
echo           VERIFICAÇÃO CONCLUÍDA
echo ========================================
echo.
echo 💡 Dicas:
echo    - Se o site não carregar, aguarde mais 2-3 minutos
echo    - Verifique o dashboard do Vercel para ver logs
echo    - Se houver erro, execute o commit-deploy.bat novamente
echo.
pause
