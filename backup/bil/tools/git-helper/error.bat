@echo off
git pull
IF ERRORLEVEL 1 (
    GOTO EXIT_ERROR
) ELSE (
    GOTO EXIT_SUCCESS
)

REM ----- Error -----
:EXIT_ERROR
echo "CUSTOM FAILED"
pause
EXIT /B 1

REM ----- Error -----
:EXIT_SUCCESS
echo "CUSTOM SUCCESS"
pause
EXIT /B 0