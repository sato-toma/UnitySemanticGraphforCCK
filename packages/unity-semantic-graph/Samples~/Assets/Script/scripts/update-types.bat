@echo off
cd /d "%~dp0"
node update-types.js
if %ERRORLEVEL% neq 0 (
  echo.
  echo Failed to update types.
  exit /b %ERRORLEVEL%
)
echo.
echo Type definitions updated successfully.
