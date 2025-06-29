@echo off
echo Pastikan file SFX berada di dalam folder 'sfx/' untuk dapat dibaca dengan benar.
echo Pastikan file VFX berada di dalam folder 'vfx/' untuk dapat dibaca dengan benar.
echo Copyright 2025 Aldimenur
setlocal enabledelayedexpansion

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

:: Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo npm is not installed. Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

:: Change to the script's directory
cd /d "%~dp0"

:: Install dependencies
echo Installing dependencies...
call npm install

:: Check if installation was successful
if %errorlevel% neq 0 (
    echo Failed to install dependencies.
    pause
    exit /b 1
)

:: Open two command prompt windows
start cmd /k "echo Starting Node.js server... & node server.js"

:: Wait a moment to ensure server is up
timeout /t 2 >nul

:: Open default browser to the application
start http://localhost:3000

echo Application started. Check the opened browser window.
pause 