#!/bin/bash

read -p "User name to give rights: " user

echo "Set rights to folder: files"
if sudo chown -R $user files; then
    echo " - Ok"
else 
    echo "error!"
    exit 1
fi

echo "Rights configured successfully!"
exit 0