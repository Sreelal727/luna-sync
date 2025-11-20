# Deploy Luna Sync to Railway (Free Tier)

Railway is the **easiest and fastest** way to deploy Luna Sync with PostgreSQL.

---

## 🚀 Quick Deploy (5 Minutes)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (free)
3. Verify your account

### Step 2: Deploy from GitHub

**Option A: One-Click Deploy**
1. Go to https://railway.app/new
2. Click **"Deploy from GitHub repo"**
3. Select `Sreelal727/luna-sync`
4. Railway will automatically detect the project

**Option B: Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
cd /Users/inadmin/SynCher/luna-sync
railway link

# Deploy
railway up
```

### Step 3: Add PostgreSQL Database
1. In Railway dashboard, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway automatically creates the database
3. It will auto-inject `DATABASE_URL` into your backend

### Step 4: Set Environment Variables
1. Click on your **backend service**
2. Go to **"Variables"** tab
3. Add these variables:

```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-key-min-32-characters-long-change-this
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

**Note:** Railway automatically provides `DATABASE_URL` from the PostgreSQL service.

### Step 5: Run Database Migration
1. In Railway, click your **Postgres service**
2. Click **"Data"** tab → **"Query"**
3. Copy and paste the contents of `database/schema.sql`
4. Click **"Execute"**

### Step 6: Deploy!
1. Railway will automatically build and deploy
2. Click **"Generate Domain"** to get a public URL
3. Your API will be live at: `https://your-app.up.railway.app`

---

## 🔧 Configure Backend for Railway

Your backend is already configured! Railway will:
- ✅ Auto-detect Node.js
- ✅ Run `npm install`
- ✅ Start with `npm start`
- ✅ Inject `DATABASE_URL`

---

## 📱 Update Mobile App

After deployment, update the mobile app API URL:

```javascript
// mobile/src/config/api.js
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api/v1'
  : 'https://your-app.up.railway.app/api/v1';  // <-- Change this
```

---

## 💰 Pricing

**Railway Free Tier:**
- $5 free credits per month
- ~500 hours of uptime
- 512MB RAM
- Shared CPU
- Perfect for MVP testing!

**If you need more:**
- Hobby Plan: $5/month (no credit card for trial)

---

## 🧪 Test Your Deployment

```bash
# Health check
curl https://your-app.up.railway.app/health

# Test registration
curl -X POST https://your-app.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test"
  }'
```

---

## 🐛 Troubleshooting

**Build fails:**
- Check Railway logs in the **"Deployments"** tab
- Ensure `package.json` is in `/backend` directory

**Database connection fails:**
- Verify PostgreSQL service is running
- Check that `DATABASE_URL` is injected (Railway does this automatically)

**502 Bad Gateway:**
- Check that `PORT` is not hardcoded (use `process.env.PORT || 3000`)

**CORS errors:**
- Set `CORS_ORIGIN=*` in environment variables (or specific domain)

---

## 🔄 Auto-Deploy on Git Push

Railway automatically deploys when you push to `main`:

```bash
git add .
git commit -m "Update API"
git push origin main
```

Railway detects the push and redeploys automatically!

---

## 📊 Monitor Your App

Railway provides:
- Real-time logs
- CPU/Memory usage
- Request metrics
- Database queries

Access via: **Dashboard → Your Service → Metrics**

---

## 🎉 You're Done!

Your Luna Sync backend is now live on Railway with PostgreSQL!

**Next steps:**
1. Update mobile app with production URL
2. Test all endpoints
3. Share your API with the team

---

**Need help?** Railway docs: https://docs.railway.app
