#!/bin/bash

keys=("app" "net" "signer" "content" "dvm" "feeds" "lib" "util" "store")

pattern=$(IFS=\|; echo "${keys[*]}")

find . -type f -exec sed -i -E \
"s/@($pattern)\/([^\"' ]+)/..\/..\/src\/\1\/\2/g" {} \;
