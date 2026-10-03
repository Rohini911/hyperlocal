@echo off
title Hyperlocal Emergency Platform - Full Stack Launcher
echo ========================================================
echo  Starting Backend API & Web Application
echo ========================================================
echo.

start "Emergency Backend API" cmd /k "cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 2 >nul

start "Emergency Web Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 >nul

start http://127.0.0.1:5173

echo.
echo ========================================================
echo  Platform is running!
echo  - Frontend: http://127.0.0.1:5173
echo  - Backend Docs: http://127.0.0.1:8000/docs
echo ========================================================
pause
