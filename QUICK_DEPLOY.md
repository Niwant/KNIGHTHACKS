# Quick Deploy to Vultr

## Prerequisites

1. Vultr server running Ubuntu (or similar Linux)
2. SSH access to your server
3. Docker installed on your server

## Fast Track (5 minutes)

### Step 1: Setup Server

SSH into your Vultr server and run:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Verify
docker --version
```

### Step 2: Setup Directory

On your Vultr server:

```bash
mkdir -p /opt/knight-hacks
cd /opt/knight-hacks
```

If you have the repo on GitHub, clone it:
```bash
git clone <your-github-repo-url> .
```

Or if you're deploying via the local script, you can skip this.

### Step 3: Copy Files and Deploy

**If using GitHub repository:**
```bash
# Make sure you have the latest .dockerignore
cd /opt/knight-hacks
git pull

# Build and start
docker-compose up -d --build
```

**If deploying from local machine:**
Use the deployment script from your local machine:
```bash
./scripts/deploy-vultr.sh YOUR_SERVER_IP
```

### Step 4: Access

Open `http://YOUR_SERVER_IP:3000` in your browser.

Make sure port 3000 is open in Vultr firewall!

## Alternative: Deploy from Local Machine

If you have the code locally:

```bash
# 1. Build Docker image locally
./scripts/build-docker.sh

# 2. Save and deploy
./scripts/deploy-vultr.sh YOUR_SERVER_IP

# You'll be prompted for SSH password
```

## Common Issues

### Build Error: "/package.json: not found"
If you see this error, it means `.dockerignore` or other files are excluding necessary files. Fix it with:

```bash
cd /opt/knight-hacks

# Pull latest code
git pull

# Or re-clone if needed
cd /opt
rm -rf knight-hacks
git clone <your-github-repo-url> knight-hacks
cd knight-hacks

# Try building again
docker-compose up -d --build
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
```

### Docker Build Fails
```bash
# Clean Docker cache
docker system prune -a
# Try again
docker-compose up -d --build
```

### Can't Access Application
1. Check Vultr firewall allows port 3000
2. Check server firewall: `ufw status`
3. Check if app is running: `docker-compose ps`

## Update Application

```bash
cd /opt/knight-hacks
git pull
docker-compose down
docker-compose up -d --build
```

## Monitoring

```bash
# View resource usage
docker stats knight-hacks

# View logs in real-time
docker-compose logs -f

# Check if app is responding
curl http://localhost:3000
```

## Support

- Check logs: `docker-compose logs`
- Restart app: `docker-compose restart`
- Full restart: `docker-compose down && docker-compose up -d`

