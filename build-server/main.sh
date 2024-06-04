#!/bin/bash

export GIT_REPO_URL="https://github.com/piyushgarg-dev/piyush-vite-app"
git clone "$GIT_REPO_URL" /home/akash/devops/vercel-clone/build-server/output
# git clone "$GIT_REPO_URL" ~/home/app/output

exec node script.js
