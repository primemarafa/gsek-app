@echo off
chcp 65001 > nul
cls
echo =============================================================
echo    💾 SAUVEGARDE DE LA BASE DE DONNÉES GSEK
echo =============================================================
echo.

cd /d "%~dp0"

set DB_SOURCE=server\data\gsek.sqlite
set BACKUP_DIR=server\backups

if not exist "%DB_SOURCE%" (
    echo [ERREUR] Le fichier de base de données "%DB_SOURCE%" n'a pas été trouvé.
    pause
    exit /b 1
)

if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
)

:: Récupération de la date et de l'heure pour nommer l'archive
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set YYYY=%datetime:~0,4%
set MM=%datetime:~4,2%
set DD=%datetime:~6,2%
set HH=%datetime:~8,2%
set MIN=%datetime:~10,2%

set BACKUP_FILE=%BACKUP_DIR%\gsek_sauvegarde_%YYYY%-%MM%-%DD%_%HH%h%MIN%.sqlite

copy /y "%DB_SOURCE%" "%BACKUP_FILE%" > nul

if %errorlevel% equ 0 (
    echo [SUCCÈS] Sauvegarde créée avec succès :
    echo Chemin : %BACKUP_FILE%
    echo.
    echo Astuce : Vous pouvez copier ce fichier sur une clé USB externe pour sécurité maximale.
) else (
    echo [ERREUR] Échec de la copie de sauvegarde.
)

echo.
pause
