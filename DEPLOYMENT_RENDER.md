# Deploy Luna Sync to Render (Free Tier)

Render offers a generous free tier perfect for Luna Sync backend + PostgreSQL.

---

## 🚀 Quick Deploy (10 Minutes)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (free)

### Step 2: Create PostgreSQL Database
1. Click **"New +"** → **"PostgreSQL"**
2. Fill in:
   - **Name:** `lunasync-db`
   - **Database:** `lunasync_prod`
   - **User:** `lunasync`
   - **Region:** Choose closest to you
   - **Plan:** Free
3. Click **"Create Database"**
4. **Copy the Internal Database URL** (starts with `postgresql://`)

### Step 3: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repo: `Sreelal727/luna-sync`
3. Fill in:
   - **Name:** `lunasync-api`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

### Step 4: Add Environment Variables
In the web service settings, add:

```bash
NODE_ENV=production
DATABASE_URL=<paste-internal-database-url-from-step-2>
JWT_SECRET=your-super-secret-key-min-32-chars-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

**Get DATABASE_URL:**
- Go to your PostgreSQL database → **"Connect"** tab
- Copy **"Internal Database URL"**

### Step 5: Run Database Migration
1. Go to your PostgreSQL database in Render
2. Click **"Connect"** → **"External Connection"**
3. Use a PostgreSQL client or:

```bash
# Install psql locally (if not installed)
brew install postgresql

# Connect to Render database (get connection string from Render)
psql <external-connection-string>

# Then paste the contents of database/schema.sql
```

**OR** use Render Shell:
1. Go to your **web service**
2. Click **"Shell"** tab
3. Run:
```bash
cd ..
psql $DATABASE_URL < database/schema.sql
```

### Step 6: Deploy!
1. Click **"Create Web Service"**
2. Render will build and deploy automatically
3. Your API will be live at: `https://lunasync-api.onrender.com`

---

## 📱 Update Mobile App

```javascript
// mobile/src/config/api.js
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api/v1'
  : 'https://lunasync-api.onrender.com/api/v1';  // <-- Your Render URL
```

---

## 💰 Pricing

**Render Free Tier:**
- Web services: Free (spins down after 15 min inactivity)
- PostgreSQL: 90 days free, then $7/month
- 512MB RAM
- Shared CPU

**Note:** Free tier spins down after inactivity. First request may take 30 seconds to wake up.

**Upgrade to keep always-on:**
- Starter: $7/month (web service)
- Starter PostgreSQL: $7/month

---

## 🧪 Test Deployment

```bash
# Health check
curl https://lunasync-api.onrender.com/health

# Test registration
curl -X POST https://lunasync-api.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test"
  }'
```

---

## 🔄 Auto-Deploy

Render auto-deploys on every push to `main`:

```bash
git add .
git commit -m "Update API"
git push origin main
```

---

## 🐛 Troubleshooting

**Build fails:**
- Check logs: Dashboard → Your Service → **"Logs"**
- Verify `Root Directory` is set to `backend`

**Database connection fails:**
- Use **Internal Database URL** (not External)
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:5432/dbname`

**Free tier spins down:**
- Expected behavior on free tier
- Upgrade to Starter ($7/mo) for always-on
- OR use a cron job to ping every 10 minutes

**502 errors:**
- Ensure backend listens on `process.env.PORT` (Render assigns this)

---

## 📊 Monitor

Render provides:
- Real-time logs
- CPU/Memory metrics
- Request analytics
- Custom alerts

---

## ⚡ Keep Free Tier Awake (Optional)

Use a free cron service to ping your API every 10 minutes:

**Option 1: cron-job.org**
1. Go to https://cron-job.org
2. Create job: `GET https://lunasync-api.onrender.com/health`
3. Schedule: Every 10 minutes

**Option 2: UptimeRobot**
1. Go to https://uptimerobot.com
2. Add monitor: `https://lunasync-api.onrender.com/health`
3. Interval: 5 minutes

---

## 🎉 Done!

Your Luna Sync backend is live on Render!

**Next:** Update mobile app and test all endpoints.
