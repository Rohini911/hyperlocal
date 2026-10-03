@echo off
title Emergency Platform - Desktop Launcher
echo ========================================================
echo  Launching Hyperlocal Emergency Response Desktop App
echo ========================================================
echo.
cd /d "%~dp0"
npx electron .
pause
