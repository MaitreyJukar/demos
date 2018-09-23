:START_LINE
@echo off

IF "%1"=="" (
	set /p module="Enter Folder Name: " %=%
) ELSE (
	set module="%1"
	echo Running from WatchDog2 ....... 
	echo Minifying folder %1
)
IF [%module%]==[] GOTO NO_ARGUMENT

echo Begin minification

cd ..\..\..\config
grunt build-MathInt:%module% & pause
goto :eof

:NO_ARGUMENT
echo Invalid input parameters
goto :START_LINE