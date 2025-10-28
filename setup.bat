@echo off
echo Setting up AI Texture Generator...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Install root dependencies
echo Installing root dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install root dependencies
    pause
    exit /b 1
)

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo To start the application:
echo   1. Run: start-dev.bat
echo   2. Or manually:
echo      - Backend: cd backend && npm run dev
echo      - Frontend: cd frontend && npm start
echo.
echo To use with Ollama:
echo   1. Install Ollama from https://ollama.ai
echo   2. Run: ollama pull llama3.2
echo   3. Start the application
echo.
echo Application URLs:
echo   - Frontend: http://localhost:3000
echo   - Backend API: http://localhost:3001
echo   - Health Check: http://localhost:3001/health
echo.
pause