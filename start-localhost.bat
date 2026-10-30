@echo off
echo ========================================================
echo Starting PR11 Task Manager on Localhost (No Docker)
echo ========================================================
echo.
echo [1/2] Starting Node/Express Backend on port 5000...
start "PR11 Backend API (:5000)" cmd /k "cd /d %~dp0backend && node server.js"

timeout /t 2 >nul

echo [2/2] Starting React Vite Frontend on port 5173...
start "PR11 React Frontend (:5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo Both servers have been launched in separate terminals!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:5000/health
echo ========================================================
pause
