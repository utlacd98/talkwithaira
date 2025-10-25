@echo off
REM Aira Deployment Script for Windows
REM This script helps you deploy Aira to Vercel

setlocal enabledelayedexpansion

echo.
echo 🚀 Aira Deployment Script
echo ==========================
echo.

REM Check if git is initialized
if not exist .git (
    echo ❌ Git repository not found. Please initialize git first:
    echo    git init
    exit /b 1
)

REM Check for uncommitted changes
git diff-index --quiet HEAD --
if errorlevel 1 (
    echo ⚠️  You have uncommitted changes. Committing them now...
    git add .
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
    for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)
    git commit -m "Deployment: !mydate! !mytime!"
)

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if errorlevel 1 (
    echo 📦 Installing Vercel CLI...
    call npm install -g vercel
)

echo.
echo 📋 Pre-deployment Checklist:
echo ============================
echo.
echo Before deploying, make sure you have:
echo   ✓ Vercel account (https://vercel.com)
echo   ✓ GitHub account connected to Vercel
echo   ✓ All environment variables ready
echo   ✓ Lemonsqueezy webhook secret
echo.

set /p confirm="Have you completed the checklist? (y/n): "
if /i not "%confirm%"=="y" (
    echo Please complete the checklist before deploying.
    exit /b 1
)

echo.
echo 🔍 Running build check...
call npm run build

if errorlevel 1 (
    echo ❌ Build failed. Please fix errors and try again.
    exit /b 1
)

echo.
echo ✅ Build successful!
echo.

echo 🚀 Deploying to Vercel...
echo.
echo Choose deployment type:
echo   1) Preview (staging)
echo   2) Production
echo.

set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    echo Deploying to preview...
    call vercel
) else if "%choice%"=="2" (
    echo Deploying to production...
    call vercel --prod
) else (
    echo Invalid choice
    exit /b 1
)

echo.
echo ✅ Deployment complete!
echo.
echo Next steps:
echo   1. Visit your Vercel dashboard to verify deployment
echo   2. Update Lemonsqueezy webhook URL
echo   3. Test the payment flow
echo   4. Monitor logs for any errors
echo.
echo For more information, see DEPLOYMENT_GUIDE.md
echo.

pause

