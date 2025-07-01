@echo off
SETLOCAL EnableDelayedExpansion

:: -------------------------------------------------------------
::  Firasat SFX VFX Preview – Windows First-time Setup Script
:: -------------------------------------------------------------
:: 1.  Validates that Node.js & npm are available on the PATH
:: 2.  Installs npm dependencies (uses npm ci when lock-file exists)
:: 3.  Ensures electron-builder is installed globally (for later builds)
:: 4.  Launches the application via `npm run electron-dev`
:: -------------------------------------------------------------

echo ==========================================================
echo   Firasat SFX VFX Preview – First-time Setup
echo ==========================================================
echo.

:: 1) PREREQUISITE CHECKS ---------------------------------------------------
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in PATH.
    echo         Please download it from https://nodejs.org/ and retry.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm was not found in PATH. Re-install Node.js and try again.
    pause
    exit /b 1
)

echo Node.js and npm detected.

:: 2) CHANGE TO REPO ROOT ---------------------------------------------------
cd /d "%~dp0"

:: 3) INSTALL NPM DEPENDENCIES --------------------------------------------
echo.
echo Installing project dependencies (this may take a while)...
if exist package-lock.json (
    npm ci
) else (
    npm install
)
if %errorlevel% neq 0 (
    echo [ERROR] npm failed to install required packages.
    pause
    exit /b 1
)

echo Dependencies installed successfully.

:: 4) ENSURE electron-builder EXISTS ---------------------------------------
:: Needed only for build commands but nice to have ready.
where electron-builder >nul 2>nul
if %errorlevel% neq 0 (
    echo electron-builder not found globally. Installing...
    npm i -g electron-builder
)

:: 5) LAUNCH THE APPLICATION ----------------------------------------------
echo.
echo Launching Firasat SFX VFX Preview...
call npm run electron-dev

echo.
echo Setup complete. Enjoy!
pause

ENDLOCAL 