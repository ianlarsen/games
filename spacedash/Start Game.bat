@echo off
cd /d "%~dp0"
echo Spacedash: open http://localhost:8000 in your browser.
echo Leave this window open while playing. Press Ctrl+C to stop.
node server.cjs 8000
pause
