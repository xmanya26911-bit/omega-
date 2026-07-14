# ═══════════════════════════════════════════════
# OMEGA Cloud — Deploy Script
# ═══════════════════════════════════════════════
# Run this after installing Vercel CLI:
#   npm install -g vercel
# ═══════════════════════════════════════════════

@echo off
title OMEGA Cloud — Deploy to Vercel

echo.
echo   ╔═══════════════════════════════════════╗
echo   ║       OMEGA Cloud — Deploy            ║
echo   ╚═══════════════════════════════════════╝
echo.

echo [1/4] Checking dependencies...
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo   ⚠️  Vercel CLI not found. Installing...
    npm install -g vercel
)
echo   ✅ Vercel CLI ready

echo.
echo [2/4] Logging in to Vercel...
echo   ℹ  A browser tab will open — log in with GitHub
vercel login --github

echo.
echo [3/4] Deploying to Vercel...
echo   ℹ  Follow prompts:
echo      - Link to existing project? → No (create new)
echo      - Project name → omega-cloud
echo      - Directory → . (current)
echo      - Override settings → No
echo.
vercel --prod

echo.
echo [4/4] Done!
echo.
echo   🌐 Your OMEGA Cloud URL will appear above
echo   🔑 Password: unc.xo.anyaa
echo.
pause
