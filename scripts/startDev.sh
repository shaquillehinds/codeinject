#!/bin/bash

dir=$PWD

res=$(osascript -e "tell app \"Terminal\"
    do script \"cd $dir && tsc -w\"
    do script \"cd $dir && yarn start:mon\"
end tell")
