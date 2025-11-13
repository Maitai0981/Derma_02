@echo off
echo Limpando cache do Metro...
rd /s /q %TEMP%\metro-* 2>nul
rd /s /q %TEMP%\react-* 2>nul
rd /s /q node_modules\.cache 2>nul

echo Iniciando Metro Bundler...
call npx react-native start --reset-cache