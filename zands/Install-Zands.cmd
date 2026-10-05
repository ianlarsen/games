@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Install-Zands.ps1"
if errorlevel 1 echo Installation did not finish. Read the error above.
pause
