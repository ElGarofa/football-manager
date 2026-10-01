@echo off
cd /d "%~dp0"
start "" http://localhost:8000
python -m http.server 8000 || py -m http.server 8000 || npx --yes http-server -p 8000
pause
