#!/bin/bash

echo "Setting up AI Texture Generator..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js version:"
node --version
echo

# Install root dependencies
echo "Installing root dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install root dependencies"
    exit 1
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    exit 1
fi
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    exit 1
fi
cd ..

echo
echo "========================================"
echo "Setup completed successfully!"
echo "========================================"
echo
echo "To start the application:"
echo "  1. Run: ./start-dev.sh"
echo "  2. Or manually:"
echo "     - Backend: cd backend && npm run dev"
echo "     - Frontend: cd frontend && npm start"
echo
echo "To use with Ollama:"
echo "  1. Install Ollama from https://ollama.ai"
echo "  2. Run: ollama pull llama3.2"
echo "  3. Start the application"
echo
echo "Application URLs:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:3001"
echo "  - Health Check: http://localhost:3001/health"
echo