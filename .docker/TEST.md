# Docker Testing Checklist

Use this checklist before deploying to production.

## Pre-Deployment Tests

### 1. Build Image Locally
```bash
./scripts/build-docker.sh
```
- [ ] Image builds successfully
- [ ] No error messages
- [ ] Image size is reasonable (~150-200MB)

### 2. Test Locally
```bash
docker run -p 3000:3000 knight-hacks:latest
```
- [ ] Container starts without errors
- [ ] Application accessible at http://localhost:3000
- [ ] No console errors
- [ ] All features work (artifacts, scene, inspector)

### 3. Test with Docker Compose
```bash
docker-compose up -d
docker-compose logs -f
```
- [ ] Container starts with docker-compose
- [ ] Health check passes
- [ ] Logs show no errors
- [ ] Can access application

### 4. Check Resource Usage
```bash
docker stats knight-hacks
```
- [ ] Memory usage < 2GB
- [ ] CPU usage reasonable
- [ ] No memory leaks

### 5. Test Restart
```bash
docker-compose restart
```
- [ ] Container restarts cleanly
- [ ] Application remains accessible
- [ ] No data loss

### 6. Test Stop/Start
```bash
docker-compose down
docker-compose up -d
```
- [ ] Stops cleanly
- [ ] Starts without errors
- [ ] Data persists (if applicable)

## Production Deployment Checklist

### On Vultr Server

- [ ] Docker installed (`docker --version`)
- [ ] Docker Compose installed (`docker-compose --version`)
- [ ] Port 3000 is open in firewall
- [ ] At least 2GB RAM available
- [ ] Git repository cloned
- [ ] Application builds successfully
- [ ] Application accessible via server IP
- [ ] Logs show no errors
- [ ] Auto-restart configured

### Security Checks

- [ ] Firewall configured
- [ ] Only necessary ports open
- [ ] Running as non-root user
- [ ] No sensitive data in logs
- [ ] HTTPS configured (if using domain)

### Monitoring Setup

- [ ] Basic monitoring enabled
- [ ] Log rotation configured
- [ ] Backup strategy in place
- [ ] Alert system configured

## Common Issues and Solutions

### Issue: "Container exits immediately"
**Solution:** Check logs with `docker-compose logs`

### Issue: "Cannot bind to port 3000"
**Solution:** Check if port is in use: `lsof -i :3000`

### Issue: "Out of memory"
**Solution:** Upgrade Vultr instance or optimize application

### Issue: "Build fails with dependency errors"
**Solution:** Run `npm install` locally first to verify dependencies

### Issue: "Application slow to respond"
**Solution:** Check server resources with `docker stats`

## Post-Deployment Verification

After deployment, verify:
- [ ] Application loads at server IP
- [ ] All pages accessible
- [ ] API routes work
- [ ] Static assets load
- [ ] No console errors
- [ ] Performance is acceptable

## Rollback Plan

If issues occur:
```bash
# Stop current deployment
docker-compose down

# Check git history
git log

# Rollback to previous version
git checkout <previous-commit-hash>

# Rebuild and redeploy
docker-compose up -d --build
```

## Support Contacts

- Docker issues: Check `docker logs`
- Application issues: Check application logs
- Server issues: Check system logs
- Network issues: Check firewall rules

