@echo off
echo Fazendo commit da solucao completa do build estatico...
git add .
git commit -m "fix: solucao completa para build estatico - pagina raiz estatica + componente de redirecionamento inteligente"
git push origin master
echo Commit e push concluidos!
pause
