:START_LINE
@echo off
IF [%1]==[] (
set /p module="Enter Folder Name: " %=%
GOTO BEGIN_MINIFICATION
)

set module=%1

:BEGIN_MINIFICATION
IF [%module%]==[] GOTO NO_ARGUMENT
echo Begin minification

cd ..\..\..\config
grunt minify_loc_acc:%module%
goto :eof

:NO_ARGUMENT
echo Invalid input parameters
goto :START_LINE