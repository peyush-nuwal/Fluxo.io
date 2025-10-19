# 🚀 Deployment Guide

Complete guide for deploying the Auth Service to production, including environment setup, configuration, and monitoring.

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Environment Setup](#-environment-setup)
- [Database Setup](#-database-setup)
- [Email Configuration](#-email-configuration)
- [Deployment Options](#-deployment-options)
- [Production Configuration](#-production-configuration)
- [Monitoring & Logging](#-monitoring--logging)
- [Troubleshooting](#-troubleshooting)

## 🔧 Prerequisites

### System Requirements

- **Node.js**: 18.x or higher
- **PostgreSQL**: 14.x or higher
- **Memory**: Minimum 512MB RAM
- **Storage**: Minimum 1GB disk space
- **Network**: HTTPS support required

### Required Services

- **Database**: PostgreSQL instance
- **Email Service**: SMTP provider (Gmail, SendGrid, etc.)
- **Domain**: SSL certificate for HTTPS
- **Monitoring**: Logging and monitoring service

## 🌍 Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd fluxo.io/apps/auth-service
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 3. Environment Variables

Create `.env` file with production values:

```env
# ========================================
# Application Configuration
# ========================================
NODE_ENV=production
PORT=3001
LOG_LEVEL=warn

# ========================================
# Database Configuration
# ========================================
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# ========================================
# JWT Configuration
# ========================================
JWT_SECRET=your-super-secure-256-bit-jwt-secret-key

# ========================================
# Email Configuration
# ========================================
EMAIL_SERVICE=gmail
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM_NAME=Fluxo.io

# ========================================
# Security Configuration
# ========================================
CORS_ORIGIN=https://yourdomain.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
```

### 4. Generate JWT Secret

```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🗄️ Database Setup

### 1. PostgreSQL Installation

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**CentOS/RHEL:**

```bash
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
```

**macOS:**

```bash
brew install postgresql
brew services start postgresql
```

**Docker:**

```bash
docker run --name postgres-auth \
  -e POSTGRES_DB=fluxo_auth \
  -e POSTGRES_USER=fluxo_user \
  -e POSTGRES_PASSWORD=secure_password \
  -p 5432:5432 \
  -d postgres:14
```

### 2. Database Configuration

**Create Database:**

```sql
-- Connect to PostgreSQL
sudo -u postgres psql

-- Create database and user
CREATE DATABASE fluxo_auth;
CREATE USER fluxo_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE fluxo_auth TO fluxo_user;
\q
```

**SSL Configuration:**

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/14/main/postgresql.conf

# Add SSL configuration
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
```

### 3. Run Migrations

```bash
# Run database migrations
pnpm db:migrate

# Verify tables created
pnpm db:studio
```

## 📧 Email Configuration

### 1. Gmail Setup (Recommended)

**Create App Password:**

1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate App Password for "Mail"
4. Use app password in `EMAIL_PASSWORD`

**Configuration:**

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
EMAIL_FROM_NAME=Fluxo.io
```

### 2. SendGrid Setup

**Configuration:**

```env
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM_NAME=Fluxo.io
```

### 3. Test Email Configuration

```bash
# Test email setup
curl -X GET http://localhost:3001/api/v1/auth/otp/test-email
```

## 🚀 Deployment Options

### Option 1: Docker Deployment

**1. Create Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start application
CMD ["pnpm", "start"]
```

**2. Create docker-compose.yml:**

```yaml
version: "3.8"

services:
  auth-service:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://fluxo_user:secure_password@postgres:5432/fluxo_auth
      - JWT_SECRET=your-jwt-secret
      - EMAIL_USER=your-email@gmail.com
      - EMAIL_PASSWORD=your-app-password
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:14
    environment:
      - POSTGRES_DB=fluxo_auth
      - POSTGRES_USER=fluxo_user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

**3. Deploy:**

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f auth-service
```

### Option 2: PM2 Deployment

**1. Install PM2:**

```bash
npm install -g pm2
```

**2. Create ecosystem.config.js:**

```javascript
module.exports = {
  apps: [
    {
      name: "auth-service",
      script: "src/server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
    },
  ],
};
```

**3. Deploy:**

```bash
# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

### Option 3: Systemd Service

**1. Create service file:**

```bash
sudo nano /etc/systemd/system/auth-service.service
```

**2. Service configuration:**

```ini
[Unit]
Description=Fluxo Auth Service
After=network.target

[Service]
Type=simple
User=fluxo
WorkingDirectory=/opt/fluxo/auth-service
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=DATABASE_URL=postgresql://user:pass@localhost:5432/fluxo_auth
Environment=JWT_SECRET=your-jwt-secret

[Install]
WantedBy=multi-user.target
```

**3. Enable and start:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable auth-service
sudo systemctl start auth-service
sudo systemctl status auth-service
```

## ⚙️ Production Configuration

### 1. Nginx Reverse Proxy

**Nginx configuration:**

```nginx
server {
    listen 80;
    server_name auth.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name auth.yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    location / {
        proxy_pass http://localhost:3001;
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
```

### 2. SSL Certificate

**Let's Encrypt (Certbot):**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d auth.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Firewalld (CentOS)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 📊 Monitoring & Logging

### 1. Log Management

**Log Rotation:**

```bash
# Install logrotate
sudo apt install logrotate

# Create logrotate config
sudo nano /etc/logrotate.d/auth-service
```

**Logrotate configuration:**

```
/opt/fluxo/auth-service/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 fluxo fluxo
    postrotate
        systemctl reload auth-service
    endscript
}
```

### 2. Health Monitoring

**Health Check Endpoint:**

```bash
# Test health endpoint
curl -f http://localhost:3001/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

**Monitoring Script:**

```bash
#!/bin/bash
# health-check.sh

HEALTH_URL="http://localhost:3001/health"
LOG_FILE="/var/log/auth-service-health.log"

if curl -f -s $HEALTH_URL > /dev/null; then
    echo "$(date): Health check passed" >> $LOG_FILE
else
    echo "$(date): Health check failed" >> $LOG_FILE
    # Restart service
    systemctl restart auth-service
fi
```

### 3. Performance Monitoring

**Key Metrics to Monitor:**

- Response time
- Error rate
- Memory usage
- CPU usage
- Database connections
- Email delivery rate
- OTP verification rate

**Monitoring Tools:**

- **Prometheus + Grafana**: Metrics and dashboards
- **ELK Stack**: Log aggregation and analysis
- **New Relic**: Application performance monitoring
- **DataDog**: Infrastructure monitoring

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Issues

**Symptoms:**

- Service fails to start
- Database connection errors in logs

**Solutions:**

```bash
# Check database status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U fluxo_user -d fluxo_auth

# Check connection string
echo $DATABASE_URL
```

#### 2. Email Delivery Issues

**Symptoms:**

- OTP emails not received
- Email service errors

**Solutions:**

```bash
# Test email configuration
curl -X GET http://localhost:3001/api/v1/auth/otp/test-email

# Check email logs
tail -f logs/combined.log | grep email

# Verify email credentials
# Check Gmail app password or SendGrid API key
```

#### 3. JWT Token Issues

**Symptoms:**

- Authentication failures
- Token validation errors

**Solutions:**

```bash
# Check JWT secret
echo $JWT_SECRET

# Verify token format
# Use jwt.io to decode tokens

# Check token expiration
# Tokens expire after 1 day
```

#### 4. High Memory Usage

**Symptoms:**

- Service becomes slow
- Out of memory errors

**Solutions:**

```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Restart service
systemctl restart auth-service

# Check for memory leaks
# Review application logs
```

### Log Analysis

**Important Log Patterns:**

```bash
# Authentication errors
grep "Sign in failed" logs/combined.log

# OTP issues
grep "OTP" logs/combined.log

# Database errors
grep "database" logs/error.log

# Email errors
grep "email" logs/error.log
```

### Performance Optimization

**Database Optimization:**

```sql
-- Add indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_otps_user_purpose ON otps(user_id, purpose);
CREATE INDEX idx_otps_expires_at ON otps(expires_at);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@example.com';
```

**Application Optimization:**

```javascript
// Connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Caching
const redis = require("redis");
const client = redis.createClient(process.env.REDIS_URL);
```

## 🔄 Backup & Recovery

### Database Backup

**Automated Backup Script:**

```bash
#!/bin/bash
# backup-db.sh

BACKUP_DIR="/opt/backups/auth-service"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="fluxo_auth_$DATE.sql"

mkdir -p $BACKUP_DIR

pg_dump $DATABASE_URL > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Remove old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

**Cron Job:**

```bash
# Add to crontab
0 2 * * * /opt/scripts/backup-db.sh
```

### Application Backup

**Backup Script:**

```bash
#!/bin/bash
# backup-app.sh

APP_DIR="/opt/fluxo/auth-service"
BACKUP_DIR="/opt/backups/app"
DATE=$(date +%Y%m%d_%H%M%S)

tar -czf $BACKUP_DIR/auth-service_$DATE.tar.gz \
  --exclude=node_modules \
  --exclude=logs \
  --exclude=.git \
  $APP_DIR
```

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Database setup and migrations run
- [ ] Email service configured and tested
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Monitoring setup
- [ ] Backup procedures in place

### Post-Deployment

- [ ] Health check passes
- [ ] All endpoints responding
- [ ] Email delivery working
- [ ] Database connections stable
- [ ] Logs being generated
- [ ] Monitoring alerts configured
- [ ] Performance metrics normal

### Security Checklist

- [ ] Strong JWT secret configured
- [ ] Database SSL enabled
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] Input validation working
- [ ] Error handling secure

---

This deployment guide provides comprehensive instructions for deploying the Auth Service to production. Regular maintenance and monitoring are essential for a stable and secure authentication service.
