# Deploy Luna Sync to Supabase + Vercel

**Perfect combination for serverless deployment!**

- **Supabase:** PostgreSQL database with connection pooling
- **Vercel:** Serverless backend hosting (free tier)

---

## 🚀 Part 1: Set Up Supabase Database (5 minutes)

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Sign up with GitHub (free)
3. Create a new organization (if prompted)

### Step 2: Create New Project
1. Click **"New Project"**
2. Fill in:
   - **Name:** `luna-sync`
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose closest to your users
   - **Plan:** Free (perfect for MVP)
3. Click **"Create new project"**
4. Wait 2-3 minutes for provisioning

### Step 3: Get Database Connection String
1. In Supabase dashboard, click **"Settings"** (gear icon, bottom left)
2. Click **"Database"**
3. Scroll to **"Connection string"**
4. Select **"Connection pooling"** tab (important for Vercel!)
5. Copy the **URI** format connection string
   - It looks like: `postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
6. **Replace `[YOUR-PASSWORD]`** with your actual database password

**Save this connection string** - you'll need it for Vercel!

### Step 4: Run Database Migration

**Option A: Supabase SQL Editor (Easiest)**
1. In Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New query"**
3. Open `/database/schema.sql` from your repo
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **"Run"** (or Cmd/Ctrl + Enter)
7. You should see: "Success. No rows returned"

**Option B: Local psql**
```bash
# Using the connection string from Step 3
psql "postgresql://postgres.xxxxx:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" < database/schema.sql
```

### Step 5: Verify Tables Created
1. In Supabase, click **"Table Editor"** (left sidebar)
2. You should see 6 tables:
   - `users`
   - `cycle_records`
   - `mood_logs`
   - `partner_links`
   - `insights`
   - `subscriptions`

✅ **Supabase setup complete!**

---

## 🚀 Part 2: Deploy Backend to Vercel (5 minutes)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy from Project Root
```bash
cd /Users/inadmin/SynCher/luna-sync
vercel
```

**Follow prompts:**
- Set up and deploy? → **Yes**
- Which scope? → Your username
- Link to existing project? → **No**
- Project name? → `luna-sync` (or press Enter)
- Directory with code? → `./` (press Enter)
- Override settings? → **No**

Vercel will:
1. Detect Node.js project
2. Build and deploy
3. Give you a URL (e.g., `https://luna-sync-xxx.vercel.app`)

### Step 4: Add Environment Variables

**Option A: Via Vercel Dashboard (Recommended)**
1. Go to https://vercel.com/dashboard
2. Click your **"luna-sync"** project
3. Click **"Settings"** tab
4. Click **"Environment Variables"**
5. Add these variables:

```bash
NODE_ENV=production
DATABASE_URL=<paste-your-supabase-connection-string-from-part-1-step-3>
JWT_SECRET=your-super-secret-key-change-to-random-32-chars-minimum
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**IMPORTANT:** Use the **Connection pooling** string from Supabase (port 6543), NOT the direct connection!

**Option B: Via CLI**
```bash
vercel env add DATABASE_URL
# Paste your Supabase connection string when prompted
# Select: Production, Preview, Development

vercel env add JWT_SECRET
# Enter your secret key
# Select: Production, Preview, Development

# Repeat for other variables...
```

### Step 5: Redeploy with Environment Variables
```bash
vercel --prod
```

### Step 6: Test Your Deployment
```bash
# Replace with your Vercel URL
curl https://luna-sync-xxx.vercel.app/health

# Expected response:
# {"status":"ok","timestamp":"...","uptime":...}
```

✅ **Backend deployed to Vercel!**

---

## 📱 Part 3: Update Mobile App

Update the API URL in your mobile app:

```javascript
// mobile/src/config/api.js
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api/v1'
  : 'https://luna-sync-xxx.vercel.app/api/v1';  // <-- Your Vercel URL

export default apiClient;
export { API_BASE_URL };
```

---

## 🧪 Test Your Full API

Run the test script:

```bash
cd /Users/inadmin/SynCher/luna-sync
./test-railway-api.sh https://luna-sync-xxx.vercel.app
```

Or test manually:

```bash
# Health check
curl https://luna-sync-xxx.vercel.app/health

# Register user
curl -X POST https://luna-sync-xxx.vercel.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test"
  }'

# Login
curl -X POST https://luna-sync-xxx.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 💰 Pricing

**Supabase Free Tier:**
- 500 MB database space
- Unlimited API requests
- 50,000 monthly active users
- 2 GB file storage
- Perfect for MVP!

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Serverless functions
- Perfect for APIs!

**Total cost: $0/month** 🎉

---

## 🔄 Auto-Deploy on Git Push

### Enable Vercel GitHub Integration
1. Go to https://vercel.com/dashboard
2. Click your project → **"Settings"** → **"Git"**
3. Connect your GitHub repo: `Sreelal727/luna-sync`
4. Enable: **"Production Branch: main"**

Now every push to `main` auto-deploys! 🚀

---

## 🐛 Troubleshooting

### "Function Exceeded Maximum Size"
- **Cause:** node_modules too large
- **Fix:** Add `.vercelignore`:
```bash
echo "node_modules" > .vercelignore
```

### Database Connection Timeout
- **Cause:** Using direct connection instead of pooler
- **Fix:** Ensure you're using the **Connection pooling** URL from Supabase (port 6543)

### CORS Errors
- **Fix:** Ensure `CORS_ORIGIN=*` in Vercel environment variables
- Or set specific domain: `CORS_ORIGIN=https://yourdomain.com`

### Cold Start Delays
- **Normal:** First request after inactivity takes 2-5 seconds
- **Minimize:** Use Vercel Pro ($20/mo) for faster cold starts
- **Or:** Use a free cron job to ping every 5 minutes (UptimeRobot)

### JWT Secret Not Found
- **Fix:** Add `JWT_SECRET` in Vercel dashboard → Settings → Environment Variables
- Redeploy: `vercel --prod`

---

## 📊 Monitor Your Deployment

**Vercel Analytics:**
- Go to dashboard → Your project → **"Analytics"**
- View request logs, errors, and performance

**Supabase Monitoring:**
- Go to Supabase → **"Database"** → **"Usage"**
- View connection count, queries, storage

---

## 🎯 Performance Tips

1. **Use Supabase Connection Pooler:** Port 6543 (not 5432)
2. **Minimize cold starts:** Keep functions small
3. **Enable caching:** Add HTTP cache headers (optional)
4. **Monitor logs:** Check Vercel function logs regularly

---

## ✅ Deployment Checklist

- [ ] Supabase project created
- [ ] Database schema migrated (6 tables)
- [ ] Connection pooling URL copied
- [ ] Vercel project deployed
- [ ] Environment variables added to Vercel
- [ ] API health endpoint returns 200 OK
- [ ] User registration works
- [ ] Mobile app API URL updated
- [ ] GitHub auto-deploy enabled

---

## 🎉 You're Live!

**Your Stack:**
- ✅ **Database:** Supabase PostgreSQL
- ✅ **Backend:** Vercel Serverless
- ✅ **Auto-deploy:** GitHub → Vercel
- ✅ **Cost:** $0/month

**API URL:** `https://luna-sync-xxx.vercel.app`

---

## 📞 Support Links

- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Supabase Discord:** https://discord.supabase.com
- **Vercel Discord:** https://discord.gg/vercel

---

**Need help?** Check logs:
- Vercel: Dashboard → Project → Functions → View logs
- Supabase: Dashboard → Database → Logs
