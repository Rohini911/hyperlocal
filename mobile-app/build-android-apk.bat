@echo off
title Mobile App Builder - Android APK
echo ========================================================
echo  Building Mobile App (Android / Capacitor Bundle)
echo ========================================================
echo.
echo Step 1: Building production frontend web bundle...
cd /d "%~dp0..\frontend"
call npm run build

echo.
echo Step 2: Syncing bundle into Mobile container...
cd /d "%~dp0"
call npx cap sync android

echo.
echo Step 3: Launching Android Studio to build APK...
call npx cap open android

echo ========================================================
echo Mobile build ready! In Android Studio: Build -^> Build APK(s)
echo ========================================================
pause
