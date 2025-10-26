# Docker Setup Summary

This document summarizes the Docker deployment setup for Knight Hacks application.

## Files Created

### Core Docker Files
- **Dockerfile** - Multi-stage build for optimized Next.js production image
- **.dockerignore** - Excludes unnecessary files from Docker builds
- **docker-compose.yml** - Simplifies deployment with Docker Compose

### Deployment Files
- **DEPLOYMENT.md** - Comprehensive deployment guide
- **QUICK_DEPLOY.md** - Quick start guide for fast deployment
- **scripts/build-docker.sh** - Local Docker image build script
- **scripts/deploy-vultr.sh** - Automated deployment to Vultr

### Updated Files
- **next.config.ts** - Added standalone output mode for Docker optimization
- **README.md** - Added Docker deployment section

## Quick Start

### Local Testing
```bash
# Build the image
./scripts/build-docker.sh

# Run locally
docker run -p 3000:3000 knight-hacks:latest
```

### Deploy to Vultr
```bash
# Using Docker Compose (recommended)
# On server:
docker-compose up -d --build

# Or use automated script (from local machine)
./scripts/deploy-vultr.sh YOUR_SERVER_IP
```

## Docker Image Details

### Base Image
- Node.js 20 Alpine (lightweight Linux distribution)
- Size: ~150-200MB final image

### Build Stages
1. **deps** - Install dependencies
2. **builder** - Build Next.js application
3. **runner** - Production runtime

### Features
- Optimized for production
- Multi-stage build for smaller image size
- Standalone Next.js output
- Automatic restart on failure
- Health checks included

## Port Configuration

Default port: 3000

To change port, edit `docker-compose.yml`:
```yaml
ports:
  - "YOUR_PORT:3000"
```

## Resource Requirements

Minimum:
- CPU: 1 core
- RAM: 2GB
- Disk: 10GB

Recommended:
- CPU: 2 cores
- RAM: 4GB
- Disk: 20GB

## Security Notes

1. The container runs as non-root user (nextjs:1001)
2. Only necessary files are included in the image
3. Telemetry is disabled
4. Production mode is enforced

## Monitoring

View logs:
```bash
docker-compose logs -f
```

Check status:
```bash
docker-compose ps
```

Resource usage:
```bash
docker stats knight-hacks
```

## Updating

To update the application:
```bash
cd /opt/knight-hacks
git pull
docker-compose down
docker-compose up -d --build
```

## Backup

To backup the application:
```bash
docker save knight-hacks:latest | gzip > knight-hacks-backup.tar.gz
```

To restore:
```bash
gunzip -c knight-hacks-backup.tar.gz | docker load
```

## Troubleshooting

### Build fails
- Check Docker version (19.03+ required)
- Ensure sufficient disk space
- Clear Docker cache: `docker system prune -a`

### Container won't start
- Check logs: `docker-compose logs`
- Verify port 3000 is available
- Check disk space: `df -h`

### Performance issues
- Increase server resources
- Check for memory leaks in application
- Monitor with `docker stats`

## CI/CD Integration

For automated deployments:

1. Use GitHub Actions with Docker build
2. Push to Docker Hub or private registry
3. Pull and deploy on Vultr server
4. Set up webhook for automatic updates

Example GitHub Actions workflow:
```yaml
name: Deploy to Vultr

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy
        run: |
          ssh ${{ secrets.VULTR_USER }}@${{ secrets.VULTR_SERVER }} 'cd /opt/knight-hacks && git pull && docker-compose up -d --build'
```

## Support

For issues or questions:
1. Check application logs
2. Review Docker logs
3. Verify server resources
4. Check firewall rules

## Next Steps

1. Set up custom domain with reverse proxy (Nginx)
2. Configure SSL with Let's Encrypt
3. Set up automated backups
4. Configure monitoring and alerts
5. Set up CI/CD pipeline

