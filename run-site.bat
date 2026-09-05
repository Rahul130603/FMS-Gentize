@echo off
setlocal

cd /d "%~dp0"

where npm >nul 2>&1
if errorlevel 1 (
  echo Node.js and npm are required to run this site.
  echo Install Node.js from https://nodejs.org/ and try again.
  pause
  exit /b 1
)

echo Starting Daily Allotment Status...
echo The site will open in your default browser.
call npm run dev -- --open

endlocal
