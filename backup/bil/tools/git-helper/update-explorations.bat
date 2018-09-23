set BATCH=batch-7
git fetch origin

git checkout -B "dev-upload/%BATCH%" "origin/dev-upload/%BATCH%"
git merge "origin/explorations/%BATCH%"
git commit
git push

git checkout -B "explorations/%BATCH%" "origin/explorations/%BATCH%"
git merge "origin/dev-upload/%BATCH%"
git push
pause