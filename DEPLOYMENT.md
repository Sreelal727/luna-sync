# Luna Sync - Deployment Guide (Phase 1 MVP)

This guide covers deploying Luna Sync backend API and mobile app to production.

---

## Prerequisites

- **Backend:**
  - Node.js 18+ production server
  - PostgreSQL 14+ database
  - SSL certificate for HTTPS
  - Domain name

- **Mobile:**
  - Apple Developer Account ($99/year) for iOS
  - Google Play Console Account ($25 one-time) for Android
  - Mac with Xcode for iOS builds

---

## Part 1: Database Setup

### 1. Create Production Database

```bash
# On your PostgreSQL server
createdb lunasync_prod
createuser lunasync_app

# Grant permissions
psql -d lunasync_prod -c "GRANT ALL PRIVILEGES ON DATABASE lunasync_prod TO lunasync_app;"
```

### 2. Run Migrations

```bash
psql lunasync_prod < database/schema.sql

# DO NOT run seeds.sql in production (it's for development only)
```

### 3. Backup Strategy

Set up automated daily backups:
```bash
# Add to crontab
0 2 * * * pg_dump lunasync_prod | gzip > /backups/lunasync_$(date +\%Y\%m\%d).sql.gz
```

---

## Part 2: Backend Deployment

### Option A: Deploy to Heroku

1. **Install Heroku CLI**
```bash
brew install heroku/brew/heroku
heroku login
```

2. **Create Heroku App**
```bash
cd backend
heroku create lunasync-api
```

3. **Add PostgreSQL**
```bash
heroku addons:create heroku-postgresql:mini
```

4. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set JWT_EXPIRES_IN=7d
heroku config:set CORS_ORIGIN=https://yourdomain.com
```

5. **Deploy**
```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

6. **Run Migrations**
```bash
heroku pg:psql < ../database/schema.sql
```

### Option B: Deploy to VPS (DigitalOcean, AWS EC2, etc.)

1. **Server Setup (Ubuntu 22.04)**
```bash
# SSH into server
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install PM2 for process management
sudo npm install -g pm2
```

2. **Clone Repository**
```bash
cd /var/www
git clone https://github.com/yourusername/luna-sync.git
cd luna-sync/backend
npm install --production
```

3. **Environment Variables**
```bash
cp .env.example .env
nano .env

# Set production values:
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://lunasync_app:password@localhost:5432/lunasync_prod
JWT_SECRET=<generate-strong-secret>
CORS_ORIGIN=https://yourdomain.com
```

4. **Start with PM2**
```bash
pm2 start src/server.js --name lunasync-api
pm2 startup
pm2 save
```

5. **Nginx Reverse Proxy**
```bash
sudo apt-get install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/lunasync
```

```nginx
server {
    listen 80;
    server_name api.lunasync.com;

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

```bash
sudo ln -s /etc/nginx/sites-available/lunasync /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. **SSL with Let's Encrypt**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.lunasync.com
```

---

## Part 3: Mobile App Deployment

### iOS Deployment

1. **Prepare for Build**
```bash
cd mobile/ios
pod install
cd ..
```

2. **Update Bundle Identifier**
   - Open `ios/LunaSyncMobile.xcworkspace` in Xcode
   - Change bundle ID to `com.yourcompany.lunasync`

3. **Update API URL**
```javascript
// src/config/api.js
const API_BASE_URL = 'https://api.lunasync.com/api/v1';
```

4. **Build Archive**
   - Xcode → Product → Archive
   - Validate → Distribute to App Store

5. **App Store Connect**
   - Create app listing
   - Upload screenshots (required sizes: 6.5", 5.5")
   - Fill metadata (name, description, keywords)
   - Submit for review

### Android Deployment

1. **Generate Keystore**
```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore lunasync.keystore -alias lunasync -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure Signing**
```gradle
// android/app/build.gradle
android {
    signingConfigs {
        release {
            storeFile file('lunasync.keystore')
            storePassword 'your-store-password'
            keyAlias 'lunasync'
            keyPassword 'your-key-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

3. **Build Release APK/AAB**
```bash
cd android
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

4. **Google Play Console**
   - Create app
   - Upload AAB
   - Fill store listing
   - Set pricing (Free)
   - Submit for review

---

## Part 4: Environment-Specific Configurations

### Production Security Checklist

- [x] Strong JWT secret (min 32 chars)
- [x] HTTPS only (no HTTP)
- [x] CORS restricted to app domain
- [x] Rate limiting enabled
- [x] Database backups configured
- [x] Error logs monitored (Sentry, LogRocket)
- [x] Environment variables secured (not in code)
- [x] SQL injection protection (parameterized queries)
- [x] Password hashing (bcrypt cost >= 10)

### Mobile App Production Checklist

- [x] API URL points to production
- [x] Remove all console.logs
- [x] Enable ProGuard (Android)
- [x] Optimize images and assets
- [x] Test on real devices (iOS + Android)
- [x] Privacy Policy linked in app
- [x] Terms of Service included
- [x] Analytics configured (optional)

---

## Part 5: Monitoring & Maintenance

### Backend Monitoring

**Install Sentry for error tracking:**
```bash
npm install @sentry/node
```

```javascript
// In src/server.js
const Sentry = require('@sentry/node');

Sentry.init({ dsn: process.env.SENTRY_DSN });

// Add before routes
app.use(Sentry.Handlers.requestHandler());

// Add before error handler
app.use(Sentry.Handlers.errorHandler());
```

### Mobile Monitoring

**React Native:**
```bash
npm install @sentry/react-native
```

### Database Maintenance

```bash
# Weekly vacuum
psql lunasync_prod -c "VACUUM ANALYZE;"

# Monitor connections
psql lunasync_prod -c "SELECT count(*) FROM pg_stat_activity;"

# Index usage
psql lunasync_prod -c "SELECT schemaname, tablename, indexname, idx_scan FROM pg_stat_user_indexes;"
```

---

## Part 6: Scaling Considerations

### When to Scale

- **API Response time >500ms:** Add caching (Redis)
- **Database queries slow:** Add indexes, read replicas
- **>10,000 DAU:** Consider load balancer
- **High traffic periods:** Auto-scaling groups

### Caching Strategy (Phase 2)

```bash
# Install Redis
sudo apt-get install redis-server

# Cache predictions, calendar data (5-min TTL)
# Invalidate on period/mood log
```

---

## Part 7: Rollback Procedure

If deployment fails:

**Backend:**
```bash
# Heroku
heroku releases:rollback

# VPS with PM2
pm2 delete lunasync-api
git checkout <previous-commit>
npm install
pm2 start src/server.js --name lunasync-api
```

**Mobile:**
- iOS: Submit new build with previous version
- Android: Rollout percentage control in Play Console

**Database:**
```bash
# Restore from backup
gunzip < /backups/lunasync_20251120.sql.gz | psql lunasync_prod
```

---

## Part 8: Cost Estimates (Monthly)

**Infrastructure:**
- VPS (2GB RAM): $12/month (DigitalOcean)
- PostgreSQL (managed): $15/month
- Domain + SSL: $12/year (~$1/month)
- **Total Backend:** ~$28/month

**Mobile:**
- Apple Developer: $99/year (~$8.25/month)
- Google Play: $25 one-time
- **Total Mobile:** ~$8/month (after initial)

**Total MVP Cost:** ~$36/month

**Free Alternatives (Development):**
- Heroku Free Tier (backend)
- Supabase Free Tier (PostgreSQL)
- TestFlight (iOS beta testing)

---

## Support & Troubleshooting

**Common Issues:**

1. **Database connection fails:** Check `DATABASE_URL` format
2. **CORS errors:** Verify `CORS_ORIGIN` matches app domain
3. **Token expired errors:** Check JWT_SECRET consistency
4. **Mobile app crashes:** Check API URL and network permissions

**Logs:**
```bash
# Backend (PM2)
pm2 logs lunasync-api

# Database
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Nginx
sudo tail -f /var/log/nginx/error.log
```

---

**Deployment Complete! 🚀**

For Phase 2 features (Insights, Partner Mode, Subscriptions), refer to the product roadmap.
