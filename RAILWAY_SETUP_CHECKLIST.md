# Railway Deployment Checklist

## ✅ Step-by-Step Setup

### 1. Check Your Railway Dashboard
Go to: https://railway.app/dashboard

You should see `luna-sync` project created.

### 2. Add PostgreSQL Database
1. In your Railway project, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Click **"Add PostgreSQL"**
3. Railway will automatically create the database and inject `DATABASE_URL`

### 3. Configure Backend Service
1. Click on your **backend service** (should be auto-detected)
2. Go to **"Settings"** tab
3. Set **Root Directory** to: `backend`
4. Set **Start Command** to: `npm start`
5. Set **Build Command** to: `npm install`

### 4. Add Environment Variables
1. Click on your **backend service**
2. Go to **"Variables"** tab
3. Click **"New Variable"** and add these:

```
NODE_ENV=production
JWT_SECRET=super-secret-key-change-this-to-random-32-chars-minimum
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Note:** Railway automatically provides `DATABASE_URL` from PostgreSQL service.

### 5. Run Database Migration
**Option A: Using Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
cd /Users/inadmin/SynCher/luna-sync
railway link

# Run migration
railway run psql $DATABASE_URL < database/schema.sql
```

**Option B: Using Railway Dashboard**
1. Click on your **PostgreSQL** service
2. Click **"Data"** tab
3. Click **"Query"**
4. Copy entire contents of `database/schema.sql`
5. Paste and click **"Execute"**

### 6. Generate Public URL
1. Click on your **backend service**
2. Go to **"Settings"** tab
3. Scroll to **"Networking"**
4. Click **"Generate Domain"**
5. Copy the URL (e.g., `https://luna-sync-production.up.railway.app`)

### 7. Redeploy (if needed)
1. Click **"Deployments"** tab
2. Click **"Deploy"** button (or just push to GitHub)

### 8. Check Logs
1. Click **"Deployments"** tab
2. Click on latest deployment
3. View logs to ensure:
   - ✅ "Database connected successfully"
   - ✅ "Luna Sync API running on port 3000"

### 9. Test Your API
```bash
# Replace with your Railway URL
curl https://your-app.up.railway.app/health

# Expected response:
# {"status":"ok","timestamp":"2025-11-20T...","uptime":123.456}
```

### 10. Update Mobile App
Once deployed, update mobile app:

```javascript
// mobile/src/config/api.js
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api/v1'
  : 'https://your-railway-url.up.railway.app/api/v1';
```

## 🐛 Troubleshooting

**Build Failed?**
- Check Root Directory is set to `backend`
- Check logs for npm install errors

**Database Connection Failed?**
- Ensure PostgreSQL service is running
- Verify `DATABASE_URL` is available in Variables

**Port Error?**
- Railway provides `PORT` env var automatically
- Our code uses `process.env.PORT || 3000` ✅

**CORS Error?**
- Set `CORS_ORIGIN=*` in environment variables
- Or set specific domain if you have one

## 🎉 Success Indicators

✅ Build completes without errors
✅ Logs show "Database connected successfully"
✅ Logs show "Luna Sync API running on port..."
✅ Health endpoint returns 200 OK
✅ Can register a new user via API

---

**Your Railway URL:** ___________________ (fill this in after generating domain)

**Next Step:** Test all API endpoints and update mobile app!
