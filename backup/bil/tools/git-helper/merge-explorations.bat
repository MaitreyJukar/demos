set BATCH=batch-7
set PREVBATCH=batch-6
git fetch origin
git checkout -B "dev-upload/%BATCH%" "origin/dev-upload/%BATCH%"
git merge "origin/dev-upload/%PREVBATCH%"
git commit
git merge "origin/explorations/%BATCH%"
git commit
git push
git checkout -B "qa-upload/%BATCH%" "origin/qa-upload/%BATCH%"
git merge "origin/dev-upload/%BATCH%"
git push
pause