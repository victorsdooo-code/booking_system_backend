# Render Deployment Setup

## ✅ LATEST FIX (2026-03-22 16:55)

**Issue:** Backend deployed but returned 404 for all API calls

**Root Cause:** 
- `middleware/authenticateAdmin.js` exported function incorrectly
- `server.js` imported middleware incorrectly (got object instead of function)
- Route registration had duplicate auth middleware

**Fixed:**
- Updated middleware to export `{ authenticateAdmin, ADMIN_TOKEN }`
- Removed duplicate auth from server.js (auth already in routes/admin.js)
- All 26 admin endpoints now working with `X-Admin-Token` header

**Auto-deploy will trigger after push** - Check logs for "Server running on port 3000"

---

## ⚠️ CRITICAL: After Pushing Code

**BEFORE deploying, ensure MONGODB_URI is set in Render:**

1. Go to Render Dashboard → Your Service → Environment
2. Verify `MONGODB_URI` is set to your MongoDB Atlas connection string
3. Click "Manual Deploy" to trigger a new deployment
4. Check logs - you should see "✅ Connected to MongoDB"

**If MONGODB_URI is missing, the server will fail to start with a clear error message.**

---

## 1. Connect to GitHub Repo

1. Go to: https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect repository: `booking_system_backend`
4. Or update existing service to use this repo

## 2. Configure Settings

- **Name:** booking-system-backend
- **Region:** Oregon (us-west-2)
- **Branch:** main
- **Root Directory:** (leave blank)
- **Build Command:** `npm install`
- **Start Command:** `node server.js`

## 3. Add Environment Variables

Click "Environment" tab → Add these variables:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://victorsdooo_db_user:LPIf14ooF0ZwvGR1@cluster0.k1nsfh2.mongodb.net/qingyiu_clinic?retryWrites=true&w=majority` |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `ADMIN_PASSWORD` | `admin123` |

## 4. Deploy

- Click "Manual Deploy"
- Wait 2-3 minutes
- Check logs for "Server running on port 3000"

## 5. Verify

Test endpoint:
```bash
curl https://booking-system-backend-XXXX.onrender.com/api/admin/clinics -H "X-Admin-Token: admin123"
```

Should return: `{"success":true,"clinics":[...]}`
