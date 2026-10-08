@echo off
chcp 65001 > nul
cls
echo =============================================================
echo    🏫 GROUPE SCOLAIRE D'EXCELLENCE SIDY KONATE (GSEK)
echo    Démarrage du Serveur Central Local
echo =============================================================
echo.

cd /d "%~dp0"

echo [1/2] Vérification de l'environnement Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installé sur cette machine.
    echo Veuillez installer Node.js (version 20 ou supérieure).
    pause
    exit /b 1
)

echo [2/2] Lancement du serveur et de la base de données SQLite...
echo.
echo Le serveur va démarrer. Laissez cette fenêtre ouverte en arrière-plan.
echo Pour arrêter le serveur, appuyez sur Ctrl + C.
echo.

node server/index.js
pause
