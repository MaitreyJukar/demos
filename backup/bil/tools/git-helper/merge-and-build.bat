set BATCH=batch-7
git fetch origin
git checkout -B "qa-upload/%BATCH%" "origin/qa-upload/%BATCH%"
git merge "origin/dev-upload/%BATCH%"
call npm run prod
git add --all
git commit -m "Update compiled code"
git push
pause