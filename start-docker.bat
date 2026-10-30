@echo off
echo ========================================================
echo Starting PR11 Docker Compose Full-Stack Architecture
echo ========================================================
echo.
echo Checking Docker engine status...
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker Desktop engine is not running or starting up!
    echo.
    echo Please make sure Docker Desktop is launched and the whale icon is green.
    echo If WSL is required, run: wsl --install
    echo.
    pause
    exit /b 1
)

echo Docker engine is active. Building and starting all 3 services...
docker-compose up --build
pause
