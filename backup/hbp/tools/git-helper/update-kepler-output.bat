set DATE=2018-01-05
git fetch origin
git checkout -B "kepler-output/%DATE%" "origin/kepler-output/%DATE%"
git merge origin/common/%DATE%
git push
pause