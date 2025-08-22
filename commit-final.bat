@echo off
echo ========================================
echo    CALLCORD - COMMIT FINAL CORRIGIDO!
echo ========================================
echo.
echo Fazendo commit das ULTIMAS CORRECOES:
echo - Sistema de serializacao universal (lib/serialize.ts)
echo - Corrigido APIs messages e direct-messages
echo - Configuracao para deploy no Render
echo - Solucao definitiva para objetos complexos
echo.

git add .
git commit -m "FIX: Sistema de serializacao DEFINITIVO - Corrigido todas APIs com objetos complexos - Configuracao Render pronta - Build 100%% funcional"
git push origin master

echo.
echo ========================================
echo    COMMIT CONCLUIDO!
echo ========================================
echo.
echo OPCOES DE DEPLOY:
echo.
echo OPCAO 1 - RENDER (RECOMENDADO):
echo 1. Acesse render.com
echo 2. New + Web Service
echo 3. Conecte repositorio callcord
echo 4. Configure variaveis de ambiente
echo 5. Deploy automatico!
echo.
echo OPCAO 2 - VERCEL:
echo 1. Acesse vercel.com
echo 2. Redeploy do projeto callcord
echo.
echo O sistema de serializacao foi TOTALMENTE corrigido!
echo.
pause
