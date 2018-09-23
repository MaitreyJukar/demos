@echo off
echo Begin precompilation

for /R %%f in (.\*.png) do (
	echo
	echo Compressing image %%~nf.png
	call "../../../common/tool/pngout" /y "%%f" "%%f"
	echo done.
)

echo Compression Complete...
pause
goto :eof

:NO_ARGUMENT
echo Invalid input parameters
pause