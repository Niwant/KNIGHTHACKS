# Nginx Reverse Proxy Setup

This project includes a Docker-based nginx reverse proxy setup for production deployment.

## Architecture

```
Internet → Nginx (port 80) → Next.js App (port 3000)
```

## Quick Start

### Deploy with Nginx

```bash
# Start both services
docker-compose up -d

# Check if both are running
docker-compose ps

# View logs
docker-compose logs -f nginx
docker-compose logs -f knight-hacks
```

### Access the Application

- **Via nginx**: `http://YOUR_SERVER_IP` (port 80 - default)
- **Direct**: `http://YOUR_SERVER_IP:3000` (if you need direct access)

## Features

The nginx configuration includes:

✅ **Reverse Proxy** - Routes all requests to Next.js app
✅ **Gzip Compression** - Reduces bandwidth usage
✅ **Static File Caching** - Caches `/_next/static` files
✅ **Security Headers** - XSS protection, frame options, content type nosniff
✅ **Health Check Endpoint** - `/health` endpoint for monitoring
✅ **Large File Support** - Allows uploads up to 50MB
✅ **WebSocket Support** - Proper headers for WebSocket connections

## Configuration Files

### `nginx.conf`
Complete nginx configuration with all features enabled.

### `Dockerfile.nginx`
Dockerfile for building the nginx container.

### `docker-compose.yml`
Orchestrates both nginx and Next.js containers.

## Default Configuration

The nginx container listens on port 80 and proxies to the `knight-hacks` service on port 3000.

## Customization

### Change Port

Edit `docker-compose.yml`:
```yaml
nginx:
  ports:
    - "8080:80"  # Change to port 8080
```

### Add SSL/HTTPS

1. Create SSL certificates
2. Update `nginx.conf` to include SSL configuration
3. Update port mapping to 443

### Custom Domain

Update the `server_name` in `nginx.conf`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    # ...
}
```

## Health Check

Test the nginx health endpoint:
```bash
curl http://YOUR_SERVER_IP/health
# Should return: healthy
```

## Troubleshooting

### Check Nginx Logs
```bash
docker-compose logs nginx
```

### Check Next.js Logs
```bash
docker-compose logs knight-hacks
```

### Test Nginx Configuration
```bash
docker-compose exec nginx nginx -t
```

### Restart Services
```bash
# Restart both
docker-compose restart

# Restart only nginx
docker-compose restart nginx

# Restart only app
docker-compose restart knight-hacks
```

### View Container Status
```bash
docker-compose ps
```

### Rebuild After Changes
```bash
# Rebuild nginx
docker-compose up -d --build nginx

# Rebuild everything
docker-compose up -d --build
```

## Performance

### Static File Caching
Static Next.js files are cached for 60 minutes:
```nginx
location /_next/static/ {
    proxy_cache_valid 200 60m;
    add_header Cache-Control "public, immutable";
}
```

### Gzip Compression
All text-based content is compressed:
- HTML, CSS, JavaScript
- JSON, XML
- Fonts, SVG

## Security

Security headers in place:
- `X-Frame-Options: SAMEORIGIN` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - XSS protection

## Monitoring

### Check Container Health
```bash
docker-compose ps
# Look for "(healthy)" status
```

### Watch Live Logs
```bash
docker-compose logs -f
```

### Resource Usage
```bash
docker stats
```

## Deployment Workflow

1. **Build and push changes to Git**
2. **SSH into server**
3. **Pull latest code**: `git pull`
4. **Rebuild and restart**: `docker-compose up -d --build`
5. **Check logs**: `docker-compose logs -f`

## Scaling

To run multiple instances:

```yaml
nginx:
  scale: 1  # Keep nginx at 1

knight-hacks:
  scale: 3  # Run 3 instances
```

Then update nginx.conf to use upstream load balancing:
```nginx
upstream nextjs {
    server knight-hacks_1:3000;
    server knight-hacks_2:3000;
    server knight-hacks_3:3000;
}
```

## Backup

Backup nginx configuration:
```bash
docker-compose exec nginx cat /etc/nginx/nginx.conf > nginx.conf.backup
```

## Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

