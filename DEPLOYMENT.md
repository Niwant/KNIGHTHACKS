# Deployment Guide for Vultr Cloud

This guide will help you deploy the Knight Hacks application to Vultr using Docker.

## Prerequisites

1. A Vultr account
2. Docker installed on your local machine
3. Basic knowledge of command line

## Method 1: Using Docker Compose (Recommended)

### On Vultr Server:

1. **Connect to your Vultr server via SSH:**
   ```bash
   ssh root@your-server-ip
   ```

2. **Install Docker and Docker Compose:**
   ```bash
   # Update system
   apt update && apt upgrade -y

   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh

   # Install Docker Compose
   apt install docker-compose -y

   # Verify installation
   docker --version
   docker-compose --version
   ```

3. **Clone your repository:**
   ```bash
   cd /opt
   git clone <your-repo-url> knight-hacks
   cd knight-hacks
   ```

4. **Build and start the application:**
   ```bash
   docker-compose up -d --build
   ```

5. **Check if the application is running:**
   ```bash
   docker-compose ps
   docker-compose logs -f knight-hacks
   ```

6. **Access your application:**
   - Open `http://your-server-ip:3000` in your browser
   - Make sure port 3000 is open in Vultr firewall settings

## Method 2: Using Dockerfile Directly

### Build the image locally and push:

1. **Build the Docker image:**
   ```bash
   docker build -t knight-hacks:latest .
   ```

2. **Tag for your Docker registry (optional):**
   ```bash
   docker tag knight-hacks:latest your-registry/knight-hacks:latest
   ```

3. **Push to registry (if using):**
   ```bash
   docker push your-registry/knight-hacks:latest
   ```

### On Vultr Server:

1. **Install Docker** (if not already installed):
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

2. **Pull or copy your image:**
   - If using registry: `docker pull your-registry/knight-hacks:latest`
   - Or copy your Dockerfile and build on server

3. **Run the container:**
   ```bash
   docker run -d \
     --name knight-hacks \
     -p 3000:3000 \
     --restart unless-stopped \
     knight-hacks:latest
   ```

4. **Check status:**
   ```bash
   docker ps
   docker logs knight-hacks
   ```

## Configuration

### Environment Variables

Create a `.env.production` file if needed:
```bash
# Example environment variables
NEXT_PUBLIC_API_URL=https://api.example.com
```

### Firewall Setup

Ensure port 3000 is open:
```bash
# UFW (Ubuntu)
ufw allow 3000/tcp
ufw reload

# Or use Vultr's firewall in the dashboard
```

### Using Nginx Reverse Proxy (Docker)

The application now includes an nginx reverse proxy in Docker Compose. This is the recommended setup:

```bash
# Start both services (nginx + Next.js)
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f nginx
docker-compose logs -f knight-hacks
```

**Access:**
- With nginx: `http://YOUR_SERVER_IP` (port 80)
- Direct to Next.js: `http://YOUR_SERVER_IP:3000` (if you expose it)

The nginx configuration includes:
- Reverse proxy to Next.js app
- Gzip compression
- Static file caching
- Security headers
- Health check endpoint at `/health`

### Alternative: Using System Nginx

If you prefer to use system nginx instead of Docker:

Install Nginx:
```bash
apt install nginx
```

Create config file `/etc/nginx/sites-available/knight-hacks`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
ln -s /etc/nginx/sites-available/knight-hacks /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## Useful Commands

### View logs:
```bash
docker-compose logs -f
# or
docker logs -f knight-hacks
```

### Stop the application:
```bash
docker-compose down
# or
docker stop knight-hacks
```

### Restart the application:
```bash
docker-compose restart
# or
docker restart knight-hacks
```

### Update the application:
```bash
cd /opt/knight-hacks
git pull
docker-compose up -d --build
```

### View resource usage:
```bash
docker stats knight-hacks
```

## Troubleshooting

### Application won't start
- Check logs: `docker-compose logs -f`
- Verify port 3000 is not in use: `netstat -tulpn | grep 3000`

### Out of memory issues
- Vultr recommends minimum 2GB RAM for Next.js applications
- Consider upgrading your Vultr instance

### Build fails
- Ensure Node.js 20 is being used (check Dockerfile)
- Check for dependency issues in package.json

## Security Recommendations

1. Use HTTPS with Let's Encrypt
2. Set up firewall rules
3. Keep Docker and system updated
4. Use environment variables for sensitive data
5. Enable automatic security updates

## Monitoring

Consider setting up:
- Uptime monitoring
- Log aggregation
- Resource monitoring
- Automated backups

## Support

For issues, check:
- Application logs: `docker-compose logs`
- Docker logs: `docker logs knight-hacks`
- System logs: `journalctl -u docker`

