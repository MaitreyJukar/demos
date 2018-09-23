@echo off

echo Begin common minification

cd ..\..\..\config
grunt build-MathInt-common & pause
goto :eof