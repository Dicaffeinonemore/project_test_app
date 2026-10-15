@echo off
setlocal
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
    python -m venv .venv
    if errorlevel 1 goto error
)
".venv\Scripts\python.exe" -m pip install -r requirements.txt
if errorlevel 1 goto error
if not exist "node_modules\vite" (
    call npm.cmd install
    if errorlevel 1 goto error
)
call npm.cmd run build
if errorlevel 1 goto error
echo.
echo Open http://localhost:8501 in your browser.
echo Mobile: use http://YOUR_PC_IP:8501 on the same Wi-Fi.
echo.
".venv\Scripts\python.exe" -m streamlit run app.py
if errorlevel 1 goto error
exit /b 0
:error
echo.
echo Setup failed. Check Python 3.11+ and Node.js 20.19+ are installed.
pause
exit /b 1
