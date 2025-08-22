@echo off
echo ===================================
echo    CALLCORD - Descobrir IP Local
echo ===================================
echo.

echo 🔍 Procurando seu IP na rede local...
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set "ip=%%a"
    set "ip=!ip: =!"
    echo ✅ IP Local encontrado: !ip!
    echo.
    echo 🌐 URLs para seus amigos:
    echo    App: http://!ip!:3000
    echo    API: http://!ip!:3000/api
    echo.
)

echo 📱 Para seus amigos acessarem:
echo    1. Certifique-se de estar na mesma rede WiFi
echo    2. Digitem no navegador: http://!ip!:3000
echo    3. Se nao funcionar, verifique o firewall
echo.
echo 🔒 Dica: Configure o firewall para permitir Node.js
echo.
pause

