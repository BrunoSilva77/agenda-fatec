@echo off
setlocal
set "PATH=%PATH%;C:\Program Files\dotnet"
set ASPNETCORE_ENVIRONMENT=Development
set ASPNETCORE_URLS=http://localhost:5000
cd /d "%~dp0"

where dotnet >nul 2>nul
if errorlevel 1 (
  echo [ERRO] .NET SDK nao encontrado. Instale o .NET 8 SDK e tente novamente.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js/npm nao encontrado. Instale o Node.js LTS e tente novamente.
  pause
  exit /b 1
)

if not exist "frontend\node_modules" (
  echo Instalando dependencias do frontend ^(npm install^)...
  pushd frontend
  call npm install
  if errorlevel 1 (
    popd
    echo [ERRO] Falha no npm install.
    pause
    exit /b 1
  )
  popd
)

echo Abrindo Backend (http://localhost:5000) e Frontend (http://localhost:5173)...
start "Backend - Agenda Fatec API" cmd /k "dotnet run --project src\AgendaFatec.Api"
start "Frontend - Vite" /d "%~dp0frontend" cmd /k "npm run dev"

echo.
echo Pronto! Acesse:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000/swagger
echo.
timeout /t 8 >nul
