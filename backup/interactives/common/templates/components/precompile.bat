@echo off
IF [%1]==[] GOTO NO_ARGUMENT

IF [%2]==[] GOTO NO_ARGUMENT

set folderName=%1
set namespace=%2

echo Begin precompilation

for /R %folderName% %%f in (.\*.handlebars) do (
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