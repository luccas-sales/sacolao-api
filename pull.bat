@echo off
echo Iniciando PULL

call git reset --hard
call git pull origin main

call npm install

call npx prisma generate

call npm run build

call pm2 restart sacolao-api

echo PULL concluido