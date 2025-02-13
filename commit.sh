#!/bin/bash

git checkout develop
# Stage all changes
git add .

# Prompt the user for the commit message
echo "Enter commit message: "
read COMMIT_MESSAGE

# Commit the changes with the provided message
git commit -m "$COMMIT_MESSAGE"
git push origin develop

git checkout master
git merge develop
git push origin master

git checkout develop
echo "Changes have been committed with message: '$COMMIT_MESSAGE'"
