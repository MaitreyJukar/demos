set DATE=2018-01-05
git fetch origin
git checkout -B "common/%DATE%" "origin/common/%DATE%"
git merge origin/kepler-output/%DATE%
git push
git checkout -B "dev-upload/%DATE%" "origin/dev-upload/%DATE%"
git merge origin/common/%DATE%
git push
git checkout -B "qa-upload/%DATE%" "origin/qa-upload/%DATE%"
git merge "origin/dev-upload/%DATE%"
call npm run prod
git add --all
git commit -m "Update compiled code"
git push
pause