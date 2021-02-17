#!/usr/bin/env sh

set -e

npm run docs:build

cd docs/.vitepress/dist

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:Raiondesu/vuse-rx.git master:gh-pages

cd -
