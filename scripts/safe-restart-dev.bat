@echo off
REM Safe Dev Server Restart Script
REM This batch file calls the PowerShell script with protected process handling

powershell -ExecutionPolicy Bypass -File "%~dp0safe-restart-dev.ps1"
