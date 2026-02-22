@echo off
echo PDF Crawler Builder
echo ==================
echo.

node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed!
    echo Download from https://nodejs.org/
    pause
    exit /b 1
)

echo Installing dependencies...
call npm install

echo.
echo Building executable...
call npm run build

echo.
echo ✅ Build complete!
echo Executable: pdf-crawler.exe
echo Size: ~35-40MB
echo.
pause