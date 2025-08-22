@echo off
echo ========================================
echo FIX: Correcoes FINAIS objetos complexos
echo ========================================
echo.
git add .
git commit -m "FIX: Correcoes FINAIS - Serializados objetos Channel e Member em pages - Corrigidos channels/[channelId]/page.tsx e conversations/[memberId]/page.tsx - Todos objetos Prisma agora serializados corretamente - Build sem erros"
git push origin master
echo.
echo Commit e push concluidos!
pause
