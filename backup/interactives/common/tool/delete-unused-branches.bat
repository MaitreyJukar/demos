@echo off

echo Start deletion

cd ..
call git remote prune origin

echo Deletion complete...
pause
goto :eof

