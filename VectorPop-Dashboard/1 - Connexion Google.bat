@echo off
chcp 65001 >nul
title Connexion Google - VectorPop Dashboard
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-google.ps1"
