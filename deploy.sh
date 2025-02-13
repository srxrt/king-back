#!/bin/bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm use 16.17.0 || {
  echo "Failed to use Node.js version"
  exit 1
}
#PRODUCTION
git reset --hard
git checkout master
pwd
git pull origin master || {
  echo "Git pull failed"
  exit 1
}

npm i
npm run build

if pm2 list | grep -q "KINGKEBAB"; then
  echo "App is already running. Restarting..."
  pm2 reload process.config.js --env production
else
  echo "App is not running. Starting..."
  pm2 start process.config.js --env production
fi

pm2 startup
pm2 save
