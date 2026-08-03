@echo off
setlocal

cd /d "%~dp0"

set MODE=%~1
if "%MODE%"=="" set MODE=standard

set SEED=%~2
if "%SEED%"=="" set SEED=20260803

echo Running complete Problem 1 quality suite...
echo Mode: %MODE%
echo Seed: %SEED%
echo.

node stress-test.js %MODE% %SEED%

echo.
if errorlevel 1 (
  echo QUALITY SUITE FAILED.
  exit /b 1
)

echo QUALITY SUITE PASSED.
exit /b 0
