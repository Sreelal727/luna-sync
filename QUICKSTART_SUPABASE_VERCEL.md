# Luna Sync - Quick Start (Supabase + Vercel)

**Deploy in 15 minutes!** ⚡

---

## 📋 Prerequisites

- GitHub account (you have this ✅)
- Supabase account (free)
- Vercel account (free)

---

## 🚀 Step-by-Step Deployment

### 1️⃣ Setup Supabase Database (5 min)

```bash
1. Go to: https://supabase.com
2. Sign up with GitHub
3. Click "New Project"
   - Name: luna-sync
   - Password: [create strong password]
   - Region: [closest to you]
   - Click "Create"
4. Wait 2-3 minutes for setup
```

**Get Connection String:**
```bash
5. Settings → Database → Connection string
6. Select "Connection pooling" tab
7. Copy the URI (port 6543)
8. Replace [YOUR-PASSWORD] with actual password
9. SAVE THIS STRING!
```

**Run Migration:**
```bash
10. SQL Editor → New query
11. Copy contents of database/schema.sql
12. Paste and Run
13. Table Editor → Verify 6 tables created ✅
```

---

### 2️⃣ Deploy to Vercel (5 min)

```bash
# In your terminal
cd /Users/inadmin/SynCher/luna-sync

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts (press Enter for defaults)
```

**Add Environment Variables:**
```bash
# Go to Vercel dashboard
https://vercel.com/dashboard

# Click your project → Settings → Environment Variables
# Add these:

DATABASE_URL=<your-supabase-connection-string>
NODE_ENV=production
JWT_SECRET=change-this-to-random-32-chars
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

**Redeploy with env vars:**
```bash
vercel --prod
```

---

### 3️⃣ Test Your API (2 min)

```bash
# Replace with your Vercel URL
curl https://your-project.vercel.app/health

# Should return:
{"status":"ok","timestamp":"...","uptime":...}

# Test registration:
curl -X POST https://your-project.vercel.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test"
  }'
```

---

### 4️⃣ Update Mobile App (1 min)

```javascript
// mobile/src/config/api.js
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api/v1'
  : 'https://your-project.vercel.app/api/v1';
```

---

### 5️⃣ Enable Auto-Deploy (2 min)

```bash
1. Vercel dashboard → Your project
2. Settings → Git
3. Connect repository: Sreelal727/luna-sync
4. Production Branch: main
5. Save

✅ Now every push auto-deploys!
```

---

## ✅ Success Checklist

- [ ] Supabase project created
- [ ] 6 tables visible in Supabase Table Editor
- [ ] Vercel project deployed
- [ ] Environment variables added
- [ ] `/health` endpoint returns 200
- [ ] User registration works
- [ ] Mobile app updated with API URL

---

## 🎉 You're Live!

**Your URLs:**
- **API:** `https://your-project.vercel.app`
- **Supabase:** `https://app.supabase.com/project/[id]`
- **GitHub:** `https://github.com/Sreelal727/luna-sync`

**Cost:** $0/month 💰

---

## 🐛 Common Issues

**"Database connection failed"**
→ Use **Connection pooling** URL (port 6543), not direct connection

**"Function size exceeded"**
→ Vercel will automatically handle node_modules

**"CORS error"**
→ Add `CORS_ORIGIN=*` to Vercel env vars and redeploy

**"JWT secret not found"**
→ Add `JWT_SECRET` to Vercel env vars and redeploy

---

## 📚 Full Documentation

See `DEPLOYMENT_SUPABASE_VERCEL.md` for detailed guide.

---

## 🚀 Next Steps

1. Test all API endpoints
2. Add demo data (optional)
3. Deploy mobile app to TestFlight/Play Store
4. Share with users!

**Happy deploying! 🎈**
