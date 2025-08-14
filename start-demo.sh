#!/bin/bash

# Sudoku Master - Full-Stack Demo Startup Script
# This script starts both the backend and frontend servers

echo "🧩 Starting Sudoku Master Full-Stack Application"
echo "============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are available"

# Function to check if MongoDB is running
check_mongodb() {
    if command -v mongod &> /dev/null; then
        echo "✅ MongoDB is available on your system"
        echo "⚠️  Make sure MongoDB is running: sudo systemctl start mongodb"
    else
        echo "⚠️  MongoDB not found locally. You can:"
        echo "   1. Install MongoDB locally, or"
        echo "   2. Use MongoDB Atlas (cloud) - update MONGODB_URI in backend/.env"
    fi
}

# Check MongoDB
check_mongodb

echo ""
echo "🚀 Starting Backend Server..."
echo "-----------------------------"
cd sudoku-backend

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Start backend in background
npm run dev &
BACKEND_PID=$!

echo "✅ Backend started on http://localhost:5000"
echo "   - API Health Check: http://localhost:5000/api/health"
echo "   - Process ID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 3

echo ""
echo "🎨 Starting Frontend Server..."
echo "------------------------------"
cd ../sudoku-frontend

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo "✅ Frontend starting on http://localhost:3000"
echo ""
echo "🎉 Application Ready!"
echo "===================="
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo ""
echo "To stop the application:"
echo "- Press Ctrl+C to stop this script"
echo "- Or kill backend process: kill $BACKEND_PID"
echo ""
echo "📚 Features to try:"
echo "1. Register a new account"
echo "2. Upload a Sudoku puzzle (JSON or manual)"
echo "3. Play and solve puzzles"
echo "4. View your puzzle dashboard"
echo ""

# Start frontend (this will run in foreground)
npm start

# If we get here, frontend was stopped, so stop backend too
echo ""
echo "🛑 Stopping backend server..."
kill $BACKEND_PID 2>/dev/null
echo "✅ Application stopped successfully"