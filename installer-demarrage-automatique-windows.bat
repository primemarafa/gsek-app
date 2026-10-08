@echo off
chcp 65001 > nul
cls
echo =============================================================
echo    ⚙️ CONFIGURATION DU DÉMARRAGE AUTOMATIQUE WINDOWS (GSEK)
echo =============================================================
echo.
echo Ce script configure l'ordinateur pour que le serveur GSEK
echo démarre TOUT SEUL dès l'allumage de l'UC, en arrière-plan,
echo sans que personne n'ait besoin d'ouvrir de session ni de cliquer.
echo.

:: Vérifier les droits Administrateur
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ATTENTION] Veuillez exécuter ce script en tant qu'Administrateur !
    echo (Clic droit sur ce fichier -> "Exécuter en tant qu'administrateur")
    echo.
    pause
    exit /b 1
)

cd /d "%~dp0"
set SCRIPT_DIR=%~dp0
set TASK_NAME=GSEK_Serveur_Central

:: Récupération du chemin absolu de node
for /f "delims=" %%i in ('where node') do set NODE_PATH=%%i

if not exist "%NODE_PATH%" (
    echo [ERREUR] Node.js n'a pas été détecté dans le PATH.
    pause
    exit /b 1
)

echo Création de la tâche planifiée de démarrage système...
schtasks /create /tn "%TASK_NAME%" /tr "\"%NODE_PATH%\" \"%SCRIPT_DIR%server\index.js\"" /sc ONSTART /ru "SYSTEM" /rl HIGHEST /f

if %errorlevel% equ 0 (
    echo.
    echo =============================================================
    echo    ✅ CONFIGURATION RÉUSSIE !
    echo =============================================================
    echo La tâche "%TASK_NAME%" est maintenant active.
    echo Désormais, dès que cette machine s'allume :
    echo 1. Le serveur démarre automatiquement en tâche de fond.
    echo 2. Aucun mot de passe de session n'est nécessaire.
    echo 3. Tous les PC et tablettes de l'école peuvent s'y connecter.
    echo =============================================================
) else (
    echo [ERREUR] Impossible de créer la tâche planifiée.
)

echo.
pause
