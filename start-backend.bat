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

echo Iniciando Backend - Agenda Fatec API em http://localhost:5000 ...
dotnet run --project src\AgendaFatec.Api
if errorlevel 1 (
  echo.
  echo [ERRO] Falha ao executar o backend. Veja as mensagens acima.
  pause
)
