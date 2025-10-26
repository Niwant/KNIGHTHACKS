#!/bin/bash

# Build Docker image for Knight Hacks
# Usage: ./scripts/build-docker.sh

set -e

echo "🐳 Building Knight Hacks Docker image..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Build the image
docker build -t knight-hacks:latest .

echo "✅ Docker image built successfully!"
echo ""
echo "To run the image locally:"
echo "  docker run -p 3000:3000 knight-hacks:latest"
echo ""
echo "To tag for registry:"
echo "  docker tag knight-hacks:latest your-registry/knight-hacks:latest"

