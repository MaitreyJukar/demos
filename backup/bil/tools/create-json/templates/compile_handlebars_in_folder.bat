@echo off
set namespace="JSONCreator.Templates"

echo Begin precompilation

for /R %%f in (.\*.handlebars) do (
	echo Processing template %%~nf.handlebars
	call handlebars "%%f" -n %namespace% -f "%%~dpnf.js"
	echo done.
)

echo Precompilation complete...
pause
goto :eof

pause