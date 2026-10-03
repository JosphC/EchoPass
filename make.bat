@echo off
REM Windows stand-in for the Makefile targets (GNU make is optional).
if "%1"=="" goto usage
if "%1"=="up" docker compose up --build -d app mock-api & goto :eof
if "%1"=="down" docker compose down & goto :eof
if "%1"=="check" docker compose run --rm checks & goto :eof
if "%1"=="test" docker compose run --rm checks npm test -- --ci --forceExit & goto :eof
if "%1"=="logs" docker compose logs -f app mock-api & goto :eof
if "%1"=="reset" docker compose down -v & goto :eof
:usage
echo Usage: make [up^|down^|check^|test^|logs^|reset]
exit /b 1
