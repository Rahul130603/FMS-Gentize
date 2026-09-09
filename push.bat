@echo off
title Push Delivery Production Count to GitHub
cd /d "%~dp0"
echo ========================================================
echo Pushing to https://github.com/Rahul130603/FMS-Gentize.git
echo ========================================================
git push origin delivery-production-count
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Push completed successfully!
) else (
    echo [ERROR] Push failed. Please check your GitHub authorization.
)
echo.
pause
