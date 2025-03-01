#!/bin/bash

for package in $(./get_packages.py); do
  cd ./packages/$package
  npm version minor --no-git-tag-version --verbose
  cd ../..
done
