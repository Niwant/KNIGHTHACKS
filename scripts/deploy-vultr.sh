#!/bin/bash

# Deployment script for Vultr
# Usage: ./scripts/deploy-vultr.sh [server-ip] [user]

set -e

SERVER_IP="${1:-$VULTR_SERVER_IP}"
USER="${2:-root}"

if [ -z "$SERVER_IP" ]; then
    echo "❌ Please provide server IP address"
    echo "Usage: ./scripts/deploy-vultr.sh [server-ip] [user]"
    echo "   or set VULTR_SERVER_IP environment variable"
    exit 1
fi

echo "🚀 Deploying to Vultr server: $SERVER_IP"
echo ""

# Build locally first
echo "📦 Building Docker image locally..."
docker build -t knight-hacks:latest .

# Save image to tar
echo "💾 Saving Docker image..."
docker save knight-hacks:latest | gzip > knight-hacks.tar.gz

# Copy to server
echo "📤 Copying files to server..."
scp -r knight-hacks.tar.gz docker-compose.yml Dockerfile .dockerignore $USER@$SERVER_IP:/opt/knight-hacks/

# Deploy on server
echo "🔧 Deploying on server..."
ssh $USER@$SERVER_IP << 'ENDSSH'
cd /opt/knight-hacks

# Load image
echo "📥 Loading Docker image..."
gunzip -c knight-hacks.tar.gz | docker load

# Clean up old container
echo "🧹 Cleaning up old containers..."
docker-compose down 2>/dev/null || true

# Start new container
echo "🚀 Starting application..."
docker-compose up -d

# Show logs
echo "📋 Showing recent logs..."
docker-compose logs --tail=50

echo ""
echo "✅ Deployment complete!"
echo "Application should be running at http://YOUR_SERVER_IP:3000"
ENDSSH

# Clean up local tar
rm knight-hacks.tar.gz

echo ""
echo "✅ Deployment complete!"
echo "Access your application at: http://$SERVER_IP:3000"

