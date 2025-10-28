#!/bin/bash

echo "Starting AI Texture Generator..."
echo

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    echo "Root dependencies not found. Running setup..."
    ./setup.sh
    if [ $? -ne 0 ]; then
        exit 1
    fi
fi

if [ ! -d "backend/node_modules" ]; then
    echo "Backend dependencies not found. Installing..."
    cd backend
    npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Frontend dependencies not found. Installing..."
    cd frontend
    npm install
    cd ..
fi

echo "Starting development servers..."
echo
echo "Backend will start on: http://localhost:3001"
echo "Frontend will start on: http://localhost:3000"
echo
echo "Press Ctrl+C to stop all servers"
echo

# Start both servers concurrently
npm run dev