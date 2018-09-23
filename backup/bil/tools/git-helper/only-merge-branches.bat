set BATCH=batch-7
git fetch origin
git checkout -B "qa-upload/%BATCH%" "origin/qa-upload/%BATCH%"
git merge "origin/dev-upload/%BATCH%"
git add --all
git commit
git push
pause