@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0vectorpop-dashboard.ps1"
if errorlevel 1 pause
