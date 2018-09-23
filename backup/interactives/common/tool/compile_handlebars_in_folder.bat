@echo off
set /p module="Enter Module Name: " %=%

IF [%module%]==[] GOTO NO_ARGUMENT

set namespace="MathInteractives.Interactivities.%module%.templates"

echo Begin precompilation

for /R %%f in (.\*.handlebars) do (
	echo
	echo Processing template %%~nf.handlebars
	call handlebars "%%f" -n %namespace% -f "%%~dpnf.js"
	echo done.
)

echo Precompilation complete...
pause
goto :eof

:NO_ARGUMENT
echo Invalid input parameters
pause