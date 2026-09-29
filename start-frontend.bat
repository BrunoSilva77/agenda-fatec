@echo off
setlocal
cd /d "%~dp0frontend"

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js/npm nao encontrado. Instale o Node.js LTS e tente novamente.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Instalando dependencias ^(npm install^)...
  call npm install
  if errorlevel 1 (
    echo [ERRO] Falha no npm install.
    pause
    exit /b 1
  )
)

echo Iniciando Frontend - Vite em http://localhost:5173 ...
call npm run dev
if errorlevel 1 (
  echo.
  echo [ERRO] Falha ao executar o frontend. Veja as mensagens acima.
  pause
)
