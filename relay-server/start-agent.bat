@echo off
title Omega PC Remote Agent
cd /d "%~dp0"
echo ^Ω^ Omega PC Remote Agent
echo.
echo Connecting to relay server...
echo.

REM ── CONFIG ──
set OMEGA_RELAY_URL=wss://omega-relay.onrender.com
set OMEGA_RELAY_TOKEN=change-me-to-your-relay-token
set OMEGA_ALLOWED_DIRS=C:\Users\pc,D:\TERMINALCLI
REM ─────────────

:start
echo [%date% %time%] Starting agent...
python omega-pc-agent.py
echo [%date% %time%] Agent stopped. Restarting in 5s...
timeout /t 5 /nobreak >nul
goto start
