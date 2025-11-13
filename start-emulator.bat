@echo off
echo Iniciando emulador Android...
start "Android Emulator" "C:\Users\mathe\AppData\Local\Android\Sdk\emulator\emulator.exe" -avd Medium_Phone
echo Aguardando emulador inicializar (30 segundos)...
timeout /t 30 /nobreak
echo Emulador deve estar pronto!
echo Execute agora: npm run android
