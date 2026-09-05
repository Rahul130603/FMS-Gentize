@echo off
setlocal
chcp 65001 >nul
title FMS Delivery Module - Launcher

set "ROOT=%~dp0"
echo ========================================================
echo   FMS Delivery Module and Due Date Delivery Report
echo ========================================================
echo Root directory: %ROOT%
echo.
echo No database server to start - the backend uses a local
echo SQLite file (backend/data/fms_delivery.sqlite), created
echo automatically on first run.
echo.

echo [1/3] Starting Backend Server (Port 5000)...
start "FMS Backend" cmd /k "cd /d "%ROOT%backend" && npm run dev"

echo [2/3] Starting Frontend Server (Port 3000)...
start "FMS Frontend" cmd /k "cd /d "%ROOT%frontend" && npm run dev"

echo [3/3] Opening browser at http://localhost:3000 ...
ping 127.0.0.1 -n 4 >nul
start http://localhost:3000

echo.
echo ========================================================
echo  Services started!
echo  - Backend:  http://localhost:5000
echo  - Frontend: http://localhost:3000
echo ========================================================
echo.
echo Press any key to close this launcher window (servers will stay running).
pause >nul
