@echo off
setlocal

REM ---------------------------------------------------------------------
REM Technical Query Module - one-click local launcher
REM
REM Starts, each in its own window:
REM   1. Embedded PostgreSQL-compatible database (PGlite over TCP :5432)
REM   2. Express API server                       (http://localhost:4001)
REM   3. React (Vite) client                       (http://localhost:5180)
REM Then opens the app in your default browser.
REM
REM First run only: installs npm dependencies and loads the database
REM schema + seed data if they aren't already set up.
REM ---------------------------------------------------------------------

set ROOT=%~dp0
set SERVER_DIR=%ROOT%server
set CLIENT_DIR=%ROOT%client

echo ==============================================
echo  Technical Query Module - starting services
echo ==============================================

REM --- one-time setup: server deps ---
if not exist "%SERVER_DIR%\node_modules" (
    echo [setup] Installing server dependencies...
    pushd "%SERVER_DIR%"
    call npm install
    popd
)

REM --- one-time setup: client deps ---
if not exist "%CLIENT_DIR%\node_modules" (
    echo [setup] Installing client dependencies...
    pushd "%CLIENT_DIR%"
    call npm install
    popd
)

REM --- one-time setup: .env files ---
if not exist "%SERVER_DIR%\.env" (
    echo [setup] Creating server\.env from .env.example...
    copy "%SERVER_DIR%\.env.example" "%SERVER_DIR%\.env" >nul
)
if not exist "%CLIENT_DIR%\.env" (
    echo [setup] Creating client\.env from .env.example...
    copy "%CLIENT_DIR%\.env.example" "%CLIENT_DIR%\.env" >nul
)

REM --- one-time setup: database (schema + seed) ---
if not exist "%SERVER_DIR%\pgdata" (
    echo [setup] First run detected: starting database and loading schema...
    start "TQ Database (PGlite)" cmd /k "cd /d "%SERVER_DIR%" && node pglite-server.js"
    echo [setup] Waiting for database to come up...
    timeout /t 5 /nobreak >nul
    pushd "%SERVER_DIR%"
    call node run-sql.js ..\database\schema.sql
    call node run-sql.js ..\database\seed.sql
    popd
) else (
    echo [db] Starting database...
    start "TQ Database (PGlite)" cmd /k "cd /d "%SERVER_DIR%" && node pglite-server.js"
    timeout /t 3 /nobreak >nul
)

echo [api] Starting API server on http://localhost:4001 ...
start "TQ API Server" cmd /k "cd /d "%SERVER_DIR%" && node src\server.js"
timeout /t 3 /nobreak >nul

echo [web] Starting client on http://localhost:5180 ...
start "TQ Client" cmd /k "cd /d "%CLIENT_DIR%" && npm run dev"
timeout /t 5 /nobreak >nul

echo [web] Opening browser...
start "" "http://localhost:5180"

echo.
echo All three services are starting in their own windows:
echo   - TQ Database (PGlite)   -^> 127.0.0.1:5432
echo   - TQ API Server          -^> http://localhost:4001
echo   - TQ Client              -^> http://localhost:5180
echo.
echo Close those windows (or press Ctrl+C in each) to stop the services.
echo.
pause
endlocal
