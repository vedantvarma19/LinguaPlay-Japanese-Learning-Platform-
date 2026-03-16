@echo off
REM LinguaPlay Local Setup Script for Windows
REM Run this script to set up your local development environment

echo 🌸 LinguaPlay - Local Development Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed
node --version
echo.

REM Backend Setup
echo 📦 Setting up Backend...
cd backend

if not exist ".env" (
    echo Creating backend .env file...
    copy .env.example .env
    echo ⚠️  Please edit backend\.env with your MongoDB URI and JWT Secret
) else (
    echo ✅ Backend .env already exists
)

echo Installing backend dependencies...
call npm install

echo.
echo ✅ Backend setup complete!
echo.

REM Frontend Setup
echo 📦 Setting up Frontend...
cd ..\frontend

if not exist ".env" (
    echo Creating frontend .env file...
    copy .env.example .env
    echo ✅ Frontend .env created with default values
) else (
    echo ✅ Frontend .env already exists
)

echo Installing frontend dependencies...
call npm install

echo.
echo ✅ Frontend setup complete!
echo.

REM Final Instructions
echo 🎉 Setup Complete!
echo ==================
echo.
echo Next steps:
echo 1. Edit backend\.env with your MongoDB URI and JWT Secret
echo 2. Start backend:  cd backend ^&^& npm start
echo 3. Start frontend: cd frontend ^&^& npm start
echo.
echo Backend will run on:  http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Optional: Seed database with flashcards
echo   cd backend ^&^& npm run seed
echo.
echo Happy coding! 🚀
echo.
pause
