#!/bin/bash

#PRODUCTION
git reset --hard
git checkout master
git pull origin master

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
