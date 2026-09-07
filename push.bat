@echo off
title Push Delivery Production Count to GitHub
cd /d "%~dp0"
echo ========================================================
echo Pushing delivery-production-count to GitHub...
echo ========================================================
git push origin delivery-production-count
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Push completed successfully!
) else (
    echo [ERROR] Push failed. Please check your GitHub login.
)
echo.
pause
