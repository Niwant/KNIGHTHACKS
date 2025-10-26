#!/bin/bash
# Quick test script to check Docker build context
echo "Checking Docker build context..."
docker build --no-cache -t knight-hacks:test -f Dockerfile . 2>&1 | head -50

