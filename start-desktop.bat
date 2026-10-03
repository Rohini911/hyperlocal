@echo off
title Hyperlocal Emergency Platform - Desktop App Launcher
echo ========================================================
echo  Starting Emergency Desktop Application
echo ========================================================
echo.

start "Emergency Backend API" cmd /k "cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 2 >nul

start "Emergency Web Server" cmd /k "cd frontend && npm run dev"
timeout /t 3 >nul

echo Launching Native Desktop Window...
cd desktop-app
npx electron .
