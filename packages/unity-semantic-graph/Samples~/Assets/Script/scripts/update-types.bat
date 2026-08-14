@echo off
cd /d "%~dp0"

REM Prefer local update-types.js if present, otherwise fall back to repository ts-analyzer script
if exist "%~dp0update-types.js" (
  node "%~dp0update-types.js" "%~dp0..\external"
) else (
  node "%~dp0..\..\..\..\..\ts-analyzer\scripts\update-types.js" "%~dp0..\external"
)

if %ERRORLEVEL% neq 0 (
  echo.
  echo Failed to update types.
  exit /b %ERRORLEVEL%
)

echo.
echo Type definitions updated successfully.
