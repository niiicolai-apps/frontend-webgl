#!/bin/bash

# Define the source directory and file
SOURCE_DIR="src"
SOURCE_FILE="index.js"

# Check if 7zip is installed
if ! command -v 7z &> /dev/null
then
    echo "7zip could not be found"
    exit
fi

# Delete the existing zip file if it exists
if [ -f "./$SOURCE_FILE.zip" ]; then
    rm "./$SOURCE_FILE.zip"
fi

# Create a temporary directory for processing
TMP_DIR=$(mktemp -d)

# Copy the source file to the temporary directory
cp "./$SOURCE_FILE" "$TMP_DIR"
cp -r "./$SOURCE_DIR" "$TMP_DIR"

# Create a zip archive that includes the source file and the temporary imports file
7z a -tzip "./$SOURCE_FILE.zip" "$TMP_DIR/$SOURCE_FILE" -r "$TMP_DIR/$SOURCE_DIR"

# Clean up the temporary directory
rm -r "$TMP_DIR"
