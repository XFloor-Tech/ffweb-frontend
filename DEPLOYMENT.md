# VPS Deployment Guide - Using System Nginx

This deployment method uses your VPS's system nginx as a reverse proxy to the Docker container. This is recommended when you have multiple sites or need advanced nginx features.

## Architecture

```
Internet → System Nginx (port 80/443) → Docker Container (port 3000)
```

## Quick Deploy

```bash
./deploy-system-nginx.sh root@your-vps-ip your-domain.com
```

Example:
```bash
./deploy-system-nginx.sh root@192.168.1.100 example.com
```

## Manual Setup

### 1. Copy Files to VPS

```bash
rsync -avz \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.git' \
  ./ root@your-vps-ip:/opt/ffweb-frontend/
```

### 2. Build and Start Container

SSH into your VPS:
```bash
ssh root@your-vps-ip
cd /opt/ffweb-frontend
```

Start the container:
```bash
docker-compose -f docker-compose.system-nginx.yml up -d --build
```

### 3. Configure System Nginx

```bash
# Update domain in nginx config
sed 's/your-domain.com/example.com/g' nginx-system.conf > ffweb-frontend.conf

# Copy to nginx sites
cp ffweb-frontend.conf /etc/nginx/sites-available/ffweb-frontend

# Enable the site
ln -s /etc/nginx/sites-available/ffweb-frontend /etc/nginx/sites-enabled/

# Test nginx config
nginx -t

# Reload nginx
systemctl reload nginx
```

### 4. Verify Deployment

```bash
# Check container is running
docker-compose -f docker-compose.system-nginx.yml ps

# Check container logs
docker-compose -f docker-compose.system-nginx.yml logs -f

# Test the app locally
curl http://localhost:3000

# Test through nginx
curl http://localhost/
```

## SSL with Let's Encrypt

### Easy Method (Certbot)

```bash
# Install certbot
apt update
apt install certbot python3-certbot-nginx

# Get certificate and auto-configure nginx
certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
certbot renew --dry-run
```

Certbot will automatically update your nginx configuration with SSL settings.

### Manual SSL Configuration

If you prefer manual configuration or have special requirements:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Same location blocks as HTTP config
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Managing Multiple Sites

Since you're using system nginx, you can easily host multiple sites:

```bash
# Add another site
cp /etc/nginx/sites-available/ffweb-frontend /etc/nginx/sites-available/another-site
# Edit the new file with different domain and port
ln -s /etc/nginx/sites-available/another-site /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## Useful Commands

### Container Management

```bash
# View logs
docker-compose -f docker-compose.system-nginx.yml logs -f

# Restart container
docker-compose -f docker-compose.system-nginx.yml restart

# Stop container
docker-compose -f docker-compose.system-nginx.yml down

# Update and rebuild
git pull
docker-compose -f docker-compose.system-nginx.yml up -d --build
```

### Nginx Management

```bash
# Test nginx configuration
nginx -t

# Reload nginx (graceful, no downtime)
nginx -s reload
# or
systemctl reload nginx

# Restart nginx (brief downtime)
systemctl restart nginx

# Check nginx status
systemctl status nginx

# View nginx error logs
tail -f /var/log/nginx/error.log

# View nginx access logs
tail -f /var/log/nginx/access.log
```

## Troubleshooting

### Container Issues

```bash
# Container won't start
docker-compose -f docker-compose.system-nginx.yml logs

# Port 3000 already in use
netstat -tlnp | grep :3000
# Change port in docker-compose.system-nginx.yml if needed

# Container exits immediately
docker-compose -f docker-compose.system-nginx.yml logs
# Check if port 3000 is exposed and service is running
```

### Nginx Issues

```bash
# Nginx won't start
nginx -t  # Check configuration

# 502 Bad Gateway
# Check if container is running:
docker ps | grep ffweb-frontend
# Check if container port is correct:
docker-compose -f docker-compose.system-nginx.yml ps

# Permission denied
# Check nginx user has access to proxy port
```

### Performance Issues

```bash
# Enable caching in nginx config
# Add to location block:
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=ffweb_cache:10m max_size=1g inactive=60m;
proxy_cache ffweb_cache;
proxy_cache_valid 200 60m;

# Check server resources
htop
df -h
docker stats
```

## Advantages of System Nginx

1. **Shared Resources**: One nginx instance for all sites
2. **Advanced Features**: Easy to add rate limiting, caching, etc.
3. **SSL Management**: Certbot works seamlessly
4. **Monitoring**: Single access log for all traffic
5. **Flexibility**: Easy to add redirects, rewrites, or special routes
6. **Performance**: Nginx handles static assets efficiently

## When to Use Each Approach

### Use System Nginx (This Guide):
- You have multiple sites on the server
- Need SSL with Let's Encrypt
- Want advanced nginx features
- Need to proxy to multiple backends
- Prefer centralized configuration

### Use Docker Nginx (Original Approach):
- Single site deployment
- Want fully containerized setup
- Don't need SSL (or using external proxy)
- Simpler, more isolated setup

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: \${{ secrets.VPS_HOST }}
          username: \${{ secrets.VPS_USER }}
          key: \${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/ffweb-frontend
            git pull
            docker-compose -f docker-compose.system-nginx.yml up -d --build
            # Only reload nginx if config changed
            if git diff HEAD~1 --name-only | grep -q "nginx-system.conf"; then
              systemctl reload nginx
            fi
```

## Firewall Setup

```bash
# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable

# Docker internal communication (localhost) is automatically allowed
```

## Production Checklist

- [ ] SSL/HTTPS configured with certbot
- [ ] Nginx configuration tested and reloaded
- [ ] Container is healthy and responding on port 3000
- [ ] Firewall rules set (80, 443, 22)
- [ ] DNS pointed to VPS IP
- [ ] Log rotation configured
- [ ] Backups in place
- [ ] Monitoring set up
- [ ] Environment variables configured
