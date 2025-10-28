@echo off
echo Starting AI Texture Generator...
echo.

REM Check if node_modules exist
if not exist "node_modules" (
    echo Root dependencies not found. Running setup...
    call setup.bat
    if %errorlevel% neq 0 exit /b 1
)

if not exist "backend\node_modules" (
    echo Backend dependencies not found. Installing...
    cd backend
    npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Frontend dependencies not found. Installing...
    cd frontend
    npm install
    cd ..
)

echo Starting development servers...
echo.
echo Backend will start on: http://localhost:3001
echo Frontend will start on: http://localhost:3000
echo.
echo Press Ctrl+C to stop all servers
echo.

REM Start both servers concurrently
npm run dev