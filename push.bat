@echo off
title Push Delivery Production Count to GitHub
cd /d "%~dp0"
echo ========================================================
echo Pushing to https://github.com/SUDHINRAJ07/DELIEVRY-PRODUCTION-WEBPAGE.git
echo ========================================================
git push -u origin main
git push -u origin delivery-production-count
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Push completed successfully!
) else (
    echo [ERROR] Push failed. Please check your GitHub authorization.
)
echo.
pause
